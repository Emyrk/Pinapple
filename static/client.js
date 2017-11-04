/*************** Start of Facebook Code ***************/

// Called whenever the page is loaded
window.fbAsyncInit = function() {
	FB.init({
		appId      : '360836037704418',
		cookie     : true,
		xfbml      : true,
		version    : 'v2.10'
	});

    FB.AppEvents.logPageView();
      
	// Checks if the user is logged in or not
	FB.getLoginStatus(function(response) {
        //console.log(response);
        
        // if the user is logged in, return a list of their friends
        if (response.status == "connected"){

            var queryString = "/me/friends"

            FB.api(queryString, function(response) {
                console.log(JSON.stringify(response));
                addFriends(response)
            });
        }
    });

};

// Dont worry about this. It does stuff we need but I'm not entirely sure what that is. 
(function(d, s, id){
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement(s); js.id = id;
	js.src = "https://connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Called after the user is logged in (after the Facebook popup window dissapears)
function checkLoginState() {
    FB.getLoginStatus(function(response) {

        console.log(response)

        var queryString = "/me/friends"
        
        FB.api(queryString, function(response) {
            console.log(JSON.stringify(response));
            addFriends(response)
            
        });
    });
  }

function addFriends(response) {
    for(var i = 0; i < response.data.length; i++) {
        globalState.Friends.addFriend(response.data[i].name, response.data[i].id)
    }
}

/*************** End of Facebook Code ***************/


function Friends() {
    this.people = {};
}

Friends.prototype.IsFriendAndIsMe = function(fromUid, toUid) {
    if (!this.people || !this.meUid) {
        return false;
    }
    return this.people[fromUid] && this.meUid == toUid;
}

// Should be object with keys being the peoples uid, and values being the 
// friends objects
Friends.prototype.SetFriends = function(people) {
    this.people = people;
}

Friends.prototype.addFriend = function(person, uid) {
    this.people[uid] = person;
    $("#friendlist").append(`
        <li style="background-image: url(/static/img/maxresdefault.jpg)" class="jessesaran" id="pal-` + uid + `">
            <div class="online"></div>
            <h5> ` + person + `</h5>
        </li>`
    )
}

Friends.prototype.SetMeUid = function(meUid) {
    this.meUid = meUid;
}

function Connection() {

}

var textFile = null;

function makeTextFile (text) {
    var data = new Blob([text], {type: 'text/plain'});

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    return textFile;
}

Connection.prototype.connect = function(uid, sesid) {
    if (this.ws) {
        return false;
    }

    var query = "?userid=" + uid + "&sessionid=" + sesid

    this.ws = new WebSocket("ws://localhost:8080/connect"+query);
    this.ws.onopen = function(evt) {
        // print("OPEN");
        console.log("OPEN")
    }
    this.ws.onclose = function(evt) {
        //print("CLOSE");
        console.log("CLOSE")
        this.ws = null;
    }
    this.ws.onmessage = function(evt) {
        // print("RESPONSE: " + evt.data);
        console.log("RESPONSE: " + evt.data);
        // var link = document.getElementById('downloadlink');
        document.getElementById("hidden-download").href = makeTextFile(evt.data);
        document.getElementById("hidden-download").click()
        // DO SOME ACTION
    }
    this.ws.onerror = function(evt) {
        // print("ERROR: " + evt.data);
        console.log("ERROR: " + evt.data);
    }
    return false;
};

Connection.prototype.setLink = function(name) {
    $("#hidden-download").download = name
}

Connection.prototype.send = function(data) {
    if (!this.ws) {
        return false;
    }
    consoel.log("SEND: " + input.value);
    this.ws.send(input.value);
    return true;
}

Connection.prototype.close = function() {
    if (!this.ws) {
        return false;
    }
    this.ws.close();
    return true;
}


function getSession(uidA, uidB) {
    if(uidA > uidB) {
        return uidA + uidB
    } 
    return uidB + uidA
}

function makeTextFile (text) {
    var data = new Blob([text], {type: 'text/plain'});

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    return textFile;
}