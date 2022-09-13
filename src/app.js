const express = require('express');
const User = require('./user/User');

// create express app
const app = express();
app.use(express.json());

app.post("/api/1.0/users", async (req, res) => {
  await User.create(req.body);
  return res.status(200).send({ message: "User created" });
});
 
module.exports = app;