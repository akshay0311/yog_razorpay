const mongoose = require('mongoose');
const Book = require('./book');


//Student Bio & Session
var studentSchema = mongoose.Schema({
    /*------------------Bio of the customer----------------*/
    fname : {type:String},
    lname : {type:String},
    email : {type:String},
    password : {type:String},
    phone : {type:String},
    profile_pic : {type:String},  
    /*----------------------Address of the customer-------------------*/
    country : String,
    state : String,
    city : String,
    house : String,
    pincode : String,
    latitude : Number,
    longitude : Number,
    /*------------------Trial Package Related preferences of the customer---------*/ 
    gender : String,
    time:String,
    method:String,
    program:String,
    participants:String,
    timeSlot:String,
    timeSlot1:String,
    /*--------------------Booked Package Info of the customer-------------------*/
    bookProgram : [{type:String}],
    bookPackage : [{type: mongoose.Schema.Types.ObjectId, ref:'Book' }]
})


var student = mongoose.model('students',studentSchema);

module.exports = student;