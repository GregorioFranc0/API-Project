const express = require('express')
const { setTokenCookie, requireAuth, restoreUser } = require('../../utils/auth')
const { Spot, User, Image, Review } = require('../../db/models')
const { check } = require('express-validator')
const { handleValidationErrors } = require('../../utils/validation')
const router = express.Router()

const validateEditReview = [
    check('review')
        .exists({ checkFalsy: true })
        .withMessage('Review text is required'),
    check('stars')
        .exists({ checkFalsy: true })
        .isInt({ min: 0, max: 5 })
        .withMessage('Stars must be from 1 to 5'),
    handleValidationErrors
]

// Get all reviews
router.get(
    '/',
    async (req, res) => {
        const reviews = await Review.findAll()
        res.json(reviews)
    }
)

// Get all reviews of the current user
router.get(
    '/current',
    requireAuth,
    async (req, res) => {
        const { user } = req;
        const reviews = await Review.findAll({
            where: {
                userId: user.id
            },
            include: [{
                model: User,
                attributes: { exclude: ['username', 'email', 'hashedPassword', 'createdAt', 'updatedAt'] }

            }, {
                model: Spot,
                attributes: { exclude: ['createdAt', 'updatedAt'] }
            }, {
                model: Image, as: "ReviewImages",
                attributes: { exclude: ['imageType', 'imageId', 'preview', 'createdAt', 'updatedAt'] }
            }]
        })
        if (!reviews.length) {
            res.status(404);
            return res.json({
                message: "Couldn't found reviews",
                statusCode: 404
            })
        }

        res.json({ Reviews: reviews })
    }
)


module.exports = router;
