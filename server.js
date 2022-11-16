// import { initializeApp } from 'firebase/app'
require('rootpath')();
require('dotenv').config();
const express = require('express');
const app = express();
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
app.use('/quotes', require('./src/quotes/stock.controller'));

// api ações
// app.use('/stock', require('./src/stock/acao.controller'));

// global error handler
app.use(errorHandler);

// Create an HTTP service.
http.createServer(app).listen(process.env.PORT_AP || 4000);
console.log('Server http listening on port ' + process.env.PORT_AP);

const server = app.listen(process.env.PORT_WS || 3000, () => {
    console.log('WebSocket is running on port ' + process.env.PORT_WS);
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
}, 60000);

async function getCurrentQuote(ticker, callback) {
    const response = await fetch("https://finance.yahoo.com/quote/" + ticker + ".sa/")
    const body = await response.text();
    const main = JSON.parse(
        body.split("root.App.main = ")[1].split(";\n}(this));")[0]
    );
    let quote = {};

    if (
        main.context.dispatcher.stores?.QuoteSummaryStore.financialData !==
        undefined
    ) {
        quote.price = parseFloat(
            main.context.dispatcher.stores.QuoteSummaryStore.financialData
                .currentPrice.fmt
        );
        // quote.price = quote.price + Math.random()
        quote.open = parseFloat(
            main.context.dispatcher.stores.QuoteSummaryStore.price.regularMarketOpen
                .fmt
        );
        quote.high = parseFloat(
            main.context.dispatcher.stores.QuoteSummaryStore.price
                .regularMarketDayHigh.fmt
        );
        quote.low = parseFloat(
            main.context.dispatcher.stores.QuoteSummaryStore.price
                .regularMarketDayLow.fmt
        );
        quote.previousClose = parseFloat(
            main.context.dispatcher.stores.QuoteSummaryStore.price
                .regularMarketPreviousClose.fmt
        );
        quote.volume = parseFloat(
            main.context.dispatcher.stores.QuoteSummaryStore.price
                .regularMarketVolume.fmt
        );
        quote.marketChange = parseFloat(
            main.context.dispatcher.stores.QuoteSummaryStore.price
                .regularMarketChangePercent.fmt
        );
        quote.shortName =
            main.context.dispatcher.stores.QuoteSummaryStore.price.shortName;
        quote.longName =
            main.context.dispatcher.stores.QuoteSummaryStore.price.longName;
    }

    callback(null, quote);
};

module.exports = app;
