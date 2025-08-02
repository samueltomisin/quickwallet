const { body } = require('express-validator');

exports.validateInitializePayment = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
  
  body("amount")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be greater than 0")
    .toFloat()
];