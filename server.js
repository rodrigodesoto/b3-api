require('rootpath')();
require('dotenv').config();
const express = require('express');
const appWs = require('./server-ws');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerFile = require('./swagger/swagger_output.json');
const swaggerUi = require('swagger-ui-express');
const ticker = require ('./src/stock/stock.service');
const url = '/api/quote/';
const https = require('https');


const app = express();
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan('dev'));
app.post('/login', (req, res, next) => {
    res.json({ token: '123456' });
});

// allow cors requests from any origin and with credentials
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

app.use((error, req, res, next) => {
    console.log('error middleware');
    res.sendStatus(500);
})

// api rotas
app.use('/accounts', require('./src/accounts/accounts.controller'));

// api cotações
app.use('/stocks', require('./src/stock/stock.controller'));

const server = app.listen(process.env.PORT, () => {
    console.log('WebSocket is running on port ' + process.env.PORT);
})

app.get('/teste1', (req, res, next) => {
    res.send('teste1');
})
 
app.get('/teste2', (req, res, next) => {
    try {
        throw new Error('teste2 deu erro');
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})
 
app.get('/teste3', (req, res, next) => {
    throw new Error('teste3 deu erro');
})

const wss = appWs(server);

// setInterval(async () => {
//     const tickers = await ticker.getAll()

//     try {
//         for (let i = 0; i < Object.keys(tickers).length; i++) {
//             await getCurrentQuote(tickers[i].stockCode, await function(err, quote){
//                 if(quote){
//                     wss.broadcast({ id: i, ticker: tickers[i].stockCode.toString() , quote: quote });
//                     console.log({id: i, ticker: tickers[i].stockCode.toString(), quote: quote});
//                 }
//             });
//         }
//     } catch (error) {
//         return error;
//     }
// }, 29000);

// async function getCurrentQuote(ticker, callback) {
//     try {

//       const options = {
//         headers: {
//           'Authorization': 'Bearer fS28BGD8uZPgqCS8vRfrwB'
//         },
//         method: 'GET',
//         hostname: 'brapi.dev',
//         path: url+ticker
//       };

//       const req = await https.request(options, (res) => {
//         let data = '';
       
//         res.on('data', (chunk) => {
//           data += chunk;
//         });
       
//         res.on('end', () => {
//           const jsonData = JSON.parse(data);
//           const quoteTicker = jsonData.results[0];
//           console.log(jsonData);

//           let quote = {}

//           console.log(quoteTicker);
//           if (quoteTicker !== undefined) {
//               quote.price = quoteTicker.regularMarketPrice;
//               // quote.price = quote.price + Math.random()
//               quote.open = quoteTicker.regularMarketOpen;
//               quote.high = quoteTicker.regularMarketDayHigh;
//               quote.low = quoteTicker.regularMarketDayLow;
//               quote.previousClose = quoteTicker.regularMarketPreviousClose;
//               quote.volume = quoteTicker.averageDailyVolume10Day;
//               quote.marketChange = parseFloat(quoteTicker.regularMarketChangePercent*100).toPrecision(2);
//               quote.shortName = quoteTicker.shortName;
//               quote.longName = quoteTicker.longName;
//           }
  
//           callback(null, quote);
//         }).on('error', (err) => {
//           console.error('Erro ao fazer requisição:', err);
//         });
//       });
       
//       req.end();
      
//     } catch (error) {
//         return error;
//     }
// };
module.exports = app;

