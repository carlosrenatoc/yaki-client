// compile the template
var template = Handlebars.compile("Handlebars <b>{{doesWhat}}</b>");
// execute the compiled template and print the output to the console
console.log(template({ doesWhat: "rocks!" }));


 