package server

import (
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

const (
	REQUEST_ACTION_CONNECT = "connect"

	RESPONSE_ACTION_KILL = "kill"
)

type ManagementHandler struct {
	Clients    map[string]*ManagementClient
	clientLock sync.RWMutex

	broadcast chan *BroadcastMsg
}

func NewManagementHandler() *ManagementHandler {
	m := ManagementHandler{}
	m.Clients = make(map[string]*ManagementClient, 5)
	m.broadcast = make(chan *BroadcastMsg, 1000)
	go m.serveBroadcast()
	return &m
}

func (m *ManagementHandler) AddBroadcast(uid string, t int, data []byte) { //t = type
	m.broadcast <- &BroadcastMsg{
		uid:  uid,
		Type: t,
		Data: data,
	}
}

func (m *ManagementHandler) Listen(port int) {
	http.HandleFunc("/mngmt/connect", m.connect)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), nil))
}

func (m *ManagementHandler) connect(w http.ResponseWriter, r *http.Request) {
	uid := r.FormValue("userid")

	var _ = uid
	// con becomes the websocket
	con, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("Mgmt: upgrade:", err)
		return
	}

	newClient := ManagementClient{
		uid:   uid,
		conn:  con,
		Alive: true,
	}

	fmt.Println("ADDING CLIENT: ", uid)

	m.clientLock.Lock()

	oldClient, ok := m.Clients[uid]
	if ok {
		//TODO FIX KICKING/KILLING OLD CLIENT
		oldClient.Alive = false
		err := oldClient.conn.Close()
		if err != nil {
			log.Printf("Error closing old client: %s\n", err.Error())
		}
	}
	go newClient.serveIncoming(m.broadcast)
	m.Clients[uid] = &newClient

	m.clientLock.Unlock()
}

func (m *ManagementHandler) serveBroadcast() {
	for {
		select {
		case bcastMsg := <-m.broadcast:
			m.clientLock.RLock()
			for uid, c := range m.Clients {
				if uid != bcastMsg.uid {
					fmt.Println("SENDING TO: ", uid)
					c.SendMsg(bcastMsg)
				} else {
					fmt.Println("NOT: SENDING TO: ", uid)

				}
			}
			m.clientLock.RUnlock()
		}
	}
}

type ManagementClient struct {
	uid   string
	conn  *websocket.Conn
	Alive bool
}

func (m *ManagementClient) SendMsg(msg *BroadcastMsg) {
	err := m.conn.WriteMessage(msg.Type, msg.Data)
	if err != nil {
		log.Printf("ERROR: mngmt: sendMsg uid[%s]: %s\n", m.uid, err.Error())
	}
}

func (m *ManagementClient) serveIncoming(broadcast chan *BroadcastMsg) {
	for m.Alive || m.conn != nil {
		mt, data, err := m.conn.ReadMessage()
		if err != nil {
			time.Sleep(1 * time.Second)
			log.Printf("ERROR: mngmt: serverIncoming uid[%s]: %s\n", m.uid, err.Error())
			continue
		}
		//DONT NEED BECAUSE JUST FORWARDING TO ALL NEIGHBOOR RIGHT NOW
		// msg, err := UnmarshalMessage(message)
		// if err != nil {
		// 	log.Printf("Error: mngmt: serverIncoming: unmarshal msg: %s", err.Error())
		// }

		broadcast <- &BroadcastMsg{
			Type: mt,
			Data: data,
		}
	}
	if m.conn == nil {
		log.Println("INFO: mngmt: serverIncoming: m.conn is nil, closing")
	}
}
