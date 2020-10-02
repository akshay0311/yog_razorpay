const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Load Package model
const Package = require('../models/packages');
// Load Book model
const Book = require('../models/book');
// Load customer profile model
const Student = require('../models/profile');

/*------------------Finding Package Mode------------------*/
async function findInPackage(f){
    if (f == 1) var z = await Package.find({mode:'online'})
    if (f == 2) var z = await Package.find({mode:'offline'})
    return z;
}

/*------------------------There are total 8 different types of Packages---------------------*/
/*---------------------RENDER PRICING PAGE -----------------------------------*/
function renderPricingPage(req,res,mode,p,hours,program){
    var single = [], couple= [], group = [],result;
    if (mode === 'online')  result = findInPackage(1);
    if (mode === 'offline')  result = findInPackage(2) 
    result.then(package=>{
        for (var i =0 ; i<package.length; i+=1){
            if (package[i].participants == 'single'){
                single.push({price: package[i].price,
                            validity: package[i].validity,
                            sessions: package[i].sessions,   
                            mode:mode,
                            program:program  
                             })    
                }
            else if (package[i].participants == 'couple'){
                couple.push({price: package[i].price,
                    validity: package[i].validity,
                    sessions: package[i].sessions ,
                    mode:mode,
                    program:program
                     })
            }  
            else {
                group.push({price: package[i].price,
                    validity: package[i].validity,
                    sessions: package[i].sessions, 
                    mode:mode,
                    program:program

                     })
                }// else closed 
            }     
            res.render('package_pricing',{
                single,
                couple,
                group,
                p,
                mode,
                program
            })//render closed     
        })//then closed
    .catch(err=>console.log(err))
   
} // function closed

/*-----------------------POST PROGRAM FROM HOME PAGE AND RENDER BOOK PACKAGES PAGE--------------------*/
router.post('/',(req,res,next)=>{
    var program = req.body.program;
    res.render('book_package',{program:program, timeSlots1:['5 am','6 am','7 am','8 am','9 am',
    '5 pm','6 pm','7 pm','8 pm','9 pm'],timeSlots2:['10 am','11 am','12 am','1 pm','2 pm','3 pm','4 pm','10 pm']
})  
})

/*-------------------------------RENDER PRICING PAGE AFTER POST REQUEST-----------------------*/ 
router.post('/pricing',(req,res,next)=>{
   const {method,participants,hours,program} = req.body;   
   renderPricingPage(req,res,method,participants,hours,program);
})

 
/*------------------------------RENDER PAYMENT PAGE POST REQUEST ON PRICING PAGE----------------------*/
router.post('/pay',(req,res,next)=>{
    const {sessions,mode,participants,program} = req.body;  
    res.render('payment',{
        sessions,
        mode,
        participants,
        program
    })
})

/*-----------------------------------SAVING USER INFO, HIS BOOKED PACKAGE INFO, HIS BOOKED PROGRAM AND HIS BOOKING ID-------------------------*/

router.post('/donePayment',(req,res,next)=>{
    var {fname,lname,sessions,mode,participants,program,email,password} = req.body;
    // Finding the relevant package 
    Package.find({sessions,mode,participants})
     .then(result=>{
         // Create a new Booking with the resultant package id 
         const newBooking = new Book({
            package : result[0]._id,
            remaining_sessions : sessions
         })
         // save new booking to the Student with the inputted email id  
         newBooking.save()
         .then(output=>{
             console.log(output)
             Student.find({email:email})
             .then(student=>{
                 // if student exist
                if (student.length > 0){
                    student[0].bookProgram.push(program);
                    student[0].bookPackage.push(output._id);
                    // save student
                    student[0].save()
                    .then(ans=> {
                        console.log(ans);
                        res.redirect('/')
                        })
                    .catch(err=>console.log(err))
                }
                // else student doesnot exist
                else{
                    //creating new Student
                    const newStudent = new Student({
                        fname,
                        lname,
                        email,
                        password
                    });
                    // saving book program and book package to the new student
                    newStudent.bookProgram.push(program);
                    newStudent.bookPackage.push(output._id);
                    //bcrypting and saving the new student
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newStudent.password, salt, (err, hash) => {
                          if (err) throw err;
                          newStudent.password = hash;
                          newStudent
                            .save()
                            .then(user => {
                              console.log(user);
                              res.redirect('/');
                            })
                        }
                    )
                    }) 
                }          
            })// student then closed
         })  
     })
     .catch(error=>console.log(error))   
});


module.exports = router;