function Connection() {

}

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

Connection.prototype.connect = function(uid, sesid) {
    if (ws) {
        return false;
    }

    var query = "?userid=" + uid + "&sessionid=" + sesid

    ws = new WebSocket("localhost:8080/connect"+query);
    ws.onopen = function(evt) {
        // print("OPEN");
        console.log("OPEN")
    }
    ws.onclose = function(evt) {
        //print("CLOSE");
        console.log("CLOSE")
        ws = null;
    }
    ws.onmessage = function(evt) {
        // print("RESPONSE: " + evt.data);
        console.log("RESPONSE: " + evt.data);
        // var link = document.getElementById('downloadlink');
        this.link.href = makeTextFile(evt.data);
        this.link.download = "info.txt";
        // DO SOME ACTION
    }
    ws.onerror = function(evt) {
        // print("ERROR: " + evt.data);
        console.log("ERROR: " + evt.data);
    }
    return false;
};

Connection.prototype.setLink(link) {
    this.link = link
}