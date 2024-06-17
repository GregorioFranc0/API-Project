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

//get the current user
router.get(
    '/:id',
    requireAuth,
    async (req, res) => {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            res.status(403);
            return res.json({ message: "Forbidden" })
        }
        res.json(user)
    }
)

//get all users
router.get("/", async (req, res) => {
    const allUsers = await User.findAll();

    return res.json(allUsers);
});

// Sign up a user

router.post(
    '/',
    validateSignup,
    async (req, res) => {
        const {
            firstName,
            lastName,
            email,
            password,
            username
        } = req.body;

        const hashedPassword = bcrypt.hashSync(password);

        const userName = await User.findOne({ where: { username: username } })
        if (userName) {
            const err = new Error('User with that username already exists')
            res.status(500)
            res.json({
                message: "User already exists",
                statusCode: 500,
                errors: err.message
            })
        }
        const userEmail = await User.findOne({ where: { email: email } })
        if (userEmail) {
            const err = new Error('User with that email already exists')
            res.status(500)
            res.json({
                message: 'User already exists',
                statusCode: 500,
                errors: err.message
            })
        }
        const user = await User.create({
            firstName, lastName, email, username, hashedPassword
        });

        await setTokenCookie(res, user);

        const newUser = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username
        }

        return res.json({
            user: newUser
        });
    }
);

// Delete a user
router.delete(
    '/:id',
    requireAuth,
    async (req, res) => {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            res.status(404);
            return res.json({ message: 'User not found' });
        }
        await user.destroy();
        return res.status(201).json({ message: 'User successfully deleted' })
    });



module.exports = router;
