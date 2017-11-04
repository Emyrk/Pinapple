package main

import (
	"bufio"
	"fmt"
	"os"

	"github.com/Emyrk/Pinapple/server"
)

var _ = fmt.Sprintf("")

var HelpText string

// Control function lasts until signal hit
func Control(s *server.SessionManager) {
	scanner := bufio.NewScanner(os.Stdin)
	HelpText = "------------------------------------------    Commands    ------------------------------------------\n"
	AddHelp("|---[command]---|", "|---[text]---|")

	// Commands
	// Add Helps
	AddHelp("h || help", "Display help messages")

	var last string
	var err error
	// Start loop
	for scanner.Scan() {
		err = nil

		cmd := scanner.Text()
		if cmd == "!!" {
			cmd = last
		}
		last = cmd
		//chanList = nil

		switch {
		case cmd == "exit":
			os.Exit(1)
		case cmd == "h":
			fallthrough
		case cmd == "help":
			fmt.Println(HelpText[:len(HelpText)-1])
			fmt.Println("----------------------------------------------------------------------------------------------------")
		case cmd == "s":
			fmt.Println(s.Status())
		default:
			fmt.Printf("No command found\n")
		}
	}
	var _ = err
}

func AddHelp(command string, text string) {
	HelpText += fmt.Sprintf("|   %-30s%s\n", command, text)
}
