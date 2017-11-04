package server

import (
	"encoding/json"
)

const (
	ACTION_USER_DISCONNECTED = "user-disconnected"
)

type Msg struct {
	Action string      `json:"action"`
	Data   interface{} `json:"data"`
}

func NewMesage(action string, data interface{}) *Msg {
	msg := Msg{
		Action: action,
		Data:   data,
	}
	return &msg
}

func (m *Msg) MarshalMessage() ([]byte, error) {
	return json.Marshal(m)
}

func UnmarshalMessage(data []byte) (*Msg, error) {
	msg := Msg{}
	err := json.Unmarshal(data, &msg)
	if err != nil {
		return nil, err
	}
	return &msg, nil
}

//used explicitly in management to broadcast to all nodes
// DO NOT USE FOR JSON ANYTHING
// INTERNAL
type BroadcastMsg struct {
	uid  string
	Type int
	Data []byte //will be Msg data if need to be marshalled
}
