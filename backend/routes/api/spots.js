const express = require('express')
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth, restoreUser } = require('../../utils/auth');
const { User, Spot, SpotImage, Review, ReviewImage, Booking, sequelize } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { spotImageValidator } = require('../../middleware/spotImageValidator');
const { CustomError } = require('../../utils/errors');
const router = express.Router();

const validateCreateBooking = [
    check('endDate')
        .exists()
        .isBefore('startDate')
        .withMessage('endDate cannot be on or before startDate'),
    check('endDate')
        .exists()
        .isAfter('startDate')
        .withMessage('startDate cannot be on or after endDate'),
    handleValidationErrors
]

const validateCreateReview = [
    check('review')
        .exists({ checkFalsy: true })
        .withMessage('Review text is required'),
    check('stars')
        .isInt({ min: 0, max: 5 })
        .withMessage('Stars must be from 1 to 5'),
    handleValidationErrors
]

const validateCreateSpot = [
    check('address')
        .exists({ checkFalsy: true })
        .withMessage('Street address is required'),
    check('city')
        .exists({ checkFalsy: true })
        .withMessage('City is required'),
    check('state')
        .exists({ checkFalsy: true })
        .withMessage('State is required'),
    check('country')
        .exists({ checkFalsy: true })
        .withMessage('Country is required'),
    check('lat')
        .exists({ checkFalsy: true })
        .isDecimal()
        .withMessage('Latitude is not valid'),
    check('lng')
        .exists({ checkFalsy: true })
        .isDecimal()
        .withMessage('Longitude is not valid'),
    check('name')
        .exists({ checkFalsy: true })
        .isLength({ max: 50 })
        .withMessage('Name must be less than 50 characters'),
    check('description')
        .exists({ checkFalsy: true })
        .withMessage('Description is required'),
    check('price')
        .exists({ checkFalsy: true })
        .withMessage('Price per day is required'),
    handleValidationErrors
]

//get all spots
//FIXED: keep id in create-spot.js migration, do not pass in id on spot.create
router.get(
    '/',
    requireAuth,
    async (req, res) => {
        let { page, size } = req.query;

        page = Number(page);
        size = Number(size);

        if (Number.isNaN(page)) page = 1;
        if (Number.isNaN(size)) size = 20

        if (page <= 0) {
            return res.status(400).json({
                "message": "Validation Error",
                "statusCode": 400,
                "errors": {
                    "page": "Page must be greater than or equal to 1"
                }
            })
        }
        if (size <= 0) {

            return res.status(400).json({
                "message": "Validation Error",
                "statusCode": 400,
                "errors": {
                    "size": "Size must be greater than or equal to 1"
                }
            })
        }

        const spots = await Spot.findAll({
            limit: size,
            offset: size * (page - 1)
        })

        for (let spot of spots) {
            const previewImage = await SpotImage.findOne({
                where: {
                    spotId: spot.id,
                    preview: true
                }
            });
            // console.log("preview image: " + previewImage);
            if (previewImage && !spot.previewImage) {
                spot.previewImage = previewImage.url
            } else if (!previewImage && !spot.previewImage) {
                spot.previewImage = "None"
            } else {
                spot.previewImage = spot.previewImage
            }

            const rating = await Review.findAll({
                where: { id: spot.id }
            })

            let sum = 0;

            if (rating.length) {
                rating.forEach(rating => {
                    sum += rating.stars
                });
                let avg = sum / rating.length;

                spot.avgRating = avg
            } else {
                spot.avgRating = 0
            }
        }

        res.json({
            Spots: spots, page, size
        })
    }
)



// Create a spot
//make sure to pass in proper json object in the body
router.post(
    '/',
    requireAuth, validateCreateSpot,
    async (req, res) => {
        // console.log("CONSOLE LOG " + req.user)
        const ownerId = req.user.id;


        const {
            address,
            city,
            state,
            country,
            lat,
            lng,
            name,
            description,
            price,
            // previewImage
        } = req.body;
        const spot = await Spot.create({
            ownerId, address, city, state, country, lat, lng, name, description, price
        });

        return res.status(201).json(spot)
    }
)

