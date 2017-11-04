function GlobalWs() {

}

function addFileToDropZone(sesid, fileName, x, y, mine){

    var fileExt = fileName.split('.').pop();
    var fileImgSrc = "/static/img/rodel.png"
    console.log("file Extension is " + fileExt)

    // need to add sources for file extensions here

    var fileExtensions = ["ai", "avi", "css", "csv", "dbf", "doc", "dwg", "exe", "fla", "html", "iso", "jpg", "js", "json", "mp3", "mp4", "pdf", "png", "ppt", "psd", "rtf", "svg", "txt", "xls", "xml", "zip"]

    var fileImgSrc = ""
    for (var i = 0; i < fileExtensions.length; i++){
        if (fileExt == fileExtensions[i]){
            fileImgSrc = "/static/img/icons/" + fileExt + ".png"
            console.log("USED EXTENSION")
        } 
    }
    if (fileImgSrc == ""){
        fileImgSrc = "/static/img/icons/unknown.png"
    }

    var domname = fileName.split('.')[0]
    var button = "<button id='" + domname+ "-button' file='" + fileName + "'' sesid='" + sesid + "'>Download</button>"
    if(mine != undefined && mine) {
        button = ""
    }
    var draggable = $("<div class='draggable' id='" + domname + "' shared='true'>").css({ "margin-left" : x, "margin-top" : y});
    var icon = $("<img src='" + fileImgSrc + "' class=icon>" + button);
    var fileName = $("<div class='fileName'>").html(fileName);

    draggable.append(icon);
    draggable.append(fileName);
    draggable.attr("shared", true)

    $("#"+sesid).append(draggable);
    $( ".draggable" ).draggable({ cursor: "crosshair", revert: "invalid"});

    $("#"+domname+"-button").on('click', function() {
        var session = globalState.Sessions[$(this).attr('sesid')]
        if(session != undefined) {
            session.Con.setLink($(this).attr("file"))
        }
        globalWs.ws.send(JSON.stringify({
            action: "ask-download-file",
            toUid: globalState.activeFriend,//"b",
            fromUid: globalState.Friends.myid,//document.getElementById('userid').value,
            sesid: getSession(globalState.activeFriend, globalState.Friends.myid) ,
            
            domid: $(this).attr("file"),
        }))
    })
}

GlobalWs.prototype.Create = function() {
    if (!globalWs.ws) {
        var uid = globalState.Friends.myid
        var query = "?userid="+uid;
        globalWs.ws = new WebSocket("ws://localhost:8080/mngmt/connect"+query);
    }

    //Set global socket
    globalWs.ws.onopen = function(evt) {
        console.log("OPEN GLOBAL");
        globalWs.ws.send(JSON.stringify({
            action: "user-connected",
            fromUid: globalState.Friends.myid,
        }))
    }
    globalWs.ws.onclose = function(evt) {
        console.log("CLOSE GLOBAL");
        //TODO gray out screen and say it has been closed
        globalWs = null;
    }
    globalWs.ws.onmessage = function(evt) {
        data = JSON.parse(evt.data);
        var dropZone = $("#"+data.sesid)
        console.log("RESPONSE: " + data);
        switch (data.action) {
            case "user-disconnected":
                //msg sent by server when user disconnects
                //notification that user is no long online
                console.log("User Disconnect", data);
                if(globalState.Friends.IsFriendAndIsMe(data.fromUid, data.toUid)) {
                    //if this uid is my friend
                    // TODO change online to offline for user
                } else {
                    console.log("INFO: no friends for user-disconnected.")
                }
                break

            case "user-connected":
                //msg sent by server when user connects
                //notification that user has is now online
                console.log("User Connected", data);
                if(globalState.Friends.IsFriendAndIsMe(data.fromUid, data.toUid)) {
                    //if this uid is my friend
                    // TODO change online to online for user
                } else {
                    console.log("INFO: no friends for user-connected.")
                }

            case "share-files":
                //msg sent to user when "friend" dragged file into dashboard
                //notification about user adding files
                console.log("Share Files:", data);
                if(globalState.Friends.IsFriendAndIsMe(data.fromUid, data.toUid)) {
                    //if this uid is my friend
                    // TODO show that a file is available for download
                    if($("#" + data.sesid) != undefined) {
                        addFileToDropZone(data.sesid, data.filename, data.xloc, data.yloc)
                    } 

                } else {
                    console.log("INFO: no friends for share-files")
                }
                break

            // Request the file over data connection
            case "ask-download-file":
                console.log("Request Files:", data);
                if(globalState.Friends.IsFriendAndIsMe(data.fromUid, data.toUid)) {
                   console.log(data)
                   var session = globalState.Sessions["" + data.sesid]
                   if(session != undefined) {
                    session.Con.send("HELLO!")
                   }
                } else {
                    console.log("INFO: no friends for request-files.")
                }
                break

            //BELOW ARE USED WHEN CHANGING CONNECTIONS
            // DO NOOOTTTT IMPLEMENT THESE TILL ABOVE ARE FINISHED
            case "request-files":
                //msg sent to user to ask about available files
                //no notification, this is used when changing connections
                console.log("Request Files:", data);
                if(globalState.Friends.IsFriendAndIsMe(data.fromUid, data.toUid)) {
                    //if this uid is my friend
                    // download-link
                    // TODO Return available files
                    //  - action on return = "available-files"
                } else {
                    console.log("INFO: no friends for request-files.")
                }
                break
            case "available-files": 
                //response from request-files, listing avaiable files
                //no notification, this is used when changing connections
                console.log("Avilable Files:", data);
                if(globalState.Friends.IsFriendAndIsMe(data.fromUid, data.toUid)) {
                    //TODO add in files to screen ui
                } else {
                    console.log("INFO: no friends for available-files.")
                }
                break
            case "update-location":
                // Need id, x, y
                console.log("Update Location", data)
                if(globalState.Friends.IsFriendAndIsMe(data.fromUid, data.toUid)) {
                    //TODO add in files to screen ui
                    var filename = data.domid
                    updateLocation($("#"+filename), data.normlX * dropZone.width(), data.normlY * dropZone.height());
                } else {
                    console.log("INFO: no friends for available-files.")
                }
                break
        }
        
    }
    globalWs.ws.onerror = function(evt) {
        console.log("ERROR: " + evt.data);
    }
}