const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const multer = require("multer");
// Load User model
const User = require('../models/User');
const nodemailer = require("nodemailer");

var initializePassport = require('../../config/passport');
initializePassport(passport);

var flag = 0,route;
// storage strategy in multer
var storage = multer.diskStorage({ 
  destination: (req, file, cb) => { 
      cb(null, './uploads') 
  }, 
  filename: (req, file, cb) => { 
      cb(null, file.fieldname +"-"+ Date.now()+".png"); 
  }, 
  limits: { fileSize:  5000000  }
}); 
// upload object of multer
var upload = multer({ storage: storage }); 



//send mail 
function sendMail(output){
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'mishraakshay859@gmail.com',
      pass: 'login@123'
    }
  });
  var mailOptions = {
    from: 'mishraakshay859@gmail.com',
    to: 'akshaycoding123@gmail.com',
    subject: 'Sending Email using Node.js',
    html:output 
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

}


// Login Page
router.get('/login', (req, res) => res.render('login'));

// Register Page
router.get('/register', (req, res) => res.render('register'));


// Post route for  Login
router.post('/login', (req, res, next) => {
  if (flag == 1) route='/dashboard'; else route = '/users/profile';
  passport.authenticate('Instructor', {
    successRedirect: route,
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Get route for  Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/');
});


//  Profile Page
router.get('/profile', checkAuthenticated, (req, res) => {
  var user = req.user;
  // search if any quality missing
  if ((user.qual1.q || user.qual2.q || user.qual3.q || user.qual4.q ||
    user.qual5.q || user.qual6.q || user.qual7.q||user.qual8.q) &&user.bio)
       flag = 1;  else flag = 0;
  
  // render page     
  res.render('profile',{
    name:user.name,
    email:user.email,
    phone:user.phone,
    bio:user.bio,
    address:user.address,
    qual1 : user.qual1,
    qual2 : user.qual2,
    qual3 : user.qual3,
    qual4 : user.qual4,
    qual5 : user.qual5,
    qual6 : user.qual6,
    qual7 : user.qual7,
    qual8 : user.qual8,
    pp : user.pr_img_path,
    flag : flag
  }) 
})





/*-----------------------ROUTES FOR PROFILE PAGE POST -----------------*/
//7: Post route for personal info
router.post("/profile",(req,res)=>{
  var {email,bio,name,phone,address} = req.body;
  var {q1,q2,q3,q4,q5,q6,q7,q8} = req.body;// qualifcation
  // search for email in collection
  User.findOne({ email: email }).then(user => { 
    user.qual1.q = q1;
    user.qual2.q = q2;
    user.qual3.q = q3;
    user.qual4.q = q4;
    user.qual5.q = q5; 
    user.qual6.q = q6;
    user.qual7.q = q7;
    user.qual8.q = q8;
    
    // search if any quality missing
    if ((user.qual1.q || user.qual2.q || user.qual3.q || user.qual4.q ||
       user.qual5.q || user.qual6.q || user.qual7.q||user.qual8.q)&&user.bio)
          flag = 1;  else flag = 0;

      user.bio = bio;
      user.name = name;
      user.phone = phone;
      user.email = email;
      user.address = address;
      user.save()
      .then(usr=>{
        console.log(usr);
        if (user.accnt_name)
            res.redirect("/dashboard")
        else
            res.redirect('/users/kyc')
      })      
      .catch(err=>console.log(err))
  })
  }
)





/*--------------------post route -------*/
//8: Post route for Registration
router.post('/register', (req, res) => {
  const { name, email, phone,password, password2,optradio } = req.body;
  let errors = [];

  if (!optradio){
    errors.push({ msg: 'Please accept the form' });
  }
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2,
      phone
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2,
          phone
        });
      } else {
        var mailoutput = `<p>You have a new contact request</p>
        <h3>Contact Details</h3>
        <ul>  
          <li>Name: ${name}</li>
          <li>Email: ${email}</li>
          <li>Phone: ${phone}</li>
        </ul>
        <h3>Message</h3>;`
        //sending mail
        sendMail(mailoutput);
        
        //creating new user
        const newUser = new User({
          name,
          email,
          password,
          phone
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});



/********KYC Route **********************/
// kyc get route
var bool = true; 
router.get('/kyc',checkAuthenticated,(req,res,next)=>{
    var user = req.user;
    var email = req.user.email;
    if (!user.accnt_num){
       bool = false;
    }
     else bool = true;
    res.render('kyc',{
      accnt_name:user.accnt_name,
      b_name:user.b_name,
      accnt_num:user.accnt_num,
      b_address:user.b_address,
      ifsc:user.ifsc,
      email:user.email,
      aadh : user.aadh,
      pan : user.pan,
      bool : bool
  })
})

// kyc post route
router.post('/kyc',upload.fields([{
  name: 'aadh', maxCount: 1},{
  name: 'pan', maxCount: 1
}]),(req,res,next)=>{
  
  const {accnt_name,accnt_num,b_name,b_address,ifsc,email} = req.body;



  if (accnt_num) {
         bool = true;
         res.redirect('/users/kyc');
      }
  else bool = false;
  User.findOne({email:email}).then((user=>{
      user.accnt_name = accnt_name;
      user.accnt_num = accnt_num;
      user.b_name = b_name;
      user.b_address = b_address;
      user.ifsc = ifsc;
      if (req.files.aadh){
        user.aadh = req.files.aadh[0].filename;
     }
     if (req.files.pan){
         user.pan =  req.files.pan[0].filename;
     }
      user.save()
      .then(usr=>res.render('kyc',{
          accnt_name:user.accnt_name,
          b_name:user.b_name,
          accnt_num:user.accnt_num,
          b_address:user.b_address,
          ifsc:user.ifsc,
          email:user.email,
          bool : bool,
          aadh : user.aadh,
          pan : user.pan
      }))
  }))
})
/*------------------ TESTIMONIAL ROUTE-------------------*/
// GET route for testimonial
router.get('/testimonials',checkAuthenticated,(req,res)=>{
    res.render('testimonials')
});

//check authenticated
function checkAuthenticated(req,res,next){
  if (req.isAuthenticated())
      return next();
  else res.redirect('/users/login')    
}


module.exports = router;