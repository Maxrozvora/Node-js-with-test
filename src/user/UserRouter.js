const express = require('express');
const router = express.Router();
const UserService = require('./UserService');
const { check, validationResult } = require('express-validator');
const User = require('./User');

router.post("/api/1.0/users",
check('username').notEmpty().withMessage("Username cannot be null").bail().isLength({ min: 4 }).withMessage("Username must be at least 4 characters long and at most 32 characters long")
    .bail().isLength({ max: 32 }).withMessage("Username must be at least 4 characters long and at most 32 characters long"),
check('email').notEmpty().withMessage("Email cannot be null")
    .bail()
    .custom(async email => {
        const user = await UserService.findByEmail(email);
        if (user) {
            throw new Error("Email already in use");
        }
    }),
check('password').notEmpty().withMessage("Password cannot be null")
    .bail().isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
    .bail().matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/).withMessage("Password must contain at least one uppercase letter and one number"),
async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const validationErrors = {};
        errors.array().forEach(error => {
            validationErrors[error.param] = error.msg;
        });
        return res.status(400).send({ validationErrors });
    }
    await UserService.save(req.body);
    return res.status(200).send({ message: "User created" });
  });

module.exports = router;
