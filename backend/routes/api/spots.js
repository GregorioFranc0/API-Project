const express = require('express')
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User, Spot, SpotImage } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();

//get all spots

router.get(async (req, res, next) => {
    const spot = await Spot.findAll();

    const validSpot = {
        "id": spot.id,
        "ownerId": spot.ownerId,
        "address": spot.address,
        "city": spot.city,
        "state": spot.state,
        "country": spot.country,
        "lat": spot.lat,
        "lng": spot.lng,
        "description": spot.description,
        "price": spot.price,
        "createdAt": spot.createdAt,
        "updatedAt": spot.updatedAt,
        "avgRating": spot.avgRating,
        "previewImage": spot.previewImage
    };



    return res.json({
        spot: validSpot
    });
})


module.exports = router;
