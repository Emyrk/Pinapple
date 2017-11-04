var textFile = null;
var output = document.getElementById("output");
var input = document.getElementById("input");
var friends = new Friends();
var globalWs = new GlobalWs();

function updateLocation(dom, x, y) {
    var xs = x + "px"
    var ys = y + "px"
    $(dom).css("margin-left", xs)
    $(dom).css("margin-top", ys)
}