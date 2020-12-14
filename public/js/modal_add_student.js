$( document ).ready(function() {

    $("#open_add_student_modal").click(function(){
        $.ajax({url: "http://localhost:9696/api/student?turma=no", success: function(result){
            var htmlResult = window.studentListTemplate({students: result});
            $("#add_student_modal").find('.modal-body').html(htmlResult);
            $("#add_student_modal").modal("show");
          }});
    });

    $("#add_student_modal").find('.modal-body').on('click', 'li', function(){
        $(this).toggleClass('active');
    });

    $("#save_students").click(function(){
        var students_ids = $("#add_student_modal").find('.modal-body').find('li.active').map(function () {
            return $(this).data('id');
        }).get();

        $.ajax({
            url: "http://localhost:9696/api/turma/"+turma_id, 
            type: 'PUT',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({students_add: students_ids}),
            success: function(result) {
                setCookie("alert", {type: 'success', message: "Student added to class"}, 1);
                window.location.href=window.location.href;
            },
            error: function(err) {
                console.log(err);
            } 
        });
    });
});