const express = require('express');
const path = require('path');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const session = require('express-session');
// const cookieParser = require('cookie-parser')
dotenv.config();

const app = express();
app.use(express.static('./node_modules/admin-lte'));
app.use(express.static('node_modules'));
app.use(express.static('public'));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// app.use(cookieParser());

const i18n = require("i18n");

app.use(i18n.init);
i18n.configure({
    locales: ['en', 'pt'],
    directory: './locales',
    register: global
}
);

app.use((req, res, next) => {
    res.setLocale('pt');
    if (app.locals.alert)
    {
        res.locals.alert = app.locals.alert;
        app.locals.alert = null;
    }
    //fake login
    //axios.defaults.headers.common['auth-token'] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZTVkMTA1MjE4NmY4YzVmNmM1YzFlMWMiLCJuYW1lIjoiQ2FybG9zIFJlbmF0byBNb3RhIENvc3RhIiwiZmxfbmFtZSI6IkNhcmxvcyBDb3N0YSIsImVtYWlsIjoiY2FybG9zLnJlbmF0b0B5YWtpLmNvbSIsImlhdCI6MTU5MDUwODA4MH0.TK67rVMlnygol9VwmNy9Ma0J06ncufN7in_9cCca_d4";
    //
    
    // console.log(req.cookies['remember']);
    // if(req.cookies['remember'] !== undefined || req.cookies['remember'] !== 'undefined')
    //     axios.defaults.headers.common['auth-token'] = req.cookies['remember'];

    if(req.url !== '/login') {
        if(!axios.defaults.headers.common['auth-token']){
            res.redirect('/login');
        }
        else {
            var user = jwt.verify(axios.defaults.headers.common['auth-token'], process.env.JWT_KEY);
            app.locals.user = user;
        }
    }
    next();
});


app.locals.urlBase = "http://localhost:6969";


var fs = require('fs');
var pug = require('pug');
var jsFunctionString = pug.compileFileClient('views/components/turma/student_list.pug', {name: "studentListTemplate"});
fs.writeFileSync("public/js/templates.js", jsFunctionString);


app.set('views', path.join(__dirname, 'views'));    
app.set('view engine', 'pug');


app.get('/', function(req, res){
    res.locals.alert = JSON.stringify({type: 'success', message: res.__("Welcome")});
    app.locals.currentPage = 'Dashboard';
    app.locals.breadcrumb = [{name: 'Dashboard'}];
        
    res.render('pages/dashboard', {
        title: 'Hello life'
    });
})
app.get('/login', function(req, res){
    app.locals.currentPage = 'Login';
    if(axios.defaults.headers.common['auth-token']){
        res.redirect('/');
    }
    res.render('pages/login');
})
app.get('/logout', function(req, res){
    app.locals.currentPage = 'Logout';
    axios.defaults.headers.common["auth-token"] = null;
    // res.cookie('remember', undefined);
    res.redirect('/login')
})

app.post('/login', function(req, res){
    app.locals.currentPage = 'Login';
    login = {};
    console.log(req.body);
    login['email'] = req.body.email_input;
    login['password'] = req.body.password_input;
    axios.post('http://localhost:9696/api/user/login', login).
    then(response => {
        axios.defaults.headers.common["auth-token"] = response.data;
        if(req.body.remember_input == 'on')
        {
            // res.cookie('remember', response.data, { maxAge: 14 * 24 * 60 * 60 * 1000, httpOnly: true });
        }
        res.redirect('/');
    }).catch(function (error) {
        res.render('pages/login', {
            email: req.body.email_input
        });
      });
});

app.get('/students', function(req, res){
    app.locals.currentPage = 'Students';
    app.locals.breadcrumb = [{name: 'Dashboard', url: '/'}, {name: 'Students'}];
    

    axios.get('http://localhost:9696/api/student').
    then(response => {
        res.render('pages/students', {
            students: response.data
        });
    })

});

app.get('/students/create', function(req, res){
    app.locals.currentPage = 'Create Student';
    app.locals.breadcrumb = [{name: 'Dashboard', url: '/'}, {name: 'Students', url: '/students'}, {name: 'Create'}];
    res.render('pages/students_create');
});

