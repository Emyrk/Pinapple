/*************** Start of Facebook Code ***************/

var facebookinit = false

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
            window.location = "client.html";
            var queryString = "/me"
            FB.api(queryString, function(response) {
                globalState.Friends.myid = response.id
                initGlobalWS()
            });

            queryString = "/me/friends"

            FB.api(queryString, function(response) {
                console.log(JSON.stringify(response));
                addFriends(response)
                // var profilePicQS = $(`<img src=http://graph.facebook.com/` + response.data[0].id + `/picture?type=normal>`)
                // console.log(profilePicQS)
                // $(document.body).append(profilePicQS)
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

        var queryString = "/me"
        FB.api(queryString, function(response) {
            globalState.Friends.myid = response.id
            initGlobalWS()
        });
        
        queryString = "/me/friends"
        
        FB.api(queryString, function(response) {
            console.log(JSON.stringify(response));
            addFriends(response)
        });
    });
  }

function initGlobalWS() {
    if(!facebookinit) {
        globalWs.Create()
        facebookinit = true
    }
}

function addFriends(response) {
    if(response.data.length > 0) {
        for(var i = 0; i < response.data.length; i++) {
            globalState.Friends.addFriend(response.data[i].name, response.data[i].id)
        }
    }
}

/*************** End of Facebook Code ***************/