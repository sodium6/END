const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middlewares/error-handler.js');
const { NotFoundError } = require('./utils/error.js');
const routes = require('./routes/index.js');

require('dotenv').config();

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

// LOOP ROUTE
routes.forEach(({ path, route }) => {
  app.use(`/api/${path}`, route);
});

// NOT FOUND ROUTES (404)
app.use((req, res, next) => {
  next(new NotFoundError(`The requested URL ${req.originalUrl} was not found.`));
});

// ALL ERROR HANDLER
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.info(`Server is running on port: ${process.env.PORT}`);
});
