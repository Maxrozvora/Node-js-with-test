const express = require('express');
const userRouter = require('./user/UserRouter');

// create express app
const app = express();
app.use(express.json());

app.use(userRouter);
 
module.exports = app;