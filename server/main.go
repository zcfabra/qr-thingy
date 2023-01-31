package main

import (
	"fmt"
	"net/http"
	"strings"

	// "sync"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"

	"github.com/google/uuid"
	_ "github.com/googollee/go-socket.io/engineio/transport/websocket"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Name      string  `json:"name"`
	Unique_id string  `json:"unique_id"`
	Interests string  `json:"interests"`
	Nightlife float32 `json:"nightlife"`
	Serious   float32 `json:"serious"`
}
type UserReqObject struct {
	Name      string  `json:"name"`
	Interests string  `json:"interests"`
	Nightlife float32 `json:"nightlife"`
	Serious   float32 `json:"serious"`
}
type MatchReqObject struct {
	Id_to_lookup string `json:"id_to_lookup"`
	User_id      string `json:"user_id"`
	Name         string `json:"name"`
}

type MatchObject struct {
	gorm.Model
	Unique_id   string `json:"unique_id"`
	First_uuid  string `json:"first_uuid"`
	Second_uuid string `json:"second_uuid"`
	First_name  string `json:"first_name"`
	Second_name string `json:"second_name"`
}

var allowOriginFunc = func(r *http.Request) bool {
	fmt.Println("HAHA")
	return true
}

type Hub struct {
	pool map[string]map[string]*websocket.Conn
}

func main() {
	app := fiber.New()
	hub := &Hub{
		pool: make(map[string]map[string]*websocket.Conn),
	}

	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
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

		hub.pool[c.Params("id")] = make(map[string]*websocket.Conn)
		hub.pool[c.Params("id")][c.RemoteAddr().String()] = c

		fmt.Println("POOL", hub.pool)
		for {
			if mt, msg, err = c.ReadMessage(); err != nil {
				fmt.Println("Read:", err)
				if strings.Contains(err.Error(), "close") {
					hub.pool[c.Params("id")][c.RemoteAddr().String()] = nil
				}
				break
			}

			fmt.Println("MT: ", mt)
			fmt.Printf("recv: %s\n", msg)
			for _, c := range hub.pool[c.Params("id")] {
				if err = c.WriteMessage(mt, msg); err != nil {
					fmt.Println("write", err)
					break
				}

			}
		}

	}))

	db, err := gorm.Open(sqlite.Open("test.sqlite"), &gorm.Config{})
	// db.Migrator().DropTable(&User{})
	// db.Migrator().DropTable(&MatchObject{})
	db.Migrator().AutoMigrate(&User{})
	db.Migrator().AutoMigrate(&MatchObject{})
	if err != nil {
		panic(err)
	}
	app.Post("/match", func(c *fiber.Ctx) error {
		unpack := &MatchReqObject{}
		err := c.BodyParser(&unpack)
		if err != nil {
			fmt.Println("Failed to parse req object")
			return c.SendStatus(400)
		}
		looked_up_user := &User{}
		tx := db.Model(&User{}).Where("unique_id=?", unpack.Id_to_lookup).Find(&looked_up_user)
		if tx.Error != nil {
			fmt.Println("Couldnt find user to lookup")
			return c.SendStatus(400)
		}

		to_create := &MatchObject{
			Unique_id:   uuid.New().String(),
			First_uuid:  unpack.User_id,
			Second_uuid: unpack.Id_to_lookup,
			First_name:  unpack.Name,
			Second_name: looked_up_user.Name,
		}

		tx = db.Model(&MatchObject{}).Create(&to_create)
		if tx.Error != nil {
			fmt.Println("Failed to create Match Object")
			return c.SendStatus(500)
		}

		c.JSON(&to_create)

		return c.SendStatus(200)
	})

	app.Get("/allmatches/:userid", func(c *fiber.Ctx) error {
		user_id := c.Params("userid")
		fmt.Println(user_id)

		var to_ret []MatchObject

		tx := db.Model(&MatchObject{}).Where("first_uuid = ? OR second_uuid = ?", user_id, user_id).Scan(&to_ret)
		if tx.Error != nil {
			fmt.Println("Failed to get matches")
			return c.SendStatus(500)
		}
		fmt.Println(to_ret)
		c.JSON(to_ret)
		return c.SendStatus(200)
	})

	app.Post("/signup", func(c *fiber.Ctx) error {
		unpack := &UserReqObject{}
		err := c.BodyParser(&unpack)
		fmt.Println(unpack)
		if err != nil {
			fmt.Println("Problem unpacking req body object")
			return c.SendStatus(500)
		}

		//create unique identifier
		id := uuid.New()

		user_to_add := &User{
			Name:      unpack.Name,
			Unique_id: id.String(),
			Interests: unpack.Interests,
			Nightlife: unpack.Nightlife,
			Serious:   unpack.Serious,
		}
		tx := db.Model(&User{}).Create(user_to_add)
		if tx.Error != nil {
			fmt.Println("Failed to create object")
			c.SendStatus(500)
		}
		c.JSON(user_to_add)
		return c.SendStatus(200)
	})

	app.Listen(":5000")

}
