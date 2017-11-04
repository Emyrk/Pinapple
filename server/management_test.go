package server_test

import (
	"bytes"
	"fmt"
	"log"
	"net/url"
	"testing"
	"time"

	. "github.com/Emyrk/Pinapple/server"
	"github.com/gorilla/websocket"
)

const (
	// TextMessage denotes a text data message. The text message payload is
	// interpreted as UTF-8 encoded text data.
	TextMessage = 1

	// BinaryMessage denotes a binary data message.
	BinaryMessage = 2

	// CloseMessage denotes a close control message. The optional message
	// payload contains a numeric code and text. Use the FormatCloseMessage
	// function to format a close message payload.
	CloseMessage = 8

	// PingMessage denotes a ping control message. The optional message payload
	// is UTF-8 encoded text.
	PingMessage = 9

	// PongMessage denotes a pong control message. The optional message payload
	// is UTF-8 encoded text.
	PongMessage = 10
)

func TestManagementHandler(t *testing.T) {
	mngmt := NewManagementHandler()
	go mngmt.Listen(8000)

	client1, err := createClient("c1", 8000)
	if err != nil {
		t.Fatalf("Error creating c1: %s", err.Error())
	}
	client2, err := createClient("c2", 8000)
	if err != nil {
		t.Fatalf("Error creating c2: %s", err.Error())
	}

	data := []byte{0, 1, 2, 3, 4}

	mngmt.AddBroadcast(client1.Uid, TextMessage, data)

	time.Sleep(100 * time.Millisecond)

	if len(client1.Msgs) > 0 {
		t.Fatalf("Client1 should not have received broadcast: %d:", len(client1.Msgs))
	}
	if len(client2.Msgs) != 1 {
		t.Fatalf("Client2 should have received broadcast: %d:", len(client2.Msgs))
	}
	if !bytes.Equal(client2.Msgs[0].Msg, data) {
		t.Fatal("Msg not equal")
	}
}

type TestClient struct {
	Uid  string
	Msgs []*TestMsg
	con  *websocket.Conn
}

type TestMsg struct {
	Msg []byte
}

func createClient(uid string, destPort int) (*TestClient, error) {
	c := &TestClient{Uid: uid}
	c.Msgs = []*TestMsg{}

	u := url.URL{Scheme: "ws", Host: fmt.Sprintf("localhost:%d", destPort), Path: "/mngmt/connect"}
	q := u.Query()
	q.Set("userid", uid)
	u.RawQuery = q.Encode()
	fmt.Println("CLIENT: ", u.String())
	con, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		return nil, err
	}
	c.con = con

	go func() {
		for {
			_, data, err := c.con.ReadMessage()
			if err != nil {
				log.Println("read:", err)
				return
			}
			c.Msgs = append(c.Msgs, &TestMsg{data})
		}
	}()
	return c, nil
}

func (c *TestClient) Close() error {
	return c.con.Close()
}
