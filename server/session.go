package server

import (
	"fmt"
	"html/template"
	"log"
	// "math/rand"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var _ = fmt.Println
var _ = time.Now
var upgrader = websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }} // use default options

type SessionManager struct {
	// Map of peer to peer sessions for data
	// 		Key   --> Session ID (ID + ID)
	// 		Value --> Pointer to Connection Pair (echo chamber)
	Sessions    map[string]*Session
	sessionLock sync.RWMutex

	host string
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
	m.host = "ws://localhost:8080"

	return m
}

func (m *SessionManager) SetHost(h string) {
	m.host = h
}

func (m *SessionManager) home(w http.ResponseWriter, r *http.Request) {
	homeTemplate, err := template.New("client.html").ParseFiles(clientTemplate)
	if err != nil {
		fmt.Println("Error rendering home template: ", err.Error())
	}
	homeTemplate.Execute(w, m.host)
}

func (m *SessionManager) login(w http.ResponseWriter, r *http.Request) {
	loginTemplate, err := template.New("login.html").ParseFiles(loginTemplate)
	if err != nil {
		fmt.Println("Error rendering home template: ", err.Error())
	}
	loginTemplate.Execute(w, m.host)
}

func (s *SessionManager) listen(port int) {
	http.HandleFunc("/connect", s.connect)
	fmt.Println(baseDir)
	fs := http.FileServer(http.Dir(baseDir))
	http.Handle("/static/", http.StripPrefix("/static/", fs))
	http.HandleFunc("/", s.home)
	http.HandleFunc("/login", s.login)
}

func (s *SessionManager) Listen(port int) {
	s.listen(port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), nil))
}

func (s *SessionManager) ListenTLS(port int) {
	s.listen(port)
	log.Fatal(http.ListenAndServeTLS(fmt.Sprintf(":%d", port), SSLCert, SSLKey, nil))
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

// Close inactive sessions
func (sm *SessionManager) Manage() {
	ticker := time.NewTicker(time.Second * 5)
	for _ = range ticker.C {
		for _, s := range sm.Sessions {
			if !s.ConnectionOne.alive && !s.ConnectionTwo.alive {
				if s.lastEmpty.Before(time.Now().Add(-10 * time.Second)) {
					fmt.Println("DELETE")
					s.Close()
					sm.sessionLock.Lock()
					fmt.Printf("Session %s was removed. No users\n", s.SessionID)
					delete(sm.Sessions, s.SessionID)
					sm.sessionLock.Unlock()
				}
			} else {
				s.lastEmpty = time.Now()
			}
		}
	}
}

type Session struct {
	SessionID     string
	ConnectionOne *Connection
	ConnectionTwo *Connection

	lastEmpty time.Time
}

func NewSession() *Session {
	s := new(Session)
	s.ConnectionOne = NewBlankConnection()
	s.ConnectionTwo = NewBlankConnection()

	return s
}

func (s *Session) Status() string {
	one := fmt.Sprintf("  Connection A: %s, Alive: %t", s.ConnectionOne.ID, s.ConnectionOne.alive)
	two := fmt.Sprintf("  Connection B: %s, Alive: %t", s.ConnectionTwo.ID, s.ConnectionTwo.alive)
	return fmt.Sprintf("-- SessionID : %s --\n%s\n%s\n-- %s --", s.SessionID, one, two, s.lastEmpty)
}

func (s *Session) Close() {
	s.ConnectionOne.Close()
	s.ConnectionTwo.Close()
}

// Add connection to exisiting connection
func (s *Session) AddConnection(c *Connection) error {
	// Check IDs?
	if s.ConnectionOne.Conn == nil || !s.ConnectionOne.alive {
		s.ConnectionOne.Replace(c)
		go s.ConnectionOne.Echo(s.ConnectionTwo)
		return nil
	}

	if s.ConnectionTwo.Conn == nil || !s.ConnectionTwo.alive {
		s.ConnectionTwo.Replace(c)
		go s.ConnectionTwo.Echo(s.ConnectionOne)
		return nil
	}

	return fmt.Errorf("Both connecitons are already set")
}

type Connection struct {
	Conn  *websocket.Conn
	ID    string
	alive bool

	Quit chan struct{}
}

func NewBlankConnection() *Connection {
	c := new(Connection)
	c.alive = false
	c.Quit = make(chan struct{}, 2)

	return c
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
	defer func() {
        if r := recover(); r != nil {
        	c.alive = false
        	c.Close()
            fmt.Println("Recovered in f", r)
        }
    }()
	c.alive = true
	for {
		select {
		case <-c.Quit:
			// c was closed
			return
		default:
		}
		mt, message, err := c.Conn.ReadMessage()
		//fmt.Println("READ: ", string(message))
		if err != nil {
			// It's closed
			c.alive = false
			// Probably should manage this better
			time.Sleep(1 * time.Second)
			log.Println(err)
			continue
		} else {
			c.alive = true
		}

		// Partner not there
		if con.Conn == nil {
			time.Sleep(1 * time.Second)
			log.Println("Nil partner")
			continue
		}

		err = con.Conn.WriteMessage(mt, message)
		//fmt.Println("WRITE: ", string(message))
		if err != nil {
			// Probably should manage this better
			time.Sleep(1 * time.Second)
			log.Println(err)
			continue
		}
	}
}

func (c *Connection) Close() {
	if c.Conn != nil {
		c.Conn.Close()
	}
	c.Quit <- struct{}{}
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
