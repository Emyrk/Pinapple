package server

import ()

const (
	ACTION_USER_DISCONNECTED = "user-disconnected"
)

//used explicitly in management to broadcast to all nodes
// DO NOT USE FOR JSON ANYTHING
// INTERNAL
type BroadcastMsg struct {
	uid  string
	Type int
	Data []byte //will be Msg data if need to be marshalled
}
