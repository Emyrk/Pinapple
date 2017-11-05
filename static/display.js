//$(".draggable").draggable({ cursor: "crosshair", revert: "invalid"});
// $("#drop").droppable({ accept: ".draggable", 
//            drop: function(event, ui) {
//                     console.log("drop");
//                    $(this).removeClass("border").removeClass("over");
//              var dropped = ui.draggable;
//             var droppedOn = $(this);
//             $(dropped).detach().css({top: 0,left: 0}).appendTo(droppedOn);      
             
             
//                 }, 
//           over: function(event, elem) {
//                   $(this).addClass("over");
//                    console.log("over");
//           }
//                 ,
//                   out: function(event, elem) {
//                     $(this).removeClass("over");
//                   }
//                      });
// $("#drop").sortable();

// $("#origin").droppable({ accept: ".draggable", drop: function(event, ui) {
//                     console.log("drop");
//                    $(this).removeClass("border").removeClass("over");
//              var dropped = ui.draggable;
//             var droppedOn = $(this);
//             $(dropped).detach().css({top: 0,left: 0}).appendTo(droppedOn);      
             
             
//                 }});
//                 
//                 
//                  $( function() {
$( function() {
	$( ".draggable" ).draggable({ cursor: "crosshair", revert: "invalid"});
	$("#drop-zone").droppable({ accept: ".draggable", 
		drop: function(event, ui) {
			console.log("drop");
			$(this).removeClass("border").removeClass("over");
			var dropped = ui.draggable;
			var droppedOn = $(this);
		// $(dropped).detach().css({top: 0,left: 0}).appendTo(droppedOn);      


  	}, 
  	over: function(event, elem) {
  		$(this).addClass("over");
  		console.log("over");
  	}
  	,
  	out: function(event, elem) {
  		$(this).removeClass("over");
  	}
  });
});

function startShare() {
  var uid = $('#confirm-share-name').attr("uid")
  $("#confirmShare").removeClass("activeOnly")
  var ses = getSession(globalState.Friends.myid, uid)
  globalState.addSession(uid)
  $("#"+ ses).addClass("activeOnly")
  $("#contain-"+ ses).addClass("activeOnly")

  //reset count for notification
  $("#pal-"+uid).find(".online").html("");

  //request available files
  globalWs.ws.send(JSON.stringify({
      action: "request-files",
      toUid: uid,//"b",
      fromUid: globalState.Friends.myid,
      sesid: getSession(globalState.activeFriend, globalState.Friends.myid),
  }))
  
  // $('.').show();  
  //show box the drag stuff in
  //show pening for friend response
}