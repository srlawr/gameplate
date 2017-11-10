// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var models  = require('../app/models');

// expose this function to our app using module.exports
module.exports = function(passport) {
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        // Can you load all this related shit with "include" joins?
        models.gameuser.findById(id)
            .then(function(user) {
                    done(null, user);
                  },
                  function(err) {
                    done(null, err);
                  });
    });

    passport.use('login',
                    new LocalStrategy({
                                        usernameField : 'username', // these are the defaults, here to remind me I can override them
                                        passwordField : 'password',
                                        passReqToCallback : true
                                      },
                                      function(req, username, password, done) {
                                          // find a user whose email is the same as the forms email
                                          // we are checking to see if the user trying to login already exists
                                          // CHECK OUT sequelize findOrCreate here?
                                          models.gameuser.findOne(
                                                                   { where : { username : username, password : password } }
                                                                 ).then(function(userObj) {
                                                                      if(userObj !== null) {
                                                                          return done(null, userObj.dataValues), req.flash('profileMessages', 'You are logged in');
                                                                      } else {
                                                                          return done(null, false, req.flash('loginMessages', 'Incorrect username or password. Please try again.'));
                                                                      }
                                                                 },
                                                                 function(err) {
                                                                   return done(req.flash('loginMessages','Total error in the DB layer, sorry.'));
                                                                 });
                                     })
                );


    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    // srlawr: how do we get the params over from the form/route?
    passport.use('signup',
                new LocalStrategy({
                                      usernameField : 'username', // these are the defaults, included here to remind me I can override them
                                      passwordField : 'password',
                                      passReqToCallback : true
                                  },
                                   function(req, username, password, done) {
                                      // find a user in PSQL with provided username
                                      models.gameuser.findAll(
                                                              { where : { username : username } }
                                                          ).then(function(userObjs) {
                                                                if(userObjs.length === 1) {
                                                                      return done(null, false, req.flash('signupMessages','Sorry, that user already exists'));
                                                                    } else {
                                                                      if(username.charAt(0) !== 's') {
                                                                          return done(null, false, req.flash('signupMessages','Not accepting signups at this time.'));
                                                                      }
                                                                      // So if there is no user with that email create the user and log them in/return them
                                                                      models.gameuser.build({ username: username,
                                                                                              password: password })
                                                                                     .save()
                                                                                     .then(function(thisGameuser) {
                                                                                         return done(null, thisGameuser, req.flash('pageMessages','You are signed up and logged in'));
                                                                                     })
                                                                                     .catch(function(error) {
                                                                                         return done(null, false, req.flash('signupMessages','Exception in DB'));
                                                                                     });
                                                                }
                                                          });
                                      }
                                    )
                );
};
