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
    var friends = new Friends();
    //TODO REMOVE FILLER BELOW
    friends.SetFriends({
        sam: 0, //FILLER
        ed: 1, //FILLER
    })
    friends.SetMeUid(100); //FILLER
    //TODO set friends here from matts login thing

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

    var dropZone = document.getElementById('drop-zone');

    dropZone.ondrop = function(e) {
        e.preventDefault();
        this.className = 'upload-drop-zone';
        ws.send(JSON.stringify({
            action: "share-files",
            toUid: document.getElementById('uid').value,
            fromUid: document.getElementById('sesid').value,
            files: e.dataTransfer.files,
        }))
    }

    dropZone.ondragover = function(e) {
        this.className = 'upload-drop-zone drop';
        console.log("DRAG OVER: ", e)
        return false;
    }

    dropZone.ondragleave = function() {
        this.className = 'upload-drop-zone';
        return false;
    }

    //Set global socket
    var uid = document.getElementById('userid').value
    var query = "?userid=" + uid

    globalWs = new WebSocket("ws://localhost:8080/mngmt/connect"+query);
    globalWs.onopen = function(evt) {
        print("OPEN GLOBAL");
        ws.send(JSON.stringify({
            action: "user-connected",
            fromUid: document.getElementById('uid').value,
        }))
    }
    globalWs.onclose = function(evt) {
        print("CLOSE GLOBAL");
        //TODO gray out screen and say it has been closed
        globalWs = null;
    }
    globalWs.onmessage = function(evt) {
        evt = JSON.parse(evt);
        print("RESPONSE: " + evt.data);
        switch (evt.data.action) {
            case "user-disconnected":
                //msg sent by server when user disconnects
                //notification that user is no long online
                console.log("User Disconnect", evt.data)
                if(friends.IsFriendAndIsMe(evt.data.fromUid, evt.data.toUid)) {
                    //if this uid is my friend
                    // TODO change online to offline for user
                } else {
                    console.log("INFO: no friends for user-disconnected.")
                }

            case "user-connected":
                //msg sent by server when user connects
                //notification that user has is now online
                console.log("User Connected", evt.data)
                if(friends.IsFriendAndIsMe(evt.data.fromUid, evt.data.toUid)) {
                    //if this uid is my friend
                    // TODO change online to online for user
                } else {
                    console.log("INFO: no friends for user-connected.")
                }

            case "share-files":
                //msg sent to user when "friend" dragged file into dashboard
                //notification about user adding files
                console.log("Share Files:", evt.data);
                if(friends.IsFriendAndIsMe(evt.data.fromUid, evt.data.toUid)) {
                    //if this uid is my friend
                    // TODO show that a file is available for download
                } else {
                    console.log("INFO: no friends for share-files")
                }

            //BELOW ARE USED WHEN CHANGING CONNECTIONS
            // DO NOOOTTTT IMPLEMENT THESE TILL ABOVE ARE FINISHED
            case "request-files":
                //msg sent to user to ask about available files
                //no notification, this is used when changing connections
                console.log("Request Files:", evt.data);
                if(friends.IsFriendAndIsMe(evt.data.fromUid, evt.data.toUid)) {
                    //if this uid is my friend
                    // TODO Return available files
                    //  - action on return = "available-files"
                } else {
                    console.log("INFO: no friends for request-files.")
                }
            case "available-files": 
                //response from request-files, listing avaiable files
                //no notification, this is used when changing connections
                console.log("Avilable Files:", evt.data);
                if(friends.IsFriendAndIsMe(evt.data.fromUid, evt.data.toUid)) {
                    //TODO add in files to screen ui
                } else {
                    console.log("INFO: no friends for available-files.")
                }
        }
        
    }
    globalWs.onerror = function(evt) {
        print("ERROR: " + evt.data);
    }
});