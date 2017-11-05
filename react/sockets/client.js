function Friends() {

}

Friends.prototype.IsFriendAndIsMe = function(fromUid, toUid) {
    if (!this.people || !this.meUid) {
        return false;
    }
    return this.people[fromUid] && this.meUid == toUid;
}

// Should be object with keys being the peoples uid, and values being the 
// friends objects
Friends.prototype.SetFriends = function(people) {
    this.people = people;
}

Friends.prototype.SetMeUid = function(meUid) {
    this.meUid = meUid;
}

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
    if (this.ws) {
        return false;
    }

    var query = "?userid=" + uid + "&sessionid=" + sesid

    this.ws = new WebSocket(host+"/connect"+query);
    this.ws.onopen = function(evt) {
        // print("OPEN");
        console.log("OPEN")
    }
    this.ws.onclose = function(evt) {
        //print("CLOSE");
        console.log("CLOSE")
        this.ws = null;
    }
    this.ws.onmessage = function(evt) {
        // print("RESPONSE: " + evt.data);
        console.log("RESPONSE: " + evt.data);
        // var link = document.getElementById('downloadlink');
        this.link.href = makeTextFile(evt.data);
        this.link.download = "info.txt";
        // DO SOME ACTION
    }
    this.ws.onerror = function(evt) {
        // print("ERROR: " + evt.data);
        console.log("ERROR: " + evt.data);
    }
    return false;
};

Connection.prototype.setLink = function(link) {
    this.link = link
}

Connection.prototype.send = function(data) {
    if (!this.ws) {
        return false;
    }
    //print("SEND: " + input.value);
    consoel.log("SEND: " + input.value);
    this.ws.send(input.value);
    return true;
}

Connection.prototype.close = function() {
    if (!this.ws) {
        return false;
    }
    this.ws.close();
    return true;
}