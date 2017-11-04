var textFile = null;
var output = document.getElementById("output");
var input = document.getElementById("input");
var friends = new Friends();
var globalWs = new GlobalWs();

window.addEventListener("load", function(evt) {
    globalWs.Create();

    //TODO REMOVE FILLER BELOW
    friends.SetFriends({
        sam: 0, //FILLER
        ed: 1, //FILLER
    })
    friends.SetMeUid(100); //FILLER

    var dropZone = document.getElementById('drop-zone');

    dropZone.ondrop = function(e) {
        e.preventDefault();
        this.className = 'upload-drop-zone';
        globalWs.send(JSON.stringify({
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
});