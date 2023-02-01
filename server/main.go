package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"server/server/models"
	"strings"

	// "sync"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"

	"github.com/google/uuid"
	_ "github.com/googollee/go-socket.io/engineio/transport/websocket"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var allowOriginFunc = func(r *http.Request) bool {
	fmt.Println("HAHA")
	return true
}

type Hub struct {
	pool map[string]map[*websocket.Conn]struct{}
}

func main() {
	app := fiber.New()
	hub := &Hub{
		pool: make(map[string]map[*websocket.Conn]struct{}),
	}

	db, err := gorm.Open(sqlite.Open("test.sqlite"), &gorm.Config{})

	// db.Migrator().DropTable(&User{})
	// db.Migrator().DropTable(&models.MessageObject{})
	db.Migrator().AutoMigrate(&models.MessageObject{})
	db.Migrator().AutoMigrate(&models.User{})
	db.Migrator().AutoMigrate(&models.MatchObject{})
	if err != nil {
		panic(err)
	}

	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	app.Get("/chatmessages/:id", func(c *fiber.Ctx) error {
		var to_ret = []models.MessageReqObject{}
		chat_id := c.Params("id")
		db.Model(&models.MessageObject{}).Select("chat_id", "to", "from", "body").Where("chat_id = ?", chat_id).Order("created_at ASC").Scan(&to_ret)
		c.JSON(to_ret)
		return c.SendStatus(200)
	})
	app.Get("/ws/:id", websocket.New(func(c *websocket.Conn) {
		fmt.Println(c.Params("id"))
		fmt.Println(c.LocalAddr())
		fmt.Println(c.RemoteAddr())

		var (
			mt  int
			msg []byte
			err error
		)

		val, ok := hub.pool[c.Params("id")]
		if ok {
			val[c] = struct{}{}
		} else {
			hub.pool[c.Params("id")] = make(map[*websocket.Conn]struct{})
			hub.pool[c.Params("id")][c] = struct{}{}
		}

		// fmt.Println("POOL", hub.pool)
		for {
			if mt, msg, err = c.ReadMessage(); err != nil {
				fmt.Println("Read:", err)
				if strings.Contains(err.Error(), "close") {
					delete(hub.pool[c.Params("id")], c)
				}
				break
			}

			// fmt.Println("MT: ", mt)
			// fmt.Printf("recv: %s\n", msg)

			msg_to_create := &models.MessageReqObject{}
			// fmt.Printf("MSG %s\n", msg)
			err := json.Unmarshal([]byte(msg), &msg_to_create)
			if err != nil {
				fmt.Println("JSON parse error")
			}

			to_insert := &models.MessageObject{
				Chat_id: msg_to_create.Chat_id,
				To:      msg_to_create.To,
				From:    msg_to_create.From,
				Body:    msg_to_create.Body,
			}

			tx := db.Model(&models.MessageObject{}).Create(&to_insert)
			if tx.Error != nil {
				fmt.Println("Failed to add message to DB")
			}
			fmt.Println(msg_to_create)

			for k, _ := range hub.pool[c.Params("id")] {
				if err = k.WriteMessage(mt, msg); err != nil {

					fmt.Println("write", err)
					break
				}

			}
		}

	}))

	app.Get("/matchinfo/:id", func(c *fiber.Ctx) error {
		to_lookup := c.Params("id")
		to_ret := &models.UserReqObject{}

		db.Model(&models.User{}).Select("name", "interests", "serious", "nightlife").Where("unique_id = ?", to_lookup).Scan(&to_ret)
		c.JSON(to_ret)
		return c.SendStatus(200)
	})
	app.Post("/match", func(c *fiber.Ctx) error {
		unpack := &models.MatchReqObject{}
		err := c.BodyParser(&unpack)
		if err != nil {
			fmt.Println("Failed to parse req object")
			return c.SendStatus(400)
		}
		looked_up_user := &models.User{}
		tx := db.Model(&models.User{}).Where("unique_id=?", unpack.Id_to_lookup).Find(&looked_up_user)
		if tx.Error != nil {
			fmt.Println("Couldnt find user to lookup")
			return c.SendStatus(400)
		}

		to_create := &models.MatchObject{
			Unique_id:   uuid.New().String(),
			First_uuid:  unpack.User_id,
			Second_uuid: unpack.Id_to_lookup,
			First_name:  unpack.Name,
			Second_name: looked_up_user.Name,
		}

		tx = db.Model(&models.MatchObject{}).Create(&to_create)
		if tx.Error != nil {
			fmt.Println("Failed to create Match Object")
			return c.SendStatus(500)
		}

		c.JSON(&to_create)

		return c.SendStatus(200)
	})

	app.Post("/unmatch/:id", func(c *fiber.Ctx) error {
		id_to_unmatch := c.Params("id")
		fmt.Println("UNMATCH", id_to_unmatch)
		deleted := &models.MatchObject{}
		tx := db.Model(&models.MatchObject{}).Where("unique_id = ?", id_to_unmatch).Delete(&deleted)
		if tx.Error != nil {
			fmt.Println("Failed to delete match object")
		}

		var chats_to_delete []models.MessageObject
		tx = db.Model(&models.MessageObject{}).Where("chat_id = ?", deleted.Unique_id).Delete(&chats_to_delete)
		if tx.Error != nil {
			fmt.Println("Failed to delete messages ")
		}

		return c.SendStatus(200)
	})

	app.Get("/allmatches/:userid", func(c *fiber.Ctx) error {
		user_id := c.Params("userid")
		fmt.Println(user_id)

		var to_ret []models.MatchObject

		tx := db.Model(&models.MatchObject{}).Where("first_uuid = ? OR second_uuid = ?", user_id, user_id).Scan(&to_ret)
		if tx.Error != nil {
			fmt.Println("Failed to get matches")
			return c.SendStatus(500)
		}
		fmt.Println(to_ret)
		c.JSON(to_ret)
		return c.SendStatus(200)
	})

	app.Post("/signup", func(c *fiber.Ctx) error {
		unpack := &models.UserReqObject{}
		err := c.BodyParser(&unpack)
		fmt.Println(unpack)
		if err != nil {
			fmt.Println("Problem unpacking req body object")
			return c.SendStatus(500)
		}

		//create unique identifier
		id := uuid.New()

		user_to_add := &models.User{
			Name:      unpack.Name,
			Unique_id: id.String(),
			Interests: unpack.Interests,
			Nightlife: unpack.Nightlife,
			Serious:   unpack.Serious,
		}
		tx := db.Model(&models.User{}).Create(user_to_add)
		if tx.Error != nil {
			fmt.Println("Failed to create object")
			c.SendStatus(500)
		}
		c.JSON(user_to_add)
		return c.SendStatus(200)
	})

	app.Listen(":5000")

}
