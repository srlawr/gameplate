var express = require('express');
var app = express();
// pg pw on w10 rtsa1
var pg = require('pg'); // mine
var passport = require('passport');
var flash    = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var db           = require('./app/models');

app.set('port', (process.env.PORT || 5000));

require('./config/passport')(passport); // pass passport for configuration

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser('ilikesessionslikeilikeicecream')); // read cookies (needed for auth) - consider a seed string parameter
app.use(bodyParser()); // get information from html forms

app.use(express.static(__dirname + '/public')); // mine
app.set('views', __dirname + '/views'); // mine
app.set('view engine', 'ejs');

// required for passport
app.use(session({ secret: 'thisisbetterthanworkingonsalesforce' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
console.log('end', process.env.NODE_ENV);
// routes ======================================================================
require('./app/routes.js')(app, pg, passport, db.sequelize.models); // load our routes and pass in our app and fully configured passport

if(process.env.NODE_ENV === 'dev') {
    db.sequelize.sync({force:true})
                .then(function() {
                          app.listen(app.get('port'), function() {
                              console.log('DEVELOPER MODE node app is running on port', app.get('port'));
                          });
                          db.sequelize.query(
                              "INSERT INTO gameuser (username,password) VALUES ('simon','simon'), ('tom', 'tom');"
                          );
                      });
} else {
    db.sequelize.sync().then(function() {
        app.listen(app.get('port'), function() {
            console.log('PRODUCTION MODE node app is running on port', app.get('port'));
        });
    });
}
