$( document ).ready(function() {
    $('[name=student_item]').find('button').on( "click", function() {
        if ($(this).hasClass('btn-success')){
            $(this).removeClass('btn-success').addClass('btn-danger').html(Absent);
        }
        else{
            $(this).removeClass('btn-danger').addClass('btn-success').html(Attendant);
        }
        $(this).closest('[name=student_item]').find('input').prop("checked", !$(this).closest('[name=student_item]').find('input').prop("checked"));
    });

});