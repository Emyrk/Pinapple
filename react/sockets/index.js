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

window.addEventListener("load", function(evt) {

    console.log("Is this loaded?")
    var output = document.getElementById("output");
    var input = document.getElementById("input");
    var ws;

    var print = function(message) {
        var d = document.createElement("div");
        d.innerHTML = message;
        output.appendChild(d);
    };


    //var create = document.getElementById('create'),
   // textbox = document.getElementById('textbox');

    // create.addEventListener('click', function () {
    //     var link = document.getElementById('downloadlink');
    //     link.href = makeTextFile(textbox.value);
    //     link.style.display = 'block';
    // }, false);

    document.getElementById("open").onclick = function(evt) {
        if (ws) {
            return false;
        }

        var uid = document.getElementById('userid').value
        var sesid = document.getElementById('sesid').value
        var query = "?userid=" + uid + "&sessionid=" + sesid

        ws = new WebSocket("{{.}}"+query);
        ws.onopen = function(evt) {
            print("OPEN");
        }
        ws.onclose = function(evt) {
            print("CLOSE");
            ws = null;
        }
        ws.onmessage = function(evt) {
            print("RESPONSE: " + evt.data);
            var link = document.getElementById('downloadlink');
            link.href = makeTextFile(evt.data);
            link.style.display = 'block';
        }
        ws.onerror = function(evt) {
            print("ERROR: " + evt.data);
        }
        return false;
    };

    document.getElementById("send").onclick = function(evt) {
        if (!ws) {
            return false;
        }
        print("SEND: " + input.value);
        ws.send(input.value);
        return false;
    };

    document.getElementById("close").onclick = function(evt) {
        if (!ws) {
            return false;
        }
        ws.close();
        return false;
    };

});