function GlobalWs() {

}

GlobalWs.prototype.Create = function() {
    if (!globalWs.ws) {
        var uid = document.getElementById('userid').value
        var query = "?userid="+uid;
        globalWs.ws = new WebSocket("ws://localhost:8080/mngmt/connect"+query);
    }

    //Set global socket
    globalWs.ws.onopen = function(evt) {
        print("OPEN GLOBAL");
        globalWs.ws.send(JSON.stringify({
            action: "user-connected",
            fromUid: document.getElementById('userid').value,
        }))
    }
    globalWs.ws.onclose = function(evt) {
        print("CLOSE GLOBAL");
        //TODO gray out screen and say it has been closed
        globalWs = null;
    }
    globalWs.ws.onmessage = function(evt) {
        evt.data = JSON.parse(evt.data);
        print("RESPONSE: " + evt.data);
        switch (evt.data.action) {
            case "user-disconnected":
                //msg sent by server when user disconnects
                //notification that user is no long online
                console.log("User Disconnect", evt.data);
                if(friends.IsFriendAndIsMe(evt.data.fromUid, evt.data.toUid)) {
                    //if this uid is my friend
                    // TODO change online to offline for user
                } else {
                    console.log("INFO: no friends for user-disconnected.")
                }

            case "user-connected":
                //msg sent by server when user connects
                //notification that user has is now online
                console.log("User Connected", evt.data);
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
            case "update-location":
                // Need id, x, y
                console.log("Update Location", evt.data)
                if(friends.IsFriendAndIsMe(evt.data.fromUid, evt.data.toUid)) {
                    //TODO add in files to screen ui
                    updateLocation($("#"+evt.data.domid), evt.data.xloc, evt.data.yloc)
                } else {
                    console.log("INFO: no friends for available-files.")
                }
        }
        
    }
    globalWs.ws.onerror = function(evt) {
        console.log("ERROR: " + evt.data);
    }
}