// DB schema for booking a certain package
const mongoose = require('mongoose');
const Package = require('./packages'); 

const ratingSchema = new mongoose.Schema ({
    trainerSkills : Number,
    hygiene : Number,
    punctuality : Number,
    overAll : Number
})


const bookSchema = new mongoose.Schema({
    package : {type: mongoose.Schema.Types.ObjectId, ref:'Package' },
    remaining_sessions : {type:Number},
    rating : {ratingSchema},
    recommendation : String
})


var book = mongoose.model('Book',bookSchema);

module.exports = book;