const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Load Student model
const Student = require('../models/profile');

// Authentication
var initializePassport = require('../../config/passport');
const { route } = require('./profile');
const { count } = require('../models/profile');
initializePassport(passport);

// select your categories
router.get('/',(req,res,next)=>{
      res.render('trial_package',{
      timeSlots:['5 am','6 am','7 am','8 am','9 am','10 am','11 am','12 pm','1 pm','2 pm','3 pm','4 pm','5 pm','6 pm',
            '7 pm','8 pm','9 pm','10 pm']
       })    
})


var e;
// posting trial 
router.post('/book_trial',(req,res,next)=>{
      /*--------------- Users Login Info------------------*/
      const {fname,lname,email,password,phone,street,city,pincode,state,country} = req.body;
      if (fname && lname && email && password && phone){
            e = email;
            Student.findOne({
                  email: email
                }).then(user => {
                    if (!user){  
            const newUser = new Student({
                  fname,
                  lname,
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
                        .then(user =>console.log("ok"))
                        .catch(err => console.log(err));
                        }) 
                  })   
            }
            })            
            }
      else if (req.body.d == 'online' || req.body.d == 'person'){
            // for online or in-person
                Student.findOne({email:e}).then(user=>{
                  user.method = req.body.d;
                  user.save().then(usr=>console.log(usr));
                })        
            }
            // for gender
            else if (req.body.d == 'male' || req.body.d == 'female'){
                  Student.findOne({email:e}).then(user=>{
                    user.gender = req.body.d;
                    user.save().then(usr=>console.log(usr));
                  })        
              }
              // for partner
            else if (req.body.d == 'single' || req.body.d == 'couple' || req.body.d == 'group' ){
                  Student.findOne({email:e}).then(user=>{
                    user.partcipants = req.body.d;
                    user.save().then(usr=>console.log(usr));
                  })        
              }
              // for num of times in a week
            else if (req.body.d == 'daily' || req.body.d == 'three' || req.body.d == 'trainer' ){
                  Student.findOne({email:e}).then(user=>{
                    user.time = req.body.d;
                    user.save().then(usr=>console.log(usr));
                  })        
              }
              // for program
            else if (req.body.d == 'weight loss'||req.body.d == 'immunity booster' || req.body.d == 'post natal'|| 
                  req.body.d == 'diabetes control'||req.body.d == 'spine strenghthening' || req.body.d == 'pre natal'
                  ||req.body.d == 'pink'||req.body.d == 'relaxation meditation'||req.body.d == 'ask trainer'){
                        Student.findOne({email:e}).then(user=>{
                        user.program = req.body.d;
                        user.save().then(usr=>console.log(usr));
                        })        
                  }
            else if (req.body.type && req.body.type=="geo"){
                  Student.findOne({email:e}).then(user=>{
                        user.latitude = req.body.d1;
                        user.longitude = req.body.d2;      
                        user.save().then(usr=>console.log(usr));
                        })
            }                            
            else {
                  Student.findOne({email:e}).then(user=>{
                    user.timeSlot = req.body.d1;
                    user.timeSlot1 = req.body.d2;
                    user.save().then(usr=>{console.log(usr); 
                  });
                  })        
              }

      })            
module.exports = router;