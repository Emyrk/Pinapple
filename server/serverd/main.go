package main

import (
	"flag"
	//"html/template"
	//"log"
	// "net/http"

	"github.com/Emyrk/Pinapple/server"
	// "github.com/gorilla/websocket"
)

var addr = flag.Int("addr", 8080, "http service address")

func main() {
	flag.Parse()
	sm := server.NewSessionManager()
	go sm.Listen(*addr)
	go sm.Manage()
	Control(sm)
}
