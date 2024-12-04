require('rootpath')();
require('dotenv').config();
require('express-async-errors');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerFile = require('./swagger/swagger_output.json');
const swaggerUi = require('swagger-ui-express');
const nodeSchedule = require('node-schedule');
const pageScraperInfoMoney = require('./src/scraper/pageScraperInfoMoney');
const stockService = require('./src/stock/stock.service');

const job = nodeSchedule.scheduleJob('03 01 * * MON-FRI', () => {
    schedule();
    console.log('Job executou em'+new Date());
    });

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
    console.log('WebServer is running on port ' + process.env.PORT);
})

// app.get('/teste1', (req, res, next) => {
//     res.send('teste1');
// })
 
// app.get('/teste2', (req, res, next) => {
//     try {
//         throw new Error('teste2 deu erro');
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: error.message });
//     }
// })
 
// app.get('/teste3', (req, res, next) => {
//     throw new Error('teste3 deu erro');
// })

async function schedule() {

    try {   
        const arrStock = await pageScraperInfoMoney.scraper();

        for (const stock of arrStock) {
            stockService.insertStocksVar(stock);
        }
    } catch (error) {
        console.log(error.stack);
        return error;
    }
};

// setInterval(async () => {
    //  schedule();
// }, 60000);

module.exports = app;

