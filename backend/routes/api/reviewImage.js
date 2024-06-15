const express = require('express')
const { setTokenCookie, requireAuth, restoreUser } = require('../../utils/auth')
const { Spot, User, ReviewImage, Review, Booking, sequelize } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const e = require('express');
const router = express.Router();

// Delete a review image
router.delete(
    '/:reviewImageId',
    async (req, res) => {
        const image = await ReviewImage.findByPk(req.params.reviewImageId)

        if (!image) {
            return res.status(404).json({
                message: "Review Image could not be found",
                statusCode: 404
            })
        } else {
            await image.destroy();
            return res.status(201).json({
                message: "Deleted image successfully",
                statusCode: 201
            })
        }
    }
)

module.exports = router;