// Get all spots owned by current user
//make sure you are logging in users from the seeder files
router.get(
    '/current',
    requireAuth,
    async (req, res) => {
        const { user } = req;
        const spots = await Spot.findAll({
            where: {
                ownerId: user.id
            }

        })
        for await (let spot of spots) {
            const previewImage = await SpotImage.findOne({
                // where: {
                //     id: spot.id,
                //     preview: true,
                // }
            });
            if (previewImage && !spot.previewImage) {
                spot.previewImage = previewImage.url
            } else if (!previewImage && !spot.previewImage) {
                spot.previewImage = "None"
            } else {
                spot.previewImage = spot.previewImage
            }

            const rating = await Review.findAll({
                where: { id: spot.id }
            })

            let sum = 0;

            if (rating.length) {
                rating.forEach(rating => {
                    sum += rating.stars
                });
                let avg = sum / rating.length;

                spot.avgRating = avg
            } else {
                spot.avgRating = 0
            }
        }
        if (!spots.length) {
            res.status(404);
            return res.json({
                message: "Spot couldn't be found",
                stateCode: 404
            })
        }
        res.json({ Spots: spots })
    }
)
// Get details of spot from ID
router.get(
    '/:id',
    requireAuth,
    async (req, res) => {

        const spot = await Spot.findByPk(req.params.id, {

        });

        if (spot) {
            const previewImage = await SpotImage.findOne({
                where: {
                    id: req.params.id,
                    preview: true,

                }
            });


            spot.dataValues.SpotImages = []
            const allImages = await SpotImage.findAll({
                where: {
                    id: req.params.id,

                }
            })
            spot.dataValues.SpotImages = [...allImages]


            if (previewImage && !spot.previewImage) {
                spot.previewImage = previewImage.url
            } else if (!previewImage && !spot.previewImage) {
                spot.previewImage = "None"
            } else {
                spot.previewImage = spot.previewImage
            }

            const rating = await Review.findAll({
                where: { id: req.params.id }
            })

            let sum = 0;

            if (rating.length) {
                rating.forEach(rating => {
                    sum += rating.stars
                });
                let avg = sum / rating.length;

                spot.avgRating = avg
            } else {
                spot.avgRating = 0
            }
        }

        if (spot.id === null) {

            res.status(404);
            return res.json({
                message: "Spot couldn't be found",
                stateCode: 404
            })
        }
        res.json(spot);
    }
);

// Edit a spot
//pass in json object in body
//loop through key value pairs
//save spot data
router.put(
    '/:id',
    requireAuth,
    async (req, res) => {
        const { address, city, state, country, lat, lng, name, description, price } = req.body;
        const spot = await Spot.findByPk(req.params.id);
        if (!spot) res.status(404).json({ message: "Spot could not be found" });


        for (let key in req.body) {
            let value = req.body[key];
            spot[key] = value;
            // console.log("KEY", key, "VALUE", value, "OBJECT", Object.values(spot))

        }

        // console.log("THIS IS THE SPOT", spot);
        await spot.save();
        res.json(spot)
    }
)

// Delete a spot by spotId
//pass in spot id to delete
router.delete(
    '/:id',
    requireAuth,
    async (req, res) => {
        const spot = await Spot.findByPk(req.params.id);
        console.log("THIS IS THE SPOT---- ", spot)
        if (!spot) {
            res.status(404);
            return res.json({ message: 'Spot not found' })
        }
        if (req.user.id !== spot.ownerId) {
            const err = new Error('Forbidden')
            res.status(403);
            res.json({
                message: err.message,
                statusCode: 403
            })
        }

        await spot.destroy();
        return res.status(201).json(spot)
    }

)

// Add a image to a spot by spotId
router.post(
    '/:spotId/images',
    requireAuth,
    async (req, res) => {
        const spot = await Spot.findByPk(req.params.spotId);
        // console.log("#########", spot, req.params.spotId);
        if (!spot) {
            res.status(404);
            return res.json({
                message: "Spot couldn't be found",
                stateCode: 404
            })
        }
        const { url, preview, } = req.body;
        const image = await SpotImage.create({
            spotId: req.params.spotId,
            url,
            preview
        })
        // console.log("#####_#_##_#", image);
        const resObject = {
            id: image.id,
            url: image.url,
            preview: image.preview
        }
        return res.status(201).json(resObject)
    }
)

