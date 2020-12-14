$( document ).ready(function() {

    $("#open_add_schedule_modal").click(function(){
        $("#add_schedule_modal").modal("show");
    });


    $("#save_schedule").click(function(){
        var new_schedule = {
            weekday: $("#weekday_input").val(),
            begin: $("#begin_hour_input").val() + $("#begin_minute_input").val(),
            end: $("#end_hour_input").val() + $("#end_minute_input").val()
        }

        $.ajax({
            url: "http://localhost:9696/api/turma/"+turma_id, 
            type: 'PUT',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({schedule_add: new_schedule}),
            success: function(result) {
                window.location.href=window.location.href;
            },
            error: function(err) {
                console.log(err);
            } 
        });
    });
});