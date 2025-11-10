import Subscription from "../models/subscription.model.js"
import { workflowClient } from "../config/upstash.js";
import { SERVER_URL } from "../config/env.js";

export const createSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.create({
            ...req.body, //spreading everything that the user passes into this call
            user: req.user._id, //knowing which user is trying to create this subscription
        });

        const {workflowRunId} = await workflowClient.trigger({
            url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
            body: {
                subscriptionId: subscription.id,
            },
            headers: {
                'content-type': 'application/json',
            },
            retries: 0,
        })

        res.status(201).json({success: true, data: subscription, workflowRunId});
    } catch (error) {
        next(error)
    }
}
//now creating an another controller that will give me all subscription created by user

export const getUserSubscriptions = async (req, res, next) =>{
    try {
        //check if the user is the same as the one in the token
        if(req.user.id !== req.params.id){ // it checks is the logged in user trying to access their own subscriptions?
            const error = new Error(`Your aren't the owner of this account`);
            error.status = 401;
            throw error;
        }

        const subscriptions = await Subscription.find({user: req.params.id});

        res.status(200).json({success:true, data: subscriptions})

    } catch (e) {
        next(e);
    }
}