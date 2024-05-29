const router = require('express').Router();
const sessionRouter = require('./session.js');
const spotsRouter = require('./spots.js')
const usersRouter = require('./users.js')
// const bookingRouter = require('./bookings.js');
const reviewsRouter = require('./reviews.js')
// const spotImageRouter = require('./spotImage');
// const reviewImageRouter = require('./reviewImage.js')
const { restoreUser } = require('../../utils/auth.js');

const { requireAuth } = require('../../utils/auth.js');
const spot = require('../../db/models/spot.js');

const { setTokenCookie } = require('../../utils/auth.js');
const { User } = require('../../db/models');

router.use(restoreUser);

router.use('/session', sessionRouter);

router.use('/users', usersRouter);

router.use('/spots', spotsRouter);

router.use('/reviews', reviewsRouter);

// router.use('/bookings', bookingRouter);

// router.use('/spot-images', spotImageRouter);

// router.use('/review-images', reviewImageRouter)

router.get(
    '/restore-user',
    (req, res) => {
        return res.json(req.user);
    }
);

router.get('/set-token-cookie', async (_req, res) => {
    const user = await User.findOne({
        where: {
            username: 'Demo-lition'
        }
    });
    setTokenCookie(res, user);
    return res.json({ user });
});

router.get(
    '/require-auth',
    requireAuth,
    (req, res) => {
        return res.json(req.user);
    }
);

router.post('/test', (req, res) => {
    res.json({ requestBody: req.body });
});

router.post('/test', function (req, res) {
    res.json({ requestBody: req.body });
});

module.exports = router;
