import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'
import {JWT_SECRET, JWT_EXPIRES_IN} from '../config/env.js'

export  const signUp = async(req, res, next) => {
    const session = await mongoose.startSession(); 
    session.startTransaction() //we're doing this because we want to perform atomic operation

    try{
        //create a new user
        const {name, email, password} = req.body;

        //checks if a user already exists
        const existingUser = await User.findOne({email});

        if(existingUser){
            const error = new Error('User already exists ');
            error.statusCode = 409; // this means it already exists
            throw error;
        }

        //Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUsers = await User.create([{name, email, password: hashedPassword}], {session})

        const token = jwt.sign({userId: newUsers[0]._id}, JWT_SECRET, {expiresIn: "1d"})

        await session.commitTransaction()
        session.endSession()

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                token,
                user: newUsers[0]
            }
        })
    } catch(error){
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}
export  const signIn = async(req, res, next) => {
    try {
        const {email, password} = req.body; // destructuring the email and passsword

        const user = await User.findOne({email}) // checking if a user exists

        if(!user){
            const error = new Error('User not found');
            error.statusCode = 404; // this means user isn't found
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password) // if user exists then validating the password

        if(!isPasswordValid){ // if password is invalid
            const error = new Error('Invalid Password');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({ userId: user._id}, JWT_SECRET, {expiresIn:"1d"} )

        res.status(200).json({
            success: true,
            message: "User signed in successfully",
            data: {
                token,
                user,
            }
        })
    } catch (error) {
        next(error)
    }
}
export  const signOut = async(req, res, next) => {

}