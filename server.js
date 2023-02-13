require('rootpath')();
require('dotenv').config();
const express = require('express');
const appWs = require('./server-ws');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('src/_middleware/error-handler');
const http = require('http');
const swaggerFile = require('./swagger/swagger_output.json');
const swaggerUi = require('swagger-ui-express');
var fetch = require("node-fetch");
var tickerEnum = require('./ticker-enum');
const yahooFinance = require ('yahoo-finance2').default;

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

app.use((req, res, next) => {
    // res.header('Access-Control-Allow-Origin', '*');
    next();
  });

// api rotas
app.use('/accounts', require('./src/accounts/accounts.controller'));

// api cotações
app.use('/quotes', require('./src/stock/stock.controller'));

const server = app.listen(process.env.PORT, () => {
    console.log('WebSocket is running on port ' + process.env.PORT);
})

const wss = appWs(server);

setInterval(async () => {
    try {
        for (let i = 0; i < Object.keys(tickerEnum).length; i++) {
            await getCurrentQuote(Object.keys(tickerEnum)[i].toString(), await function(err, quote){
                if(quote){
                    wss.broadcast({ id: i, ticker: Object.keys(tickerEnum)[i].toString() , quote: quote });
                    console.log({id: i, ticker: Object.keys(tickerEnum)[i].toString(), quote: quote});
                }
            });
        }
    } catch (error) {
        return error;
    }
}, 29000);

async function getCurrentQuote(ticker, callback) {
    try {
        let quote = {}
        const queryOptions = { modules: ['price', 'summaryDetail'] }; // defaults
        const quoteTicker = await yahooFinance.quoteSummary(ticker+'.SA', queryOptions);
        console.log(quoteTicker);
        if (quoteTicker !== undefined) {
            quote.price = quoteTicker.price.regularMarketPrice;
            // quote.price = quote.price + Math.random()
            quote.open = quoteTicker.price.regularMarketOpen;
            quote.high = quoteTicker.price.regularMarketDayHigh;
            quote.low = quoteTicker.price.regularMarketDayLow;
            quote.previousClose = quoteTicker.price.regularMarketPreviousClose;
            quote.volume = quoteTicker.summaryDetail.averageVolume;
            quote.marketChange = parseFloat(quoteTicker.price.regularMarketChangePercent*100).toPrecision(2);
            quote.shortName = quoteTicker.price.shortName;
            quote.longName = quoteTicker.price.longName;
        }

        callback(null, quote);
    } catch (error) {
        return error;
    }
};

module.exports = app;

