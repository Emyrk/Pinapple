package server

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var _ = fmt.Println
var _ = time.Now
var upgrader = websocket.Upgrader{} // use default options

type SessionManager struct {
	// Map of peer to peer sessions for data
	Sessions    map[string]*Session
	sessionLock sync.RWMutex
}

func NewSessionManager() *SessionManager {
	m := new(SessionManager)

	return m
}

func (s *SessionManager) Listen(port int) {
	http.HandleFunc("/connect", s.connect)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), nil))
}

func (s *SessionManager) connect(w http.ResponseWriter, r *http.Request) {
	// con becomes the websocket
	con, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}

	c := NewConnection(con, fmt.Sprintf("%d", rand.Intn(1000)))
	s.sessionLock.Lock()
	ses, ok := s.Sessions["OnlySession"]
	if ok {
		// Session Exists
		ses.AddConnection(c)
	} else {
		ses = NewSession()
		s.Sessions["OnlySession"] = ses
		ses.AddConnection(c)
	}
	s.sessionLock.Unlock()

	var _ = con

}

type Session struct {
	ConnectionOne *Connection
	ConnecitonTwo *Connection
}

func NewSession() *Session {
	s := new(Session)
	return s
}

// func (s *Session) Run() {
// 	mt, message, err := c.ReadMessage()
// 	if err != nil {
// 		log.Println("read:", err)
// 		break
// 	}
// 	log.Printf("%d recv: %s", count, message)
// 	err = c.WriteMessage(mt, message)
// 	if err != nil {
// 		log.Println("write:", err)
// 		break
// 	}
// }

// Add connection to exisiting connection
func (s *Session) AddConnection(c *Connection) error {
	// Check IDs?
	if s.ConnectionOne == nil {
		s.ConnectionOne.Replace(c)
		s.ConnectionOne.Echo(s.ConnecitonTwo)
		return nil
	}

	if s.ConnecitonTwo == nil || s.ConnecitonTwo.ID == c.ID {
		s.ConnecitonTwo.Replace(c)
		s.ConnecitonTwo.Echo(s.ConnectionOne)
		return nil
	}

	return fmt.Errorf("Both connecitons are already set")
}

type Connection struct {
	Conn *websocket.Conn
	ID   string

	Quit chan struct{}
}

func NewConnection(wc *websocket.Conn, id string) *Connection {
	c := new(Connection)
	c.Conn = wc
	c.Quit = make(chan struct{}, 2)

	return c
}

func (c *Connection) Replace(b *Connection) {
	c.Close()
	c.Conn = b.Conn
	c.ID = b.ID
}

func (c *Connection) Echo(con *Connection) {
	for {
		select {
		case <-c.Quit:
			// c was closed
			return
		default:
		}
		mt, message, err := c.Conn.ReadMessage()
		if err != nil {
			// Probably should manage this better
			time.Sleep(1 * time.Second)
			log.Println(err)
			continue
		}
		err = con.Conn.WriteMessage(mt, message)
		if err != nil {
			// Probably should manage this better
			time.Sleep(1 * time.Second)
			log.Println(err)
			continue
		}
	}
}

func (c *Connection) Close() {
	c.Quit <- struct{}{}
	c.Conn.Close()
}

// func echo(w http.ResponseWriter, r *http.Request) {
// 	c, err := upgrader.Upgrade(w, r, nil)
// 	if err != nil {
// 		log.Print("upgrade:", err)
// 		return
// 	}
// 	defer c.Close()
// 	for {
// 		mt, message, err := c.ReadMessage()
// 		if err != nil {
// 			log.Println("read:", err)
// 			break
// 		}
// 		log.Printf("%d recv: %s", count, message)
// 		err = c.WriteMessage(mt, message)
// 		if err != nil {
// 			log.Println("write:", err)
// 			break
// 		}
// 	}
// }

// func home(w http.ResponseWriter, r *http.Request) {
// 	homeTemplate.Execute(w, "ws://"+r.Host+"/echo")
// }

// func main() {
// 	flag.Parse()
// 	log.SetFlags(0)
// 	http.HandleFunc("/echo", echo)
// 	http.HandleFunc("/", home)
// 	log.Fatal(http.ListenAndServe(*addr, nil))
// }
