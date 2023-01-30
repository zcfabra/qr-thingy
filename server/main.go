package main

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
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

func main() {
	app := fiber.New()
	db, err := gorm.Open(sqlite.Open("test.sqlite"), &gorm.Config{})
	db.Migrator().DropTable(&User{})
	db.Migrator().AutoMigrate(&User{})
	if err != nil {
		panic(err)
	}
	app.Get("/hi", func(c *fiber.Ctx) error {
		id := uuid.New()
		fmt.Println(id.String())
		c.JSON(map[string]interface{}{"data": id.String()})

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
