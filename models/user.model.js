import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

name: {
    type: String,
    required: [true ,' User Name is required'],
    minlength: 2,
    maxlength:50,
    trim: true
},
email :{
    type: String,
    required: [true ,' Email is required'],
    trim: true,
    unique:true,
    lowercase:true,
    match:[/\S+@\S+\.\S+/  , 'Please enter a valid email address'],
},
password:{
    type: String,
    required: [true ,  'Password is required'],
    minlength: 6,
}

} ,{timestamps:true});  


const User = mongoose.model('User' , userSchema);

export default User; 