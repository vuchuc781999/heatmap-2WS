const express = require('express');
const { login, register } = require('../controllers/user');

const router = express.Router();

router.get('/login', login);

router.get('/register', register);

module.exports = router;