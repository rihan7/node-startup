const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

const User = require('../model/user');
const passportConfig = require('../config/passport');
const passportJWT = passport.authenticate('jwt', { session: false });


const getToken = (user) => {
  return jwt.sign({
    id: user._id,
    email: user.local.email || user.google.email || user.facebook.email,
  }, process.env.TOKEN_KEY, { expiresIn: 60 });
}

//sign up with email & password
router.post('/auth', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({
      $or: [
        { 'local.email': email },
        { 'google.email': email },
        { 'facebook.email': email },
      ]
    }).exec();

    if (user && user.local.email)
      return res.status(401).json({ message: 'Email already exists' });

    if (user && !user.local.email) {
      user.method.push('local');
      user.local = { email, password };
      await user.save();
    } else {
      user = new User({ method: ['local'], local: { email, password } });
      await user.save();
    }

    const token = getToken(user);
    res.status(200).json({ accessToken: token, user });
  } catch (error) {
    res.status(401).json({ error: error })
  }
});

router.post('/signin', passport.authenticate('local', { session: false }), async (req, res, next) => {
  const token = getToken(req.user);
  res.status(200).json({ accessToken: token });
});

router.get('/secret', passportJWT, async (req, res, next) => {
  res.status(200).json('secret page')
});


router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));


router.get('/auth/google/redirect', passport.authenticate('google', { session: false }), async (req, res, next) => {
  const token = getToken(req.user);
  res.status(200).json({ accessToken: token });
});

router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/redirect', passport.authenticate('facebook', { session: false }), (req, res) => {
  const token = getToken(req.user);
  res.status(200).json({ accessToken: token }); (token)
});


module.exports = router;
