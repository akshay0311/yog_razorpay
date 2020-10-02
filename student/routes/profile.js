const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const multer = require("multer");
// Load Student model
const Student = require('../models/profile');
const Book = require ('../models/book')
const Packages = require('../models/packages');

//Storage Config
var storage = multer.diskStorage({ 
  destination: (req, file, cb) => { 
      cb(null, './uploads') 
  }, 
  filename: (req, file, cb) => { 
      cb(null, file.fieldname + '-' + Date.now()+".png"); 
  }, 
  limits: { fileSize:  5000000  }
}); 

var upload = multer({ storage: storage });


// Authentication
var initializePassport = require('../../config/passport');
const { route } = require('../../instructor/routes');
const package = require('../models/packages');
const { check } = require('express-validator');
const { session } = require('passport');
const User = require('../../instructor/models/User');
const student = require('../models/profile');
const { app } = require('firebase-admin');
initializePassport(passport);

// Register Page
router.get('/register', (req, res) => res.render('register1'));

// Login Page
router.get('/login', (req, res) => res.render('login1'));


// Post route for  Login
router.post('/login', (req, res, next) => {
    passport.authenticate('Student', {
      successRedirect: '/student/dashboard',
      failureRedirect: '/student/login',
      failureFlash: true
    })(req, res, next);
  });


router.get('/terms1',(req,res,next)=>{
  res.render("terms1.hbs")
})

  // Get route for  Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/');
});  


/*--------------------post route -------*/
//8: Post route for Registration
router.post('/register', (req, res) => {
  const { fname,lname, email, phone,password, password2,country,state,pincode,city,street,optradio1} = req.body;
  let errors = [];
  
  if(!optradio1)
      errors.push({ msg: 'Please accept terms and conditions'});
      
  if (!fname || !lname || !email || !password || !password2){
    fname,
    lname,
    email,
    password,
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register1', {
      errors,
      fname,
      lname,
      email,
      password,
      phone
    });
  } else {
    Student.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register1', {
          errors,
          fname,
          lname,
          email,
          password,
          password2,
          phone,
          country,
          city,
          state,
          pincode,
          street
        });
      } else {
        //creating new user
        const newUser = new Student({
          fname,
          lname,
          email,
          password,
          phone,
          country,
          city,
          state,
          pincode,
          street
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                console.log(user);
                res.redirect('/student/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

function findProgress(r,t){
    return ((t-r)/t)*100;
}


/*--------------------------------------Customer Booking Page---------------------------*/
router.get('/dashboard',checkAuthenticated,(req,res,next)=>{
  var user = req.user;
  var bookPackages = user.bookPackage;
  var bookProgram = user.bookProgram;
  var packageIds = [];
  var packageInfo = [];
  Book.find()
  .where('_id')
  .in(bookPackages).exec()
  .then(result=>{
        for (var i =0 ; i < result.length; i+=1){
            packageIds.push(result[i].package)  
            // Checking if packages are remaining for the booked session 
            if (result[i].remaining_sessions <= 0)
                completed = true;
            else
                completed = false; 
          }     
        
        var completed;
        Packages.find()
        .where('_id')
        .in(packageIds).exec()
        .then(packages=>{
          for (var i =0 ; i < packages.length; i+=1){ 
            // finding the progress in the session
            let progress = findProgress(result[i].remaining_sessions,packages[i].sessions);     
            packageInfo.push({
                  id : result[i]._id,
                  price : packages[i].price,
                  program : bookProgram[i],
                  session : packages[i].sessions,
                  validity : packages[i].validity,
                  completed,
                  remaining_sessions : result[i].remaining_sessions,
                  progress
            })
          
          }

          res.render('customer_dashboard',{packageInfo,fname:user.fname,p: user.profile_pic})
        })
  })
  .catch(err=>console.log(err))
})

/*----------------------------Fetching Feedback Page by passing BookId to the page-----------------*/
router.post('/feedback',(req,res,next)=>{
  const {BookId} = req.body;
  res.render('feedback',{BookId,p:user.profile_pic}) 
})

/*----------------------------Fetching customer setting-----------------*/
router.get('/setting',checkAuthenticated,(req,res,next)=>{
  var user = req.user;
  console.log(user);
  res.render('customer_setting',{
    fname: user.fname,lname:user.lname,email:user.email,phone:user.phone,pincode:user.pincode,
    state:user.state,country:user.country,city:user.city,p:user.profile_pic
  }) 
})


/*----------------------------Posting customer setting-----------------*/
router.post('/setting',upload.single("profile_pic"),(req,res,next)=>{
  const{fname,lname,password,cpassword,phone,email} = req.body;
  const{state,country,city,pincode} = req.body;
       
  Student.find({email:email})
  .then(result=>{
    result[0].fname = fname;
    result[0].lname = lname;
    result[0].phone = phone;
    result[0].state = state;
    result[0].country = country;
    result[0].city = city;
    result[0].pincode = pincode;
    if (req.file)  result[0].profile_pic = req.file.filename;
    result[0].save()
    .then(user => {
    console.log(user);
    res.redirect('/student/dashboard');
  })
  .catch(err => console.log(err));  
  })
  .catch(err=>console.log(err))
})



/*------------------ Authentication---------------*/ 
//check authenticated
function checkAuthenticated(req,res,next){
  if (req.isAuthenticated())
      return next();
  else res.redirect('/student/login')    
}


module.exports = router;
