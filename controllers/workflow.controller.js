import dayjs from 'dayjs';
import {createRequire} from 'module';
const require = createRequire(import.meta.url);
const {serve} = require('@upstash/workflow/express');

import Subscription from '../models/subscription.model.js';
import { sendReminderEmail } from '../utils/send-email.js';

const REMINDERS = [7, 5, 2, 1];

export const sendReminders = serve(async (context)=>{
    const {subscriptionId} = context.requestPayload; // extracting subsciption ID from a specific workflow
    const subscription = await fetchSubscription(context, subscriptionId); // fetching the details of a subscription

    if(!subscription || subscription.status !== 'active') return; // it refers subscription isn't there or not active then exit

    const renewalDate = dayjs(subscription.renewalDate); // dayjs == current date and time

    if(renewalDate.isBefore(dayjs())){ // we're checking if renewal date is before current date and time
        console.log(`Renewal Date has passed for subscription ${subscriptionId}. Stopping workflow`);
        return; // return here means exit out of the workflow
    }

    for( const daysBefore of REMINDERS){
        const reminderDate = renewalDate.subtract(daysBefore, 'day')
        //renewal Date = 22 feb, reminder date = 15 feb, 17, 20, 21 

        if(reminderDate.isAfter(dayjs())){ //putting the reminder to sleep until it's ready to be used
            await sleepUntilReminder(context, `Reminder ${daysBefore} days before`, reminderDate);
        }

        if(dayjs().isSame(reminderDate, 'day')){
            await triggerReminder(context, `${daysBefore} days before reminder`, subscription)
            //Run logic when date arrives  
        }

    }

})

const fetchSubscription = async (context, subscriptionId) => {
    return await context.run('get Subscription', async() => {

        return Subscription.findByID(subscriptionId).populate('user', 'name email');
    })
}

const sleepUntilReminder = async (context, label, date) => {
    console.log(`Sleeping until ${label} reminder at ${date}`);
    await context.sleepUntil(label, date.toDate());
}

const triggerReminder = async(context, label, subscription) =>{
    return await context.run(label, async () =>{
        console.log(`Triggering ${label} reminder`);  

        await sendReminderEmail({
            to: subscription.user.email,
            type: label,
            subscription: subscription

        })
    })
}