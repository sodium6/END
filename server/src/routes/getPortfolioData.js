const GetPortfolioController = require('../controllers/user/porttemplate/getPortfolioData.js');

const router = require('express').Router();


router.get("/data/:userId", GetPortfolioController.getPortfolioData);


module.exports = {
  path: 'data',
  route: router,
};