app.post('/students/create', function(req, res){
    app.locals.currentPage = 'Create Student';
    app.locals.breadcrumb = [{name: 'Dashboard', url: '/'}, {name: 'Students', url: '/students'}, {name: 'Create'}];

    student = {};
    student['name'] = req.body.name_input;
    student['email'] = req.body.email_input;
    student['birthday'] = req.body.birthday_input;
    student['phone'] = req.body.phone_input;
    student['guardian'] = req.body.guardian_input;
    student['belt'] = req.body.belt_input;


    axios.post('http://localhost:9696/api/student/', student).
    then(response => {
        app.locals.alert = JSON.stringify({type: 'success', message: res.__("Student created")});
        res.redirect('/students');
    }).catch(function (error) {
        res.render('pages/students_create', {
            name: student.name,
            email: student.email,
            birthday: student.birthday,
            phone: student.phone,
            guardian: student.guardian,
            current_belt: student.current_belt
        });
      });
});

app.get('/students/delete/:userId', function(req, res){
    app.locals.currentPage = 'Delete Student';
    app.locals.alert = JSON.stringify({type: 'success', message: res.__("Student deleted")});
    
    const userID = req.params.userId;
    console.log(userID);
    axios.delete('http://localhost:9696/api/student/'+userID).
    then(response => {
        res.redirect('/students');
    })
});

app.get('/students/view/:userId', function(req, res){
    app.locals.currentPage = 'Student';
    const userID = req.params.userId;
    axios.get('http://localhost:9696/api/student/'+userID).
    then(response => {
        app.locals.breadcrumb = [{name: 'Dashboard', url: '/'}, {name: 'Students', url: '/students'}, {name: response.data.fl_name}];
        res.render('pages/students_view', {
            student: response.data
        });
    })
});

app.post('/students/save/:userId', function(req, res){
    app.locals.currentPage = 'Save Student';
    const userID = req.params.userId;
    var student = {};
    student['name'] = req.body.name_input;
    student['email'] = req.body.email_input;
    student['birthday'] = req.body.birthday_input;
    student['phone'] = req.body.phone_input;
    student['guardian'] = req.body.guardian_input;
    student['belt'] = req.body.belt_input;

    axios.put('http://localhost:9696/api/student/'+userID, student).
    then(response => {
        app.locals.alert = JSON.stringify({type: 'success', message: res.__("Student saved")});
        
        res.redirect('/students/view/'+userID);
    })
});

app.get('/turmas', function(req, res){
    app.locals.currentPage = 'Turmas';
    app.locals.breadcrumb = [{name: 'Dashboard', url: '/'}, {name: 'Turmas'}];

    axios.get('http://localhost:9696/api/turma').
    then(response => {
        res.render('pages/turmas', {
            turmas: response.data
        });
    })

});

app.get('/turmas/create', function(req, res){
    app.locals.currentPage = 'Create Turma';
    app.locals.breadcrumb = [{name: 'Dashboard', url: '/'}, {name: 'Turmas', url: '/turmas'}, {name: 'Create'}];
    res.render('pages/turmas_create');
});

app.post('/turmas/create', function(req, res){
    app.locals.currentPage = 'Create Turma';
    turma = {};
    turma['name'] = req.body.name_input;
    turma['monthly_payment'] = req.body.payment_input;

    axios.post('http://localhost:9696/api/turma/', turma).
    then(response => {
        app.locals.alert = JSON.stringify({type: 'success', message: res.__("Class created")});
        res.redirect('/turmas');
    }).catch(function (error) {
        res.render('pages/turmas_create', {
            name: turma.name
        });
      });
});

app.get('/turmas/delete/:turmaId', function(req, res){
    app.locals.currentPage = 'Turmas';
    const turmaID = req.params.turmaId;
    axios.delete('http://localhost:9696/api/turma/'+turmaID).
    then(response => {
        app.locals.alert = JSON.stringify({type: 'success', message: res.__("Class deleted")});
        res.redirect('/turmas');
    })
});

app.get('/turmas/view/:turmaId', function(req, res){
    app.locals.currentPage = 'Turma';
    const turmaID = req.params.turmaId;
    axios.get('http://localhost:9696/api/turma/'+turmaID).
    then(response => {

        var data;

        if (req.query.edit !== undefined){
            data = {
                turma: response.data,
                edit: true
            }
        }
        else{
            data = {
                turma: response.data
            }
        }

        app.locals.breadcrumb = [{name: 'Dashboard', url: '/'}, {name: 'Turmas', url: '/turmas'}, {name: response.data.name}];

        res.render('pages/turmas_view', data);
    })
});

app.post('/turmas/save/:turmaId', function(req, res){
    app.locals.currentPage = 'Turmas';
    const turmaID = req.params.turmaId;
    var turma = {};
    turma['name'] = req.body.name_input;
    turma['monthly_payment'] = req.body.payment_input;

    axios.put('http://localhost:9696/api/turma/'+turmaID, turma).
    then(response => {
        app.locals.alert = JSON.stringify({type: 'success', message: res.__("Class saved")});
        
        res.redirect('/turmas/view/'+turmaID);
    })
});

