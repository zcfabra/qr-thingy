package models

import "gorm.io/gorm"

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

type MessageReqObject struct {
	To      string `json:"to"`
	From    string `json:"from"`
	Chat_id string `json:"chat_id"`
	Body    string `json:"body"`
}
type MessageObject struct {
	gorm.Model
	To      string `json:"to"`
	From    string `json:"from"`
	Chat_id string `json:"chat_id"`
	Body    string `json:"body"`
}
