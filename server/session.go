package server

import (
	"fmt"
	"log"
	// "math/rand"
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
	// 		Key   --> Session ID (ID + ID)
	// 		Value --> Pointer to Connection Pair (echo chamber)
	Sessions    map[string]*Session
	sessionLock sync.RWMutex
}

func (s *SessionManager) Status() string {
	str := ""
	s.sessionLock.Lock()
	for _, ses := range s.Sessions {
		str += ses.Status() + "\n"
	}
	s.sessionLock.Unlock()

	return str
}

func NewSessionManager() *SessionManager {
	m := new(SessionManager)
	m.Sessions = make(map[string]*Session)

	return m
}

func home(w http.ResponseWriter, r *http.Request) {
	homeTemplate.Execute(w, "ws://"+r.Host+"/connect")
}

func (s *SessionManager) Listen(port int) {
	http.HandleFunc("/connect", s.connect)
	http.HandleFunc("/", home)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), nil))
}

func (s *SessionManager) connect(w http.ResponseWriter, r *http.Request) {
	uid := r.URL.Query().Get("userid")
	sesid := r.URL.Query().Get("sessionid")

	log.Printf("Connect: %s:%s", uid, sesid)
	var _ = uid
	var _ = sesid
	// con becomes the websocket
	con, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}

	// TODO: Replace random with uid/sesid from HTTP
	c := NewConnection(con, uid)
	s.sessionLock.Lock()
	ses, ok := s.Sessions[sesid]
	if ok {
		// Session Exists
		err := ses.AddConnection(c)
		if err != nil {
			log.Println(err)
		} else {
			log.Println("Added to existing session")
		}
	} else {
		// Session does not exists
		ses = NewSession()
		ses.SessionID = sesid
		// Create
		s.Sessions[sesid] = ses
		// Add connection
		err := ses.AddConnection(c)
		if err != nil {
			log.Println(err)
		} else {
			log.Println("Started a new session")
		}
	}
	s.sessionLock.Unlock()

	var _ = con

}

type Session struct {
	SessionID     string
	ConnectionOne *Connection
	ConnecitonTwo *Connection
}

func NewSession() *Session {
	s := new(Session)
	s.ConnectionOne = new(Connection)
	s.ConnecitonTwo = new(Connection)

	return s
}

func (s *Session) Status() string {
	one := fmt.Sprintf("  Connection A: %s", s.ConnectionOne.ID)
	two := fmt.Sprintf("  Connection B: %s", s.ConnecitonTwo.ID)
	return fmt.Sprintf("-- SessionID : %s --\n%s\n%s\n-- --", s.SessionID, one, two)
}

// Add connection to exisiting connection
func (s *Session) AddConnection(c *Connection) error {
	// Check IDs?
	if s.ConnectionOne.Conn == nil {
		s.ConnectionOne.Replace(c)
		go s.ConnectionOne.Echo(s.ConnecitonTwo)
		return nil
	}

	if s.ConnecitonTwo.Conn == nil {
		s.ConnecitonTwo.Replace(c)
		go s.ConnecitonTwo.Echo(s.ConnectionOne)
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
	c.ID = id
	c.Quit = make(chan struct{}, 2)

	return c
}

func (c *Connection) Replace(b *Connection) {
	if c.Conn != nil {
		c.Close()
	}
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
		fmt.Println("READ: ", string(message))
		if err != nil {
			// Probably should manage this better
			time.Sleep(1 * time.Second)
			log.Println(err)
			continue
		}

		// Partner not there
		if con.Conn == nil {
			time.Sleep(1 * time.Second)
			log.Println("Nil partner")
			continue
		}

		err = con.Conn.WriteMessage(mt, message)
		fmt.Println("WRITE: ", string(message))
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
