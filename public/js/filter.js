$(document).ready(function(){
    $("#filter-link").click(function(){
        $('#map-canvas').removeClass("content-65-width");
        $('#search-content').hide();
        $('#filter-content-div').slideToggle("slow");
        $('#map-canvas').toggleClass("content-75-width");
    });

    $(".filter").change(function(){
        requestListings();
    });

/*
    $('#selecctall').click(function(event) {  //on click
        if(this.checked) { // check select status
            $('.checkbox1').each(function() { //loop through each checkbox
                this.checked = true;  //select all checkboxes with class "checkbox1"
            });
        }else{
            $('.checkbox1').each(function() { //loop through each checkbox
                this.checked = false; //deselect all checkboxes with class "checkbox1"
            });
        }
    });
*/

});