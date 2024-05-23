const express = require('express')
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();

const validateSignup = [
    check('email')
        .exists({ checkFalsy: true })
        .isEmail()
        .withMessage('Please provide a valid email.'),
    check('username')
        .exists({ checkFalsy: true })
        .isLength({ min: 4 })
        .withMessage('Please provide a username with at least 4 characters.'),
    check('username')
        .not()
        .isEmail()
        .withMessage('Username cannot be an email.'),
    check('password')
        .exists({ checkFalsy: true })
        .isLength({ min: 6 })
        .withMessage('Password must be 6 characters or more.'),
    handleValidationErrors
];

// Sign up a user

router.post(
    '/',
    validateSignup,
    async (req, res) => {
        const { email, password, username, firstName, lastName } = req.body;
        const hashedPassword = bcrypt.hashSync(password);
        const user = await User.create({ firstName, lastName, email, username, hashedPassword });

        const safeUser = {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
        };

        await setTokenCookie(res, safeUser);

        return res.json({
            user: safeUser
        });
    }
);

router.get("/", async (req, res) => {
    const allUsers = await User.findAll();

    return res.json(allUsers);
});

//zaviar told me to comment this, its his fault
// router.post(
//     '/',
//     async (req, res) => {
//         const { email, password, username } = req.body;
//         const hashedPassword = bcrypt.hashSync(password);
//         const user = await User.create({ email, username, hashedPassword });

//         const safeUser = {
//             id: user.id,
//             email: user.email,
//             username: user.username,
//             firstName: user.firstName,
//             lastName: user.lastName
//         };

//         await setTokenCookie(res, safeUser);

//         return res.json({
//             user: safeUser
//         });
//     }
// );

//get all users
router.get(
    '/',
    async (req, res) => {
        const users = await User.findAll();
        res.json(users);
    })

module.exports = router;
