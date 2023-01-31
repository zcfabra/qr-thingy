package main

import (
	"fmt"
	"server/server/models"
	"time"

	"github.com/go-co-op/gocron"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	db, err := gorm.Open(sqlite.Open("../test.sqlite"), &gorm.Config{})
	if err != nil {
		panic("Couldnt connect to DB")
	}

	s := gocron.NewScheduler(time.UTC)
	s.Every(30).Minutes().Do(func() {
		fmt.Println("Separating Wheat from Chaff")
		// db.Model(&models.MatchObject{}).Where("created_at < ").Delete()
		var rows []models.MatchObject

		yesterday := time.Now().Add(-24 * time.Hour)
		tx := db.Model(&models.MatchObject{}).Where("created_at < ?", yesterday).Delete(&rows)
		if tx.Error != nil {
			fmt.Println("FAILED TO DELETE")
		}

		for _, v := range rows {
			id := v.Unique_id
			var chats []models.MessageObject

			tx := db.Model(&models.MessageObject{}).Where("chat_id = ?", id).Delete(&chats)
			if tx.Error != nil {
				fmt.Printf("Failed to delete chats with chat_id %s", id)
			}
		}
	})
	s.StartAsync()
	fmt.Println("Done")
	for {
	}

}
