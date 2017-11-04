var textFile = null;
var output = document.getElementById("output");
var input = document.getElementById("input");
var friends = new Friends();
var globalWs = new GlobalWs();

window.addEventListener("load", function(evt) {
    var dropZone = document.getElementById('drop-zone');

    //TODO STEVE DO THIS    
    $('.jessesaran').click(function () {
        console.log("click");
        $('.mainScreen').hide();
        $('.confirmShare').show();  
        $('.online').removeClass().addClass( "active" );  
    });


    ondrop = function(e, ui) {
        e.stopPropagation();
        e.preventDefault();

        // updateLocation($("#img1"), ui.draggable.position().left, ui.draggable.position().top)
        e.preventDefault();
        this.className = 'upload-drop-zone';

        if(globalWs.ws == undefined) {
            return
        }
        if(ui != undefined && ui.draggable.attr("shared")) {
            console.log("Attr already set")

            normlX = ui.draggable.position().left / dropZone.offsetWidth;
            normlY = ui.draggable.position().top / dropZone.offsetHeight;

            globalWs.ws.send(JSON.stringify({
                action: "update-location",
                toUid: "b",
                fromUid: document.getElementById('userid').value,
                // files: e.dataTransfer.files,
                domid: ui.draggable.attr("id"),
                normlX: normlX,
                normlY: normlY,
            }))
        } else {
            globalWs.ws.send(JSON.stringify({
                action: "share-files",
                toUid: "b",
                fromUid: document.getElementById('userid').value,
                files: e.dataTransfer.files,
            }))
            ui.draggable.attr("shared", true)
            console.log("Attr set")
        }
    }

    ondragenter = function(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    ondragover = function(e) {
        this.className = 'upload-drop-zone drop';
        //console.log("DRAG OVER: ", e)
        return false;
    }

    ondragleave = function() {
        this.className = 'upload-drop-zone';
        return false;
    }

    dropZone.addEventListener("dragenter", ondragenter, false);
    dropZone.addEventListener("dragover", ondragover, false);
    dropZone.addEventListener("drop", ondrop, false);


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
        friends.addFriend(uid)
        $("#friends").append("<p>" + uid + "</p>");
        document.getElementById('friendid').value = "";
    });
});

function updateLocation(dom, x, y) {
    dom.css("margin-left", x)
    dom.css("margin-top", y)
}