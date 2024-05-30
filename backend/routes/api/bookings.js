const express = require('express')
const { setTokenCookie, requireAuth, restoreUser } = require('../../utils/auth')
const { Spot, User, Review, Image, Booking } = require('../../db/models')
const { check } = require('express-validator')
const { handleValidationErrors } = require('../../utils/validation')
const router = express.Router()


// Get current user's bookings
router.get(
    '/current',
    requireAuth,
    async (req, res) => {
        const { user } = req;
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
                message: "Coudn't find bookings",
                statusCode: 404
            })
        }
        res.json({ Bookings: bookings })
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
        } else if (booking.startDate.getTime() < new Date().getTime()) {
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
