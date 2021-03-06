function GlobalState() {
	this.Sessions = {}
    this.Friends = new Friends()
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
    var myid = this.Friends.myid;
	$("#download-container").append(
	`
	 <div class="upload-drop-zone onlyone" id="` + sesid + `" toid="` + toid + `" myid="` + myid + `" >
        Just drag and drop files here
     </div>
     `)

    $("body").append("<div class='session-container onlyone' id='contain-" + sesid + "'></div>")

	this.activateBox(sesid)

    this.Sessions[sesid] = new Session(this.Friends.myid, toid)

    // Hover Graphics
    $("#"+sesid).droppable({ accept: ".draggable", 
        drop: function(event, ui) {
            dragState = "dropped"
            dragItem = null
            console.log("dropped");
            $(this).removeClass("border").removeClass("over");
            var dropped = ui.draggable;
            var droppedOn = $(this);
        // $(dropped).detach().css({top: 0,left: 0}).appendTo(droppedOn);      


        }, 
        over: function(event, elem) {
            $(this).addClass("over");
            dragState = "pickedup"
            dragItem = elem
            console.log("pickedup");
        }
        ,
        out: function(event, elem) {
            dragState = "dropped"
            dragItem = null
            console.log("dropped")
            $(this).removeClass("over");
        }
    });
}

function Session(myid, toid) {
	this.myid = myid
	this.toid = toid

	this.Con = new Connection()
	this.Con.connect(myid, getSession(myid, toid))
}

var dragState = "drop"
var dragItem = null
var updateCount = 0
var uBuffer = 2

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

    onmousemove = function(e, ui){
        e.stopPropagation();
        e.preventDefault();
        
        updateCount++;

        if(globalWs.ws == undefined) {
        	return
        }

        var element = this
        if(updateCount % uBuffer == 0 && dragItem != undefined && dragItem.draggable.attr("shared") && dragState == "pickedup") {
			//console.log(e)
			
            globalWs.ws.send(JSON.stringify({
                action: "update-location",
                toUid: globalState.activeFriend,//"b",
                fromUid: globalState.Friends.myid,//document.getElementById('userid').value,
                sesid: getSession(globalState.activeFriend, globalState.Friends.myid) ,
                // files: e.dataTransfer.files,
                domid: dragItem.draggable.attr("id"),
                xloc: (e.pageX-35),
                yloc: (e.pageY-35),
                normlX: (e.pageX-35) / window.innerWidth,
                normlY: (e.pageY-35) / window.innerHeight,
            }))

            if(globalState.Friends.Files[globalState.activeFriend] != undefined && globalState.Friends.Files[globalState.activeFriend][dragItem.draggable.attr("filename")] != undefined && dragState == "pickedup") {
                globalState.Friends.Files[globalState.activeFriend][dragItem.draggable.attr("filename")].xLoc =  dragItem.position.left / window.innerWidth
                globalState.Friends.Files[globalState.activeFriend][dragItem.draggable.attr("filename")].yLoc = dragItem.position.top / window.innerHeight
            }
        }
    }

	ondrop = function(e, ui) {
		e.stopPropagation();
		e.preventDefault();

        dragState = "dropped"
        dragItem = null
        console.log("dropped")
        // this.className = 'upload-drop-zone';

        if(globalWs.ws == undefined) {
        	return
        }

        var element = this
        if(ui != undefined && ui.draggable.attr("shared")) {
			console.log(ui.position)
			
            globalWs.ws.send(JSON.stringify({
                action: "update-location",
                toUid: globalState.activeFriend,//"b",
                fromUid: globalState.Friends.myid,//document.getElementById('userid').value,
                sesid: getSession(globalState.activeFriend, globalState.Friends.myid) ,
                // files: e.dataTransfer.files,
                domid: ui.draggable.attr("id"),
                xloc: ui.position.left,
                yloc: ui.position.top,
                normlX: ui.position.left / window.innerWidth,
                normlY: ui.position.top / window.innerHeight,
            }))
            if(globalState.Friends.Files[globalState.activeFriend] != undefined && globalState.Friends.Files[globalState.activeFriend][ui.draggable.attr("filename")] != undefined) {
                globalState.Friends.Files[globalState.activeFriend][ui.draggable.attr("filename")].xLoc =  ui.position.left / window.innerWidth
                globalState.Friends.Files[globalState.activeFriend][ui.draggable.attr("filename")].yLoc = ui.position.top / window.innerHeight
            }
        } else {
			// New file
			
            var nx = e.pageX
			var ny = e.pageY
			
			console.log(nx + "   " + ny)

        	globalWs.ws.send(JSON.stringify({
        		action: "share-files",
        		toUid: globalState.activeFriend,
        		fromUid: globalState.Friends.myid,
        		sesid: getSession(globalState.activeFriend, globalState.Friends.myid),
        		filename: e.dataTransfer.files[0].name,
                file: e.dataTransfer.files[0],
        		xloc: nx,
                yloc: ny,
                normlX: nx / window.innerWidth,
                normlY: ny / window.innerHeight,
        	}))
        	// ui.draggable.attr("shared", true)
        	console.log("Attr set")
            $(element).attr("shared", true)
            globalState.Friends.Files[globalState.activeFriend][e.dataTransfer.files[0].name] = new File(e.dataTransfer.files[0], nx / window.innerWidth, ny / window.innerHeight)

            var sesid = getSession(globalState.Friends.myid, globalState.activeFriend)
        	// addFileToDropZone($(element).attr("id"), e.dataTransfer.files[0].name, e.pageX - 35, e.pageY - 35, true)
            addFileToDropZone(sesid, e.dataTransfer.files[0].name, e.pageX - 35, e.pageY - 35, true)// 
        }
	}

    ondragenter = function(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    ondragover = function(e) {
        // this.className = 'upload-drop-zone drop';
        // console.log("DRAG OVER: ", e)

        
        return false;
    }

    ondragleave = function() {
        // this.className = 'upload-drop-zone';
        return false;
    }


    var dropZone = document.getElementById(sesid);
    dropZone.addEventListener("mousemove", onmousemove, false);
	dropZone.addEventListener("drop", ondrop, false);
	dropZone.addEventListener("dragenter", ondragenter, false);
    dropZone.addEventListener("dragover", ondragover, false);
    return dom
}

var str

  function readBlob(file, opt_startByte, opt_stopByte, func) {
    var start = parseInt(opt_startByte) || 0;
    var stop = parseInt(opt_stopByte) || file.size - 1;

    var reader = new FileReader();

    // If we use onloadend, we need to check the readyState.
    reader.onloadend = function(evt) {
      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
        func(evt.target.result)
      //  document.getElementById('byte_content').textContent = evt.target.result;
       /* document.getElementById('byte_range').textContent = 
            ['Read bytes: ', start + 1, ' - ', stop + 1,
             ' of ', file.size, ' byte file'].join('');*/
      }
    };

    var blob = file.slice(start, stop + 1);
    reader.readAsBinaryString(blob);
  }

function readFile(f) {
    var reader = new FileReader()
    reader.onerror = errorHandler;
    reader.onprogress = updateProgress;
    str = reader.readAsBinaryString(f)
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

function errorHandler(evt) {
switch(evt.target.error.code) {
  case evt.target.error.NOT_FOUND_ERR:
    alert('File Not Found!');
    break;
  case evt.target.error.NOT_READABLE_ERR:
    alert('File is not readable');
    break;
  case evt.target.error.ABORT_ERR:
    break; // noop
  default:
    alert('An error occurred reading this file.');
};
}

var globalState = new GlobalState()