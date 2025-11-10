import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../config/env.js";
import User from '../models/user.model.js';

const authorize = async (req, res, next) =>{
    try {
        let token; 

        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){ 
            //when token passed through headers it starts with bearer
            token = req.headers.authorization.split(' ')[1]; //so to split it we use this to get our token
        }

        if(!token) return res.status(401).json({message: 'Unauthorized'});

        const decoded = jwt.verify(token, JWT_SECRET); // if token is there, then we're gonna verify it by this

        const user = await User.findById(decoded.userId) //if user still exist by fetching it from the DB

        if(!user) return res.status(401).json({message:'Unauthorized'}); // if doesn't exist then throwing err

        req.user = user; //if exist, we'll attach user to request that is being made

        next(); // then forward it to over to the second part of the request

    } catch (error) {
    res.status(401).json({message: 'Unauthorized', error: error.message})
    }
}

export default authorize;