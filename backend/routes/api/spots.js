const express = require('express')
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth, restoreUser } = require('../../utils/auth');
const { User, Spot, SpotImage } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();

//get all spots

router.get(
    '/',
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

        for await (let spot of spots) {
            const previewImage = await Image.findOne({
                where: {
                    imageId: spot.id,
                    preview: true,
                    imageType: "Spot"
                }
            });
            if (previewImage && !spot.previewImage) {
                spot.previewImage = previewImage.url
            } else if (!previewImage && !spot.previewImage) {
                spot.previewImage = "None"
            } else {
                spot.previewImage = spot.previewImage
            }

            const rating = await Review.findAll({
                where: { spotId: spot.id }
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

// Get all spots owned by current user
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
                where: {
                    imageId: spot.id,
                    preview: true,
                    imageType: "Spot"
                }
            });
            if (previewImage && !spot.previewImage) {
                spot.previewImage = previewImage.url
            } else if (!previewImage && !spot.previewImage) {
                spot.previewImage = "None"
            } else {
                spot.previewImage = spot.previewImage
            }

            const rating = await Review.findAll({
                where: { spotId: spot.id }
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
    '/:spotId',
    async (req, res) => {

        const spot = await Spot.findByPk(req.params.spotId, {

        });

        if (spot) {
            const previewImage = await Image.findOne({
                where: {
                    imageId: req.params.spotId,
                    preview: true,
                    imageType: "Spot"
                }
            });


            spot.dataValues.SpotImages = []
            const allImages = await Image.findAll({
                where: {
                    imageId: req.params.spotId,
                    imageType: "Spot"
                }
            })
            spot.dataValues.SpotImages = [...allImages]


            if (previewImage && !spot.previewImage) {
                spot.previewImage = previewImage.url
                // spot.dataValues.SpotImages.push(previewImage.url)
            } else if (!previewImage && !spot.previewImage) {
                spot.previewImage = "None"
            } else {
                spot.previewImage = spot.previewImage
            }

            const rating = await Review.findAll({
                where: { spotId: req.params.spotId }
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

module.exports = router;
