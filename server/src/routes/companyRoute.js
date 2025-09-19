const companyController = require('../controllers/company/companyController.js');
const companySchema = require('../controllers/company/companySchema.js');
const validateSchema = require('../middlewares/zod-validate-handler.js');

const companyRouter = require('express').Router();

companyRouter.get('/', companyController.getsCompany);
companyRouter.get('/:id', companyController.getCompany);
companyRouter.post('/', validateSchema(companySchema), companyController.createCompany);
companyRouter.put('/:id', companyController.updateCompany);
companyRouter.delete('/:id', companyController.deleteCompany);

module.exports = {
  path: 'company',
  route: companyRouter,
};
