$(document).ready(function() {
    $('.js_add_lesson').click(function(){
        const day = moment($(this).closest('[name=day_item]').find('span[name=day]').text(), 'DD-MM-YYYY');
        const scheduleID = $(this).closest('.js-schedule-card').data('scheduleid');
        const turmaID = $(this).closest('.js-schedule-card').data('turmaid');

        $.ajax({
            url: "http://localhost:9696/api/lesson/", 
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({day: day, schedule_id: scheduleID, turma_id: turmaID}),
            success: function(result) {
                window.location.href=urlBase+'/lessons/view/'+result._id;
            },
            error: function(err) {
                console.log(err);
            } 
        });
    });

    $('.js_remove_lesson').click(function(){
        const lessonID = $(this).closest('[name=day_item]').data('lessonid');
        $.ajax({
            url: "http://localhost:9696/api/lesson/"+lessonID, 
            type: 'DELETE',
            contentType: 'application/json',
            success: function(result) {
                window.location.href= window.location.href;
            },
            error: function(err) {
                console.log(err);
            } 
        });
    });
});