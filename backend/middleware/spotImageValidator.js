const { check } = require('express-validator');
const { handleValidationErrors } = require('../utils/validation');
//check req.body

const spotImageValidator = [
    check('url')
        .exists({ checkFalsy: true })
        .withMessage('url is required'),
    check('preview')
        .exists({ checkFalsy: true })
        .withMessage('preview is required'),
    handleValidationErrors
]

module.exports = { spotImageValidator };
