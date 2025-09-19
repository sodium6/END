const customerController = require('../controllers/customer/customerController.js');

const customerRouter = require('express').Router();

customerRouter.get('/', customerController.getsCustomer);
customerRouter.get('/:id', customerController.getCustomer);

module.exports = {
  path: 'customer',
  route: customerRouter,
};
