const express = require('express');
const db = require('../db/index');

const {
  checkInputRegister,
  checkUsernameRegister
} = require('../middlewares/user');
const { checkWebsiteRegister } = require('../middlewares/site');

const route = express.Router();

route.get('/login', (req, res) => {
  res.render('index', { page: 'login' });
});

route.get('/register', (req, res) => {
  res.render('index', { page: 'register' });
});

route.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/user/login',
    failureFlash: true
  })(req, res, next);
});

route.post(
  '/register',
  checkInputRegister,
  checkUsernameRegister,
  checkWebsiteRegister,
  async (req, res) => {
    try {
      const { username, password1, hostname } = req.body;
      // hash plaintext password
      const hashedPassword = await bcrypt.hash(password1, 12);
      // store and get user id
      const results = await db.query(
        'INSERT INTO "user" (username, password) VALUES ($1, $2) RETURNING id;',
        [username, hashedPassword]
      );
      const userID = results.rows[0].id;
      // store website hostname
      await db.query(
        'INSERT INTO website (hostname, user_id) VALUES ($1, $2);',
        [hostname, userID]
      );

      req.flash('success_message', 'You are now registered and can log in');
      res.redirect('/user/login');
    } catch (e) {
      console.error(e);
    }
  }
);

route.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_message', 'You are logged out');
  res.redirect('/user/login');
});

module.exports = route;
