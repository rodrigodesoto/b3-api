const express = require('express');
const router = express.Router();
const codAcaoEnum = require('../config/codAcao');
const Acao = require('./stock.model');
const moment = require("moment");
const authorize = require('src/_middleware/authorize')
// var cotacoesBovespa = require('src/cotacoes-bovespa');
const {DateUtils} = require("../util/date-utils");
const tickerEnum = require("../../ticker-enum");
const stockService = require('./stock.service');

router.get('/carteira', authorize(), insertUpdateStock);
// router.post('/insertStock', authorize(), createSchema, create);

router.get('/carteira', authorize(), (req, res) => {
    console.log(res.locals.auth_data);
    return res.send({message: 'Aqui é para buscar as cotações!'});
});

async function insertUpdateStock(req, res) {
    try{
        var col = codAcaoEnum;
        for(var codAcao in col) {
            if (await Acao.findOne({codAcao})) {
                const pass_ok = await stockService.insertStock(codAcao);
                if(!pass_ok) return res.status(400).send({ error: 'Erro ao cadastrar cotações!'});
            } else{
                const pass_ok = await stockService.updateStock(codAcao);
                if(!pass_ok) return res.status(400).send({ error: 'Erro ao atualizar cotações!'});
            }

        }
        return res.status(201).
        send({message: 'Cotações salvas com sucesso!'});
    }catch(err){
        return res.status(500).send({ error: 'Erro no endPoint quotes!'});
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