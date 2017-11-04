function GlobalWs() {

}

function addFileToDropZone(sesid, fileName, x, y){

    var fileExt = fileName.split('.').pop();
    var fileImgSrc = "/static/img/rodel.png"
    console.log("file Extension is " + fileExt)

    // need to add sources for file extensions here
    switch (fileExt){
        case ".png":
            break
        case ".jpg":
        case ".jpeg":
            break
        case ".pdf":
            break
        case ".docx":
        case ".doc":
            break
    }

    var draggable = $("<div class='draggable' id='img1' shared='true'>").css({ "margin-left" : x, "margin-top" : y});
    var icon = $("<img src='" + fileImgSrc + "' class=icon>");
    var fileName = $("<div class='fileName'>").html(fileName);

    draggable.append(icon);
    draggable.append(fileName);
    draggable.attr("shared", true)

    $("#"+sesid).append(draggable);
    $( ".draggable" ).draggable({ cursor: "crosshair", revert: "invalid"});
}

GlobalWs.prototype.Create = function() {
    if (!globalWs.ws) {
        var uid = document.getElementById('userid').value
        var query = "?userid="+uid;
        globalWs.ws = new WebSocket("ws://localhost:8080/mngmt/connect"+query);
    }

    //Set global socket
    globalWs.ws.onopen = function(evt) {
        console.log("OPEN GLOBAL");
        globalWs.ws.send(JSON.stringify({
            action: "user-connected",
            fromUid: document.getElementById('userid').value,
        }))
    }
    globalWs.ws.onclose = function(evt) {
        console.log("CLOSE GLOBAL");
        //TODO gray out screen and say it has been closed
        globalWs = null;
    }
    globalWs.ws.onmessage = function(evt) {
        data = JSON.parse(evt.data);
        console.log("RESPONSE: " + data);
        switch (data.action) {
            case "user-disconnected":
                //msg sent by server when user disconnects
                //notification that user is no long online
                console.log("User Disconnect", data);
                if(friends.IsFriendAndIsMe(data.fromUid, data.toUid)) {
                    //if this uid is my friend
                    // TODO change online to offline for user
                } else {
                    console.log("INFO: no friends for user-disconnected.")
                }

            case "user-connected":
                //msg sent by server when user connects
                //notification that user has is now online
                console.log("User Connected", data);
                if(friends.IsFriendAndIsMe(data.fromUid, data.toUid)) {
                    //if this uid is my friend
                    // TODO change online to online for user
                } else {
                    console.log("INFO: no friends for user-connected.")
                }

            case "share-files":
                //msg sent to user when "friend" dragged file into dashboard
                //notification about user adding files
                console.log("Share Files:", data);
                if(friends.IsFriendAndIsMe(data.fromUid, data.toUid)) {
                    //if this uid is my friend
                    // TODO show that a file is available for download
                    if($("#" + data.sesid) != undefined) {
                        addFileToDropZone(data.sesid, data.filename, data.xloc, data.yloc)
                    } 

                } else {
                    console.log("INFO: no friends for share-files")
                }

            //BELOW ARE USED WHEN CHANGING CONNECTIONS
            // DO NOOOTTTT IMPLEMENT THESE TILL ABOVE ARE FINISHED
            case "request-files":
                //msg sent to user to ask about available files
                //no notification, this is used when changing connections
                console.log("Request Files:", data);
                if(friends.IsFriendAndIsMe(data.fromUid, data.toUid)) {
                    //if this uid is my friend
                    // download-link
                    // TODO Return available files
                    //  - action on return = "available-files"
                } else {
                    console.log("INFO: no friends for request-files.")
                }
            case "available-files": 
                //response from request-files, listing avaiable files
                //no notification, this is used when changing connections
                console.log("Avilable Files:", data);
                if(friends.IsFriendAndIsMe(data.fromUid, data.toUid)) {
                    //TODO add in files to screen ui
                } else {
                    console.log("INFO: no friends for available-files.")
                }
            case "update-location":
                // Need id, x, y
                console.log("Update Location", data)
                if(friends.IsFriendAndIsMe(data.fromUid, data.toUid)) {
                    //TODO add in files to screen ui
                    updateLocation($("#"+data.domid), data.normlX * dropZone.width(), data.normlY * dropZone.height());
                } else {
                    console.log("INFO: no friends for available-files.")
                }
        }
        
    }
    globalWs.ws.onerror = function(evt) {
        console.log("ERROR: " + evt.data);
    }
}