// import { initializeApp } from 'firebase/app'
require('rootpath')();
require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('src/_middleware/error-handler');
const http = require('http');
const swaggerFile = require('./swagger/swagger_output.json');
const swaggerUi = require('swagger-ui-express');

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// allow cors requests from any origin and with credentials
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

app.use((req, res, next) => {
    // res.header('Access-Control-Allow-Origin', '*');
    next();
  });

// api rotas
app.use('/accounts', require('./src/accounts/accounts.controller'));

// api cotações
app.use('/quotes', require('./src/quotes/stock.controller'));

// global error handler
app.use(errorHandler);

// Create an HTTP service.
http.createServer(app).listen(process.env.PORT || 4000);
console.log('Server listening on port ' + process.env.PORT);

