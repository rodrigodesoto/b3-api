const express = require('express');
const router = express.Router();
const stockModel = require('./stock.model');
const moment = require("moment");
const authorize = require('src/_middleware/authorize')
const stockService = require('./stock.service');
const {default: yahooFinance} = require("yahoo-finance2");

router.post('/insertStock', authorize(), insertUpdateStock);
router.put('/:id', authorize(), insertUpdateStock);
router.get('/getAllStocks', authorize(), getAllStocks);
router.get('/:id', authorize(), getById);
router.delete('/:id', authorize(), _delete);

router.get('/carteira', authorize(), (req, res) => {
    console.log(res.locals.auth_data);
    return res.send({message: 'Aqui é para buscar as cotações!'});
});

async function insertUpdateStock(req, res) {
    try{
        const stockBody = req.body
        const stock = await stockModel.findOne({stockCode: stockBody.stockCode.toString()})
            if (stock) {
                await getCurrentQuote(stockBody.stockCode, await function(err, quote){
                    if(quote){
                        stockBody.currentPrice = quote.price
                        stockBody.open = quote.open
                        stockBody.high = quote.high
                        stockBody.low = quote.low
                        stockBody.marketChange = quote.marketChange
                    }
                });
                const pass_ok = await stockService.updateStock(stockBody, stock);
                if(pass_ok.errors || pass_ok.name == 'MongoError') return res.status(400).send({ error: pass_ok.errors==undefined?pass_ok.stack:pass_ok.errors});
            } else{
                await getCurrentQuote(stockBody.stockCode, await function(err, quote){
                    if(quote){
                        stockBody.currentPrice = quote.price
                        stockBody.open = quote.open
                        stockBody.high = quote.high
                        stockBody.low = quote.low
                        stockBody.marketChange = quote.marketChange
                    }
                });
                const pass_ok = await stockService.insertStock(stockBody);
                if(pass_ok.errors || pass_ok.name == 'MongoError') return res.status(400).send({ error: pass_ok.errors==undefined?pass_ok.stack:pass_ok.errors});
            }
        return res.status(201).
        send({message: stockBody.stockCode.toString() + ' salvo com sucesso!'});
    }catch(err){
        return res.status(500).send({ error: err});
    }
};

async function getAllStocks(req, res, next) {
    stockService.getAll()
        .then(stocks => res.json(stocks))
        .catch(next);
}

function getById(req, res, next) {
    stockService.getById(req.params.id)
        .then(stock => stock ? res.json(stock) : res.sendStatus(404))
        .catch(next);
}

function _delete(req, res, next) {
    stockService.delete(req.params.id)
        .then(() => res.json({ message: 'Ação excluída com sucesso!' }))
        .catch(next);
}

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

router.get('/stock-price/:stock', authorize(),async (req, res) => {
    let stock = req.params.stock;
        var dateInicial = new Date(moment(new Date(), 'DD/MM/YYYY').format('YYYY-MM-DD  00:01:00'));
        var dateFinal = new Date(moment(new Date(), 'DD/MM/YYYY').format('YYYY-MM-DD  23:59:00'));
        var dateIni = dateInicial.setDate(dateInicial.getDate());
        var dateFin = dateFinal.setDate(dateFinal.getDate());
        // await cotacoesBovespa.getHistorical(`${stock}`, dateIni, dateFin, function (err, quotes) {
        //    if(quotes.length == 0){
        //        return res.status(200).json({ message: 'Sem cotação para a data ' + DateUtils.format(new Date(), 'DD/MM/YYYY') });
        //    }else{
        //        console.log(quotes);
        //        return res.status(200).send(quotes);
        //    }
        // });
        // cotacoesBovespa.getHistoricalData(`${stock}`, function (err, quotes) {
        //     console.log(quotes);
        // });
});

router.get('/stock-price/', authorize(),async (req, res) => {
    let stock = req.query.stock;
    let dataCotacaoIni = req.query.dataCotacaoIni;
    let dataCotacaoFim = req.query.dataCotacaoFim;
    var dateInicial = new Date(moment(dataCotacaoIni, 'DD/MM/YYYY').format('YYYY-MM-DD  00:01:00'));
    var dateFinal = new Date(moment(dataCotacaoFim, 'DD/MM/YYYY').format('YYYY-MM-DD  23:59:00'));
    var dateIni = dateInicial.setDate(dateInicial.getDate());
    var dateFin = dateFinal.setDate(dateFinal.getDate());
    // await cotacoesBovespa.getHistorical(`${stock}`, dateIni, dateFin, function (err, quotes) {
    //     console.log(quotes);
    //     return res.status(200).send(quotes);
    // });
    // cotacoesBovespa.getHistoricalData(`${stock}`, function (err, quotes) {
    //     console.log(quotes);
    // });
});

module.exports = router;
