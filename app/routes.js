// app/routes.js
module.exports = function(app, pg, passport, model) {

    // on every request, make sure the session and user are present to all pages
    app.use(function(req, res, next) {
      res.locals.user = req.user;
      if(req.session) {
          res.locals.session = req.session; // can comment out? 16/05/2017
      }
      res.locals.messages = req.messages ? req.messages : [];

      next();
    });

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
      res.render('pages/index');
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('pages/login.ejs', { loginMessages: req.flash('loginMessages') });
    });

    // process the login form
    app.post('/login', function(req, res, next) {
                        passport.authenticate('login', function(err, user, info) {
                          if (err)   {
                            return next(err);
                          }
                          if (!user) {
                            return res.redirect('/login');
                          } else {
                            req.session.name = user.username;
                            req.login(user, function(err) {
                              return res.redirect('/profile');
                            });
                          }
                        })(req, res, next);
                      }
    );

    // =====================================
    // SIGNUP ==== show the sign up page ===
    // =====================================
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('pages/signup.ejs', { signupMessages : req.flash('signupMessages') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('signup',
                                                { successRedirect : '/profile', // redirect to the secure profile section
                                                  failureRedirect : '/signup', // redirect back to the signup page if there is an error
                                                  failureFlash : 'not in',
                                                  successFlash : 'you are in' }
                                              )
    );

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.session.destroy(function() {
            res.send('Session deleted');
        });
        req.logout();
        res.redirect('/');
    });

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
      res.render('pages/profile.ejs', {
          user : req.user, // get the user out of session and pass to template
          profileMessages : req.flash('profileMessages'),
          messages : req.flash('messages')
      });
    });

    app.get('/main', function(req, res) {
      res.render('pages/main.ejs', { messages : req.flash('messages') });
    });

    // route middleware to make sure a user is logged in
    function isLoggedIn(req, res, next) {

        // if user is authenticated in the session, carry on
        if (req.isAuthenticated()) {
            return next();
        }

        // if they aren't redirect them to the home page
        res.redirect('/');
    }
}
