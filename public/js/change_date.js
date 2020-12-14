$( document ).ready(function() {

    $("#change_date").click(function(){
        $("#change_date_modal").modal("show");
    });

    $('#save_date').click(function(){
        var month = $('#month_input').val();
        var year = $('#year_input').val();

        window.location.href = location.protocol + '//' + location.host + location.pathname + '?date='+ month+'-'+year;
        
    });

});