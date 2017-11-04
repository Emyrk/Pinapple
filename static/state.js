function GlobalState() {
	this.Sessions = {}
    this.Friends = new Friends()
    this.Files = {}
    this.activeFriend = ""
}

function File(file, x, y) {
    this.file = file
    this.xLoc = x
    this.yLoc = y
}

GlobalState.prototype.addSession = function(toid) {
	var sesid = getSession(this.Friends.myid, toid)
    if(this.Sessions[sesid]  != undefined) {
        return
    }
	$("#download-container").append(
	`
	 <div class="upload-drop-zone onlyone" id="` + sesid + `" toid="` + toid + `" myid="` + myid + `" >
        Just drag and drop files here
     </div>
     `)

	this.activateBox(sesid)

    this.Sessions[sesid] = new Session(this.Friends.myid, toid)
}


function Session(myid, toid) {
	this.myid = myid
	this.toid = toid

	this.Con = new Connection()
	this.Con.connect(myid, getSession(myid, toid))
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
            var x = ui.draggable.position().left
            var y = ui.draggable.position().top
            var nx = ui.draggable.position().left / dropZone.offsetWidth
            var ny = ui.draggable.position().top / dropZone.offsetHeight
        	globalWs.ws.send(JSON.stringify({
        		action: "update-location",
        		toUid: globalState.activeFriend,//"b",
        		fromUid: globalState.Friends.myid,//document.getElementById('userid').value,
        		sesid: getSession(globalState.activeFriend, globalState.Friends.myid) ,
                // files: e.dataTransfer.files,
                domid: ui.draggable.attr("id"),
                xloc: x,
                yloc: y,
                normlX: nx,
                normlY: ny,
            }))
            globalState.Files[e.dataTransfer.files[0].name].xLoc = nx
            globalState.Files[e.dataTransfer.files[0].name].yLoc = ny
            
        } else {
        	// New file
            var nx = e.offsetX-35
            var ny = e.offsetY-35
        	globalWs.ws.send(JSON.stringify({
        		action: "share-files",
        		toUid: globalState.activeFriend,
        		fromUid: globalState.Friends.myid,
        		sesid: getSession(globalState.activeFriend, globalState.Friends.myid),
        		filename: e.dataTransfer.files[0].name,
        		xloc: nx,
                yloc: ny,
        	}))
        	// ui.draggable.attr("shared", true)
        	console.log("Attr set")
            globalState.Files[e.dataTransfer.files[0].name] = new File(e.dataTransfer.files[0], nx, ny)

        	addFileToDropZone($(element).attr("id"), e.dataTransfer.files[0].name, e.offsetX-35, e.offsetY-35, true)
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
    return dom
}

function updateProgress(evt) {
    // evt is an ProgressEvent.
    if (evt.lengthComputable) {
      var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
      // Increase the progress bar length.
      if (percentLoaded < 100) {
        console.log(percentloaded)
      }
    }
}

var globalState = new GlobalState()