function GlobalState() {
	this.Sessions = {}
}

GlobalState.prototype.addSession = function(myid, toid) {
	var sesid = getSession(myid, toid)
	$("#download-container").append(
	`
	 <div class="upload-drop-zone" id="` + sesid + `" toid="` + toid + `" myid="` + myid + `" >
        Just drag and drop files here
     </div>
     `)

	this.activateBox(sesid)

    this.Sessions[sesid] = new Session(myid, toid)
}


function Session(myid, toid) {
	this.myid = myid
	this.toid = toid

	this.Con = new Connection()
	this.Con.connect()
}

GlobalState.prototype.activateBox = function(sesid) {
	var dom = $("#"+sesid)
	dom.droppable({ accept: ".draggable", 
		drop: function(event, ui) {
			console.log("drop");
			$(this).removeClass("border").removeClass("over");
			var dropped = ui.draggable;
			var droppedOn = $(this);
		}
	});
		// $(dropped).detach().css({top: 0,left: 0}).appendTo(droppedOn);      

	ondrop = function(e, ui) {
		e.stopPropagation();
		e.preventDefault();

        this.className = 'upload-drop-zone';

        if(globalWs.ws == undefined) {
        	return
        }

        var element = this
        if(ui != undefined && ui.draggable.attr("shared")) {
        	console.log("Attr already set")
        	globalWs.ws.send(JSON.stringify({
        		action: "update-location",
        		toUid: $(element).attr("toid"),//"b",
        		fromUid: $(element).attr("myid"),//document.getElementById('userid').value,
        		sesid: $(element).attr("id"),
                // files: e.dataTransfer.files,
                domid: ui.draggable.attr("id"),
                xloc: ui.draggable.position().left,
                yloc: ui.draggable.position().top,
            }))
        } else {
        	// New file
        	globalWs.ws.send(JSON.stringify({
        		action: "share-files",
        		toUid: $(element).attr("toid"),//"b",
        		fromUid: $(element).attr("myid"),
        		sesid: $(element).attr("id"),
        		filename: e.dataTransfer.files[0].name,
        		xloc: e.offsetX-35,
                yloc: e.offsetY-35,
        	}))
        	// ui.draggable.attr("shared", true)
        	console.log("Attr set")
        	addFileToDropZone($(element).attr("id"), e.dataTransfer.files[0].name, e.offsetX-35, e.offsetY-35)
        }
	}

    ondragenter = function(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    ondragover = function(e) {
        this.className = 'upload-drop-zone drop';
        console.log("DRAG OVER: ", e)
        return false;
    }

    ondragleave = function() {
        this.className = 'upload-drop-zone';
        return false;
    }

	var dropZone = document.getElementById(sesid);
	dropZone.addEventListener("drop", ondrop, false);
	dropZone.addEventListener("dragenter", ondragenter, false);
    dropZone.addEventListener("dragover", ondragover, false);
}

var globalState = new GlobalState()