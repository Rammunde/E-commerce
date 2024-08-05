const mongoose=require('mongoose');

const userSchema= new mongoose.Schema({
    firstName:String,
    lastName:String,
    email:String,
    userName:String,
    password:String
});

module.exports= mongoose.model("user",userSchema);