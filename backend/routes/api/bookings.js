const express = require('express')
const { setTokenCookie, requireAuth, restoreUser } = require('../../utils/auth')
const { Spot, User, Review, SpotImage, ReviewImage, Booking } = require('../../db/models')
const { check } = require('express-validator')
const { handleValidationErrors } = require('../../utils/validation')
const router = express.Router()


// Get current user's bookings
router.get(
    '/current',
    requireAuth,
    async (req, res) => {
        const user = req.user;
        const bookings = await Booking.findAll({
            where: {
                userId: user.id
            },
            attributes: {
                exclude: ['spotId', 'userId']
            },
            include: {
                model: Spot,
                attributes: { exclude: ['createdAt', 'updatedAt'] }
            }
        })
        if (!bookings.length) {
            res.status(404).json({
                message: "Couldn't find bookings",
                statusCode: 404
            })
        }
        res.status(200).json({ Booking: bookings })
    }
)
//Edit a booking
router.put(
    '/:bookingId',
    async (req, res) => {
        const booking = await Booking.findByPk(req.params.bookingId);
        if (!booking) {
            return res.status(404).json({
                message: "Booking couldn't be found",
                statusCode: 404
            });
        };
        const { startDate, endDate } = req.body;
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) {
            return res.status(400).json({
                message: "Validation error",
                statusCode: 400,
                error: ["end date cannot be on or before start date"]
            })

        } else if (start <= booking.startDate && booking.startDate <= end ||
            booking.startDate <= start && end <= booking.endDate ||
            start <= booking.endDate && booking.endDate <= end ||
            start <= booking.startDate && booking.endDate <= end) {

            return res.status(403).json({
                message: 'Sorry, this spot is already booked for the specified dates',
                statusCode: 403,
                errors: [
                    "Start date conflicts with an existing booking",
                    "End date conflicts with an existing booking"
                ]
            })

        } else if (start < booking.endDate && booking.startDate <= new Date()) {

            return res.status(403).json({
                message: "Past bookings can't be modified",
                statusCode: 403
            })
        } else {
            booking.startDate = startDate;
            booking.endDate = endDate;
            booking.spotId = booking.spotId;
            booking.userId = req.user.id;
            await booking.save();
            return res.status(200).json(booking)
        }
    }
)

// Delete a booking
router.delete(
    '/:bookingId',
    requireAuth,
    async (req, res) => {
        const booking = await Booking.findByPk(req.params.bookingId);
        if (!booking) {
            return res.status(404).json({
                message: "Booking could not be found",
                statusCode: 404
            })
        } else if (booking.startDate < new Date()) {
            return res.status(403).json({
                message: "Bookings that have been started can't be deleted",
                statusCode: 403
            })
        } else {
            await booking.destroy();
            return res.status(200).json({
                message: 'Booking Successfully Deleted',
                statusCode: 200
            })
        }
    }
)



module.exports = router;
