const express = require('express')
const { setTokenCookie, requireAuth, restoreUser } = require('../../utils/auth')
const { Spot, User, SpotImage, Review, ReviewImage, Booking, sequelize } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const e = require('express');
const reviews = require('../../db/models/review');
const router = express.Router();


// Delete a spot image
router.delete(
    '/:spotImageId',
    requireAuth,
    async (req, res) => {
        const image = await SpotImage.findOne({
            where: {
                id: req.params.spotImageId,

            },
            include: {
                model: Spot, where: { id: req.params.spotImageId }
            }
        });
        if (!image) {
            return res.status(404).json({
                message: "Spot Image couldn't be found",
                statusCode: 404
            })
        } else {
            await image.destroy();
            return res.status(200).json({
                message: "Successfully deleted",
                statusCode: 200
            })
        }
    }
)

module.exports = router;
