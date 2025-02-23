import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
import {JWT_SECRET , JWT_EXPIRES_IN } from '../config/env.js'
import { token } from "morgan"

//req.body --> is an object containing data from the client (POST request)

export const signUp =  async (req , res, next) => {

const session = await mongoose.startSession();
session.startTransaction();

try {
    //creating a new user
    const { name, email , password} = req.body;

    //if user already exists -> by checking with the already registerd email 
    const existingUser  =  await User.findOne({email});

    if(existingUser){
        const error = new Error('User already exists');
        error.statusCode = 409;
        throw error;
    }

    //Hash password for the new user--> if the user does not exist i.e new user
    const salt =  await bcrypt.genSalt(10); // salt -> level of complexity to randomise the password
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUsers = await User.create([{name , email,  password: hashedPassword}] , {session}); //if something wrong happens and the session is aborted, then the user will not be created

    // attaching a JWT to the user with the following id
    const token = jwt.sign({userId:newUsers[0]._id} ,JWT_SECRET , {expiresIn: JWT_EXPIRES_IN});

await session.commitTransaction();
session.endSession();

res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: {
        token,
        user: newUsers[0],
    }
});

}catch(error){
    await session.abortTransaction();
    session.endSession();
    next(error);
}

}



export const signIn =  async (req , res, next) => {

    try {
        const { email , password} = req.body;

        const user = await  User.findOne({email});


        if(!user){
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid){
            const error = new Error('Invalid password');
            error.statusCode = 401;  //unauthorized
            throw error;
        }

        const token = jwt.sign({userId: user._id} ,JWT_SECRET , { expiresIn:JWT_EXPIRES_IN});

        res.status(200).json({
            success: true,
            message: ' User Signed in Successfully',
            data: {
                token,
                user
            }
        }); 

    }catch(error){
        next(error);
    }
}




export const signOut=  async (req , res, next) => {

}