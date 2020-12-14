var calendar = '';
document.addEventListener('DOMContentLoaded', function() {
  var calendarEl = document.getElementById('calendar');
  calendar = new FullCalendar.Calendar(calendarEl, {
    locale: 'pt',
    themeSystem: 'bootstrap',
    plugins: [ 'interaction', 'dayGrid', 'timeGrid' ],
    defaultView: 'timeGridWeek',
    header: {
      left:   'today,prev,next',
      center: 'title',
      right:  'dayGridMonth, timeGridWeek, timeGridDay, listWeek'
    },
    datesRender: function(){
      getLessons();
    }

  });
  calendar.render();

  


});

function getLessons()
{
  var eventSources = calendar.getEventSources(); 
  for (var i = 0; i < eventSources.length; i++) { 
      eventSources[i].remove(); 
  } 
  var [begin, end] = [moment(calendar.view.activeStart).format("MM-DD-YYYY"), moment(calendar.view.activeEnd).format("MM-DD-YYYY")];

  $.ajax({
    url: 'http://localhost:9696/api/lesson?get=lessonsdays&begin='+begin+'&end='+end, 
    type: 'GET',
    success: function(result) {
      var lessons = [];
      result.forEach(turma => {
        var weekdays = turma.attendance_days;
        console.log(weekdays);
        for (weekday in weekdays){
          weekdays[weekday].days.forEach(day => {
            var day_format = day.day.substring(6)+'-'+day.day.substring(3,5)+'-'+day.day.substring(0,2);
            var begin_format =  weekdays[weekday].schedule.begin.substring(0, 2)+':'+ weekdays[weekday].schedule.begin.substring(2)+':00';
            var end_format =  weekdays[weekday].schedule.end.substring(0, 2)+':'+ weekdays[weekday].schedule.end.substring(2)+':00';
            if (day.lesson == null) {
              lessons.push(
                {
                  start: day_format+'T'+begin_format,
                  end: day_format+'T'+end_format,
                  rendering: 'background',
                  color: turma.turma.color
                }
              );
            }
            else {
              lessons.push(
                {
                  start: day_format+'T'+begin_format,
                  end: day_format+'T'+end_format,
                  color: turma.turma.color,
                  textColor: '#ffffff'
                }
              );
            }
          });
        }
        
      });
      

        console.log(lessons)
        calendar.addEventSource(lessons);
        // calendar.addEvent(lessons);
        calendar.render();

    },
    error: function(err) {
        console.log(err);
    } 
  });
}