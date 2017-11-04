var textFile = null;
var output = document.getElementById("output");
var input = document.getElementById("input");
var friends = new Friends();
var globalWs = new GlobalWs();

window.addEventListener("load", function(evt) {

    var dropZone = document.getElementById('drop-zone');

    dropZone.ondrop = function(e) {
        e.preventDefault();
        this.className = 'upload-drop-zone';
        globalWs.ws.send(JSON.stringify({
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


        // $("#friends").append("<p>" + $("#userid").value() + "</p>" ); 
    $("#setuserid").click(function() {
        globalWs.Create();
        $(".idset").hide();
        var uid = document.getElementById('userid').value
        friends.SetMeUid(uid);
        $("#myid").append("<p>" + uid + "</p>");
    });
    $("#addfriendid").click(function() {
        var uid = document.getElementById('friendid').value;
        friends.SetMeUid(uid);
        $("#friends").append("<p>" + uid + "</p>");
        document.getElementById('friendid').value = "";
    });
});