app.get('/turmas/:turmaId/remove/student/:studentId', function(req, res){
    app.locals.currentPage = 'Turmas';
    const turmaID = req.params.turmaId;
    const studentID = req.params.studentId;

    axios.put('http://localhost:9696/api/turma/'+turmaID, {students_remove: [studentID]}).
    then(response => {
        app.locals.alert = JSON.stringify({type: 'success', message: res.__("Student removed from class")});
        res.redirect('/turmas/view/'+turmaID);
    })
});

app.get('/turmas/:turmaId/remove/schedule/:scheduleId', function(req, res){
    app.locals.currentPage = 'Turmas';
    const turmaID = req.params.turmaId;
    const scheduleID = req.params.scheduleId;

    axios.put('http://localhost:9696/api/turma/'+turmaID, {schedule_remove: scheduleID}).
    then(response => {
        app.locals.alert = JSON.stringify({type: 'success', message: res.__("Schedule removed from class")});
        res.redirect('/turmas/view/'+turmaID);
    })
});

app.get('/turmas/view/:turmaId/lessons', function(req, res){
    app.locals.currentPage = 'Lessons';
    const turmaID = req.params.turmaId;
    if (req.query.date !== undefined)
        var [month, year] = req.query.date.split('-');
    else
        var [month, year] = [new Date().toLocaleString('default', { month: 'long' }), new Date().getFullYear()];

    axios.get('http://localhost:9696/api/lesson?get=days&month='+month+'&year='+year+'&turma='+ turmaID).
    then(response => {

        var data = {};

        data = {
            attendance_days: response.data.attendance_days,
            turma: response.data.turma,
            month: month,
            year: year
        }

        app.locals.breadcrumb = [{name: 'Dashboard', url: '/'}, {name: 'Turmas', url: '/turmas'}, {name: response.data.turma.name, url: '/turmas/view/'+turmaID}, {name: 'Lessons'}];


        res.render('pages/turmas/attendance_days.pug', data);
    })
});

app.get('/lessons/view/:lessonId', function(req, res){
    app.locals.currentPage = 'Lessons';
    const lessonID = req.params.lessonId;

    axios.get('http://localhost:9696/api/lesson/'+ lessonID).
    then(response => {

        var data = {
            lesson: response.data
        }
        app.locals.breadcrumb = [{name: 'Dashboard', url: '/'}, {name: 'Lessons', url: '/lessons'}, {name: response.data.short_day}];
        


        res.render('pages/lessons_view.pug', data);
    })

});

app.post('/lessons/save/:lessonId', function(req, res){
    const lessonID = req.params.lessonId;
    var lesson = {};

    if (req.body.student_list !== undefined)
        lesson['student_list'] = req.body.student_list;
    else
    lesson['student_list'] = 'none';

    axios.put('http://localhost:9696/api/lesson/'+lessonID, lesson).
    then(response => {
        app.locals.alert = JSON.stringify({type: 'success', message: res.__("Lesson saved")});
        res.redirect('/lessons/view/'+lessonID);
    })
});

// app.get('/lessons/delete/:lessonId', function(req, res){
//     app.locals.currentPage = 'Lessons';
//     const lessonID = req.params.lessonId;
//     axios.delete('http://localhost:9696/api/lesson/'+lessonID).
//     then(response => {
//         app.locals.alert = JSON.stringify({type: 'success', message: res.__("Lesson deleted")});
//         res.redirect('/lessons');
//     });
// });

app.get('/lessons/calendar', function(req, res){
    app.locals.currentPage = 'Lessons';
    const lessonID = req.params.lessonId;

    var turmaID = '5e81fe7cd0e58610608ee0b9';
    var [month, year] = [new Date().toLocaleString('default', { month: 'long' }), new Date().getFullYear()];

    axios.get('http://localhost:9696/api/lesson?get=days&month='+month+'&year='+year+'&turma='+ turmaID).
    then(response => {

        var data = {};

        data = {
            lessons: response.data.attendance_days,
            turma: response.data.turma,
            month: month,
            year: year
        }

        console.log(data.lessons)

        app.locals.breadcrumb = [{name: 'Dashboard', url: '/'}, {name: 'Lessons', url: '/lessons'}  ];


        res.render('pages/lessons_calendar.pug', data);
    })


    

});



app.listen(6969, () => console.log('Server running....'));
