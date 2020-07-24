const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');


const mysqlDB = require('../config/mysql_config')
const db = mysqlDB();

//MySQL user schema in Mysql folder

router.post('/auth', async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const foundUser = (await db.query(`SELECT * FROM users WHERE email = '${email}'`))[0];
    if (foundUser) {
      return res.status(401).json({ message: 'Email already in use' })
    }
    if (!foundUser) {
      const hash = await bcrypt.hash(password, 10);
      const { insertId } = await db.query(`INSERT INTO users (email, password) values ('${email}', '${hash}')`);
      const newUser = await db.query(`SELECT * from users where id = ${insertId}`);
      const token = getToken(newUser);
      return res.status(200).json(token);
    }
    return res.status(401).json({ message: 'Sign-up failed' })
  } catch (error) {
    console.log(error)
  }
});

router.post('/login', passport.authenticate('local', { session: false }), async (req, res, next) => {
  const token = getToken(req.user)
  res.status(200).json(token);
});


router.get('/secret', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  res.status(200).json('secret page');
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
  res.status(200).json({ accessToken: token });
});






const getToken = (user) => {
  return jwt.sign({
    id: user.id,
    email: user.email
    // || user.google.email || user.facebook.email,
  }, process.env.TOKEN_KEY, { expiresIn: 60 });
}


module.exports = router;
