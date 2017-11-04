package main

import (
	"flag"
	//"html/template"
	//"log"
	// "net/http"

	"github.com/Emyrk/Pinapple/server"
	// "github.com/gorilla/websocket"
)

var (
	sarah = flag.Bool("sarah", false, "Sarah use this")
	addr  = flag.Int("addr", 8080, "http service address")
)

func main() {
	flag.Parse()
	if *sarah {
		server.SetBaseDir("/Users/saraartese/desktop/github/pinapple/react/sockets")
	}
	sm := server.NewSessionManager()
	go sm.Listen(*addr)
	go sm.Manage()

	mngmt := server.NewManagementHandler()
	go mngmt.Listen(8000)

	Control(sm)
}
