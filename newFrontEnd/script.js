"use strict";
$(document).ready(function(){
    $('.jessesaran').click(function () {
        console.log("click");
        $('.mainScreen').hide();
        $('.confirmShare').show();  
        $('.online').removeClass().addClass( "active" );;  
    });

});
