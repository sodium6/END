const express = require('express');
const router = express.Router();

const authRoute = require('./authRoute.js');
const portfolioRoute = require('./portfolioRoute.js');

module.exports = [ authRoute, portfolioRoute];