// Get all reviews by a spotId
router.get(
    '/:id/reviews',
    async (req, res) => {
        const spotReview = await Review.findAll({
            where: {
                id: req.params.id
            },
            include: [{
                model: User,
                attributes: { exclude: ['username', 'email', 'hashedPassword', 'createdAt', 'updatedAt'] }
            }, {
                model: ReviewImage, as: "ReviewImages",
                attributes: { exclude: ['preview', 'createdAt', 'updatedAt'] }
            }]
        });
        if (!spotReview.length) {
            res.status(404);
            return res.json({
                message: "Spot couldn't be found",
                statusCode: 404
            })
        }
        res.json({ Reviews: spotReview })
    }
)

// Create a review for a spot by spotId
router.post(
    '/:spotId/reviews',
    requireAuth,
    validateCreateReview,

    async (req, res) => {
        const spot = await Spot.findByPk(req.params.spotId);

        console.log("THIS IS THE SPOT----- ", spot);

        if (!spot) {
            res.status(404);
            return res.json({
                message: "Spot could not be found",
                statusCode: 404
            })
        }
        const userId = await Review.findOne({
            where: { userId: req.user.id },
            include: [{
                model: Spot,
                where: { id: req.params.spotId }
            }]
        })
        if (userId) {
            const err = new Error('User has already posted a review.')
            res.status(403).json({
                message: err.message,
                statusCode: 403,
            })
        }

        const { review, stars } = req.body;
        const newReview = await Review.create({
            userId: req.user.id,
            spotId: spot.id,
            id: req.params.id,
            review,
            stars
        })

        return res.status(201).json(newReview)
    }
)



//Get all bookings by spotId
router.get(
    '/:spotId/bookings',
    requireAuth,
    async (req, res) => {

        const spot = await Spot.findByPk(req.params.spotId)
        console.log("SPOT--------- ", spot);
        if (!spot) {
            res.status(404).json({
                message: "Spot couldn't be found",
                statusCode: 404
            })
        }
        if (spot.ownerId === req.user.id) {
            const bookings = await Booking.findAll({
                where: {
                    // id: req.params.id,
                    spotId: req.params.spotId,
                    // user: req.params.userId
                },
                include: {
                    model: User,
                    attributes: { exclude: ['username', 'email', 'hashedPassword', 'createdAt', 'updatedAt'] }
                },
            })
            return res.status(201).json({ Booking: bookings })
        } else {
            const bookings = await Booking.findAll({
                where: {
                    id: req.params.id,
                },
                attributes: {
                    exclude: ['id', 'userId', 'createdAt', 'updatedAt']
                }
            })
            return res.status(201).json({ Bookings: bookings })
        }
    }
)

//Create a booking by spotId
router.post(
    '/:spotId/bookings',
    requireAuth,
    async (req, res) => {
        const { startDate, endDate } = req.body;

        const start = new Date(startDate);
        const end = new Date(endDate);

        const spot = await Spot.findByPk(req.params.spotId);


        if (!spot) {
            return res.status(404).json({
                message: "Spot couldn't be found",
                statusCode: 404
            })
        };
        if (start >= end) {
            return res.status(400).json({
                message: "Validation error",
                statusCode: 400,
                error: ["endDate cannot be on or before startDate"]
            })
        }

        const bookings = await Booking.findAll({
            // include: {
            //     model: Spot,
            //     where: {
            //         id: req.params.spotId
            //     }
            // }
        })

        const checkDate = bookings.some(booking =>
            start.getTime() <= booking.startDate.getTime() && booking.startDate.getTime() <= end.getTime() ||
            booking.startDate.getTime() <= start.getTime() && end.getTime() <= booking.endDate.getTime() ||
            start.getTime() <= booking.endDate.getTime() && booking.endDate.getTime() <= end.getTime() ||
            start.getTime() <= booking.startDate.getTime() && booking.endDate.getTime() <= end.getTime()
        )

        if (!checkDate) {
            const booking = await Booking.create({
                id: req.params.id,
                userId: req.user.id,
                startDate, endDate,
            })
            return res.status(201).json(booking)
        } else {
            return res.status(403).json({
                message: 'Sorry, this spot is already booked.',
                statusCode: 403,
                errors: [
                    "Start date conflicts with an existing booking",
                    "End date conflicts with an existing booking"
                ]
            })
        }
    }
)





module.exports = router;
