const mongoose = require('mongoose');


const QualificationSchema = new mongoose.Schema({
   q: {type:String,required:true},
   c_img_path : {type:String}
})


const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone:{
    type : Number
  },
  email: {
    type: String,
    required: true
  },
  bio : {
    type:String
  },
  password: {
    type: String,
    required: true
  },
  address:{
    type:String
  },
  date: {
    type: Date,
    default: Date.now
  },
  qual1 : { q: {type:String},c_img_path : {type:String}},
  qual2 : { q: {type:String},c_img_path : {type:String}},
  qual3 : { q: {type:String},c_img_path : {type:String}},
  qual4 : { q: {type:String},c_img_path : {type:String}},
  qual5 : { q: {type:String},c_img_path : {type:String}},
  qual6 : { q: {type:String},c_img_path : {type:String}},
  qual7 : { q: {type:String},c_img_path : {type:String}},
  qual8 : { q: {type:String},c_img_path : {type:String}},
  p_img_path :[String],
  pr_img_path : String,
  accnt_name : String,
  accnt_num : String,
  b_name : String,
  b_address : String,
  ifsc : String,
  aadh : String,
  pan: String
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
