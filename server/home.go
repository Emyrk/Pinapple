package server

import (
	// "html/template"
	"os"
	"path/filepath"
)

var baseDir = filepath.Join(os.Getenv("GOPATH"), "src", "github.com", "Emyrk", "Pinapple", "react", "sockets")

var testTemplate = filepath.Join(baseDir, "client.html")

func SetBaseDir(dir string) {
	baseDir = dir
	testTemplate = filepath.Join(baseDir, "client.html")
}

// var homeTemplate = template.Must(template.New("").ParseFiles(testTemplate))
/*
var _ = template.Must(template.New("").Parse(`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<script>
console.log("ASDASASD")
var textFile = null;

function makeTextFile (text) {
    var data = new Blob([text], {type: 'text/plain'});

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    return textFile;
}

window.addEventListener("load", function(evt) {

    console.log("Is this loaded?")
    var output = document.getElementById("output");
    var input = document.getElementById("input");
    var ws;

    var print = function(message) {
        var d = document.createElement("div");
        d.innerHTML = message;
        output.appendChild(d);
    };


    //var create = document.getElementById('create'),
   // textbox = document.getElementById('textbox');

    // create.addEventListener('click', function () {
    //     var link = document.getElementById('downloadlink');
    //     link.href = makeTextFile(textbox.value);
    //     link.style.display = 'block';
    // }, false);

    document.getElementById("open").onclick = function(evt) {
        if (ws) {
            return false;
        }

        var uid = document.getElementById('userid').value
        var sesid = document.getElementById('sesid').value
        var query = "?userid=" + uid + "&sessionid=" + sesid

        ws = new WebSocket("{{.}}"+query);
        ws.onopen = function(evt) {
            print("OPEN");
        }
        ws.onclose = function(evt) {
            print("CLOSE");
            ws = null;
        }
        ws.onmessage = function(evt) {
            print("RESPONSE: " + evt.data);
            var link = document.getElementById('downloadlink');
            link.href = makeTextFile(evt.data);
            link.style.display = 'block';
        }
        ws.onerror = function(evt) {
            print("ERROR: " + evt.data);
        }
        return false;
    };

    document.getElementById("send").onclick = function(evt) {
        if (!ws) {
            return false;
        }
        print("SEND: " + input.value);
        ws.send(input.value);
        return false;
    };

    document.getElementById("close").onclick = function(evt) {
        if (!ws) {
            return false;
        }
        ws.close();
        return false;
    };

});

</script>
</head>
<body>
<table>
<tr><td valign="top" width="50%">
<p>Click "Open" to create a connection to the server,
"Send" to send a message to the server and "Close" to close the connection.
You can change the message and send multiple times.
<p>
UserID: <input id="userid" type="text" name="fname"><br>
SessionID: <input id="sesid" type="text" name="lname"><br>
<form>
<button id="open">Open</button>
<button id="close">Close</button>
<p><input id="input" type="text" value="Hello world!">
<button id="send">Send</button>
</form>
<a download="info.txt" id="downloadlink" style="display: none">Download</a>
</td><td valign="top" width="50%">
<div id="output"></div>
</td></tr></table>
</body>
</html>
`))
*/
