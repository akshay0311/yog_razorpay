const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../instructor/models/User');
const Student = require('../student/models/profile');

function SessionConstructor(userId, userGroup, details) {
  this.userId = userId;
  this.userGroup = userGroup;
  this.details = details;
}

module.exports = function(passport) {
  // Instructor Strategy
  passport.use('Instructor',
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      User.findOne({
        email: email
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }
        instructor = 1;
        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );
  // Student Strategy
  passport.use('Student',
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      Student.findOne({
        email: email
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }
        student = 1;
        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );
    /* Serialization Implementation*/
    /* Warning : Pata ni kaise hua yeh..Bas ho gaya*/
    passport.serializeUser(function (userObject, done) {
      // userObject could be a Model1 or a Model2... or Model3, Model4, etc.
      let userGroup = "model1";
      let userPrototype =  Object.getPrototypeOf(userObject);
      if (userPrototype === User.prototype) {
        userGroup = "model1";
      } else if (userPrototype === Student.prototype) {
        userGroup = "model2";
      }
      let sessionConstructor = new SessionConstructor(userObject.id, userGroup, '');
      done(null,sessionConstructor);
    });
    passport.deserializeUser(function (sessionConstructor, done) {
      if (sessionConstructor.userGroup == 'model1') {
        User.findOne({
            _id: sessionConstructor.userId
        }, '-localStrategy.password', function (err, user) { // When using string syntax, prefixing a path with - will flag that path as excluded.
            done(err, user);
        });
      } else if (sessionConstructor.userGroup == 'model2') {
        Student.findOne({
            _id: sessionConstructor.userId
        }, '-localStrategy.password', function (err, user) { // When using string syntax, prefixing a path with - will flag that path as excluded.
            done(err, user);
        });
      }
    });
  } 