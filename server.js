require('rootpath')();
require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('_middleware/error-handler');
// const https = require('https');
const http = require('http');
const fs = require('fs');

// const options = {
//   key: fs.readFileSync('./cert/cert-b3-api.key'),
//   cert: fs.readFileSync('./cert/cert-b3-api.crt')
// };

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// allow cors requests from any origin and with credentials
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });

// api rotas
app.use('/accounts', require('./accounts/accounts.controller'));

// swagger docs rota
app.use('/api-docs', require('_helpers/swagger'));

// global error handler
app.use(errorHandler);

// start server
/* const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, () => {
 console.log('Server listening on port ' + port);
}); */
// Create an HTTP service.
http.createServer(app).listen(process.env.PORT || 4000);
console.log('Server listening on port ' + process.env.PORT);
// Create an HTTPS service identical to the HTTP service.
// https.createServer(options, app).listen(443);
// console.log('Server listening on port ' + 443);