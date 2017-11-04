function Connection() {

}

Connection.prototype.connect = function(uid, sesid) {
    if (ws) {
        return false;
    }

    var query = "?userid=" + uid + "&sessionid=" + sesid

    ws = new WebSocket("{{.}}"+query);
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