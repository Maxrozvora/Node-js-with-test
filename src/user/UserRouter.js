const express = require('express');
const router = express.Router();
const UserService = require('./UserService');
const { check, validationResult } = require('express-validator');
const User = require('./User');

router.post("/api/1.0/users",
check('username').notEmpty().withMessage("usernameNull")
    .bail().isLength({ min: 4 }).withMessage("usernameSize")
    .bail().isLength({ max: 32 }).withMessage("usernameSize"),
check('email').notEmpty().withMessage("emailNull")
    .bail()
    .custom(async email => {
        const user = await UserService.findByEmail(email);
        if (user) {
            throw new Error("emailInUse");
        }
    }),
check('password').notEmpty().withMessage("passwordNull")
    .bail().isLength({ min: 6 }).withMessage("passwordLength")
    .bail().matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/).withMessage("passwordPattern"),
async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const validationErrors = {};
        errors.array().forEach(error => {
            validationErrors[error.param] = req.t(error.msg);
        });
        return res.status(400).send({ validationErrors });
    }
    await UserService.save(req.body);
    return res.status(200).send({ message: req.t("userCreated") });
  });

module.exports = router;
