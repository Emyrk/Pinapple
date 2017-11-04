package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
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
	// con becomes the websocket
	con, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("Mgmt: upgrade: ", err)
		return
	}

	newClient := ManagementClient{
		uid:   uid,
		conn:  con,
		Alive: true,
	}

	log.Println("ADDING CLIENT: ", uid)

	m.clientLock.Lock()

	oldClient, ok := m.Clients[uid]
	if ok {

		//TODO BROADCAST SWAPPING CLIENT
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
					log.Println("SENDING TO: ", uid)
					c.SendMsg(bcastMsg)
				} else {
					log.Println("NOT: SENDING TO: ", uid)

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
	if m.conn != nil {
		err := m.conn.WriteMessage(msg.Type, msg.Data)
		if err != nil {
			log.Printf("ERROR: mngmt: sendMsg uid[%s]: %s\n", m.uid, err.Error())
		}
	} else {
		log.Println("ERROR: mngmt: sendMsg - conn is nil")
	}
}

func (m *ManagementClient) serveIncoming(broadcast chan *BroadcastMsg) {
	for m.Alive {
		if m.conn == nil {
			break
		}
		mt, data, err := m.conn.ReadMessage()
		if err != nil {
			time.Sleep(1 * time.Second)
			log.Printf("ERROR: mngmt: serverIncoming uid[%s]: %s\n", m.uid, err.Error())
			m.Alive = false
			continue
		}
		//DONT NEED BECAUSE JUST FORWARDING TO ALL NEIGHBOOR RIGHT NOW
		// msg, err := UnmarshalMessage(message)
		// if err != nil {
		// 	log.Printf("Error: mngmt: serverIncoming: unmarshal msg: %s", err.Error())
		// }

		broadcast <- &BroadcastMsg{
			uid:  m.uid,
			Type: mt,
			Data: data,
		}
	}
	if !m.Alive || m.conn == nil {
		log.Println("INFO: mngmt: serverIncoming: m.conn is nil, broadcasting disconnect")
		msg := struct {
			Action  string `json:"action"`
			FromUid string `json:"fromUid"`
		}{
			ACTION_USER_DISCONNECTED,
			m.uid,
		}
		b, err := json.Marshal(msg)
		if err != nil {
			log.Printf("ERROR: mngmt: serverIncoming: failed to marshal failure: %s\n", err.Error())
		}
		broadcast <- &BroadcastMsg{
			Type: 1,
			uid:  m.uid,
			Data: b,
		}
	}
}
