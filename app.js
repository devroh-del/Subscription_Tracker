import express from "express";
import cookieParser from 'cookie-parser';
import {PORT} from './config/env.js';
import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import connectToDataBase from "./Database/mongoDB.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import arcjetMiddleware from "./middlewares/arcject.middleware.js";
import workflowRouter from "./routes/workflow.routes.js";

const app = express();

app.use(express.json())
app.use(express.urlencoded({extended: false})); //process the form data
app.use(cookieParser())
app.use(arcjetMiddleware)

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/subscriptions', subscriptionRouter)
app.use('/api/v1/workflows', workflowRouter)

app.use(errorMiddleware)

app.get('/', (req, res)=>{

    res.send('Welcome to the Subscription Tracker API!')
    
});

app.listen(5500, async ()=>{
    console.log(`Subscription tracker API is running on http://localhost:${5500}`)
    await connectToDataBase()
    
}).on('error', (err) => {
  console.error("Server failed to start:", err.message);
});
;

export default app;
