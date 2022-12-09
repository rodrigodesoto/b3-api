﻿const db = require('src/_helpers/db');
const Acao = require("../stock/acao");
const fetch = require("node-fetch");

module.exports = {
    getAll,
    create,
    update,
    getAcao,
    salvarAcao,
    delete: _delete
};

async function salvarAcao(codAcao){
    let ret = true;
    await getCurrentQuote(codAcao, await function(err, quote){
        if(quote){
            const acaoCarteira = {
                codAcao: codAcao,
                vlrAtual: quote.price,
                vlrCompra: null,
                varDia: quote.marketChange,
                var30d: null,
                var12m: null,
                qtd: null,
                vlrInvest: null,
                vlrTotal: null,
                vlrLucro: null,
                prcLucro: null,
                dtAtual: new Date()
            }

            Acao.create(acaoCarteira, (err, data) => {
                if(err) ret = false;
            });
        }
    });
    return ret;
}

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

async function getAcao(codAcao) {
    const acao = await db.Acoes.findOne({ codAcao: codAcao });
    if (!acao) throw 'Ação não encontrada!';
    return acao;
}

async function getAll() {
    const acoes = await db.Acoes.find();
    return acoes.map(x => basicDetails(x));
}

async function create(params) {
    // validate
    if (await db.Acoes.findOne({ codAcao: params.codAcao })) {
        throw 'Ação "' + params.codAcao + '" já está registrada!';
    }

    const acoes = new db.Acoes(params);
    acoes.codAcao = params.codAcao;
    acoes.vlrAtual = params.vlrAtual;
    acoes.vlrCompra = params.vlrCompra;
    acoes.varDia = params.varDia;
    acoes.var30d = params.var30d;
    acoes.var12m = params.var12m;
    acoes.qtd = params.qtd;
    acoes.vlrInvest = params.vlrInvest;
    acoes.vlrTotal = params.vlrTotal;
    acoes.vlrLucro = params.vlrLucro;
    acoes.prcLucro = params.prcLucro;

    // save ação
    await acoes.save();

    return basicDetails(acoes);
}

async function update(codAcao, params) {
    const acao = await getAcao(codAcao);

    // validate (if email was changed)
    if (await db.Account.findOne({ codAcao: params.codAcao })) {
        throw 'Ação "' + params.email + '" já existe';
    }

    // copy params to acao and save
    Object.assign(acao, params);
    acao.updated = Date.now();
    await acao.updateOne();

    return basicDetails(acao);
}

async function _delete(codAcao) {
    const acao = await getAcao(codAcao);
    await acao.remove();
}

function basicDetails(account) {
    const { codAcao, vlrAtual, vlrCompra, varDia, var30d, var12m, qtd, vlrInvest, vlrTotal, vlrLucro, prcLucro, dtAtual} = acao;
    return { codAcao, vlrAtual, vlrCompra, varDia, var30d, var12m, qtd, vlrInvest, vlrTotal, vlrLucro, prcLucro, dtAtual};
}




