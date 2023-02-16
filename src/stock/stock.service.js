const db = require('src/_helpers/db');
const stockModel = require("./stock.model");
const {DateUtils} = require("../util/date-utils");

module.exports = {
    getAll,
    create,
    updateStock,
    getById,
    insertStock,
    delete: _delete
};

async function insertStock(stockBody){
    const stock = {
        stockCode: stockBody.stockCode,
        shortName: stockBody.shortName,
        longName: stockBody.longName,
        currentPrice: stockBody.currentPrice,
        qtd: stockBody.qtd,
        vlBuy: stockBody.vlBuy,
        vlTotal: stockBody.qtd* stockBody.vlBuy,
        open: stockBody.open,
        high: stockBody.high,
        low: stockBody.low,
        marketChange: stockBody.marketChange,
        dtBuy: DateUtils.convertAnyToDate(stockBody.dtBuy),
        dtUpdate: new Date()
    };
    try{
        await stockModel.create(stock);
        return stock;
    } catch(err){
        return err
    }
}

async function updateStock(stockBody) {
    const stock = {
        stockCode: stockBody.stockCode,
        shortName: stockBody.shortName,
        longName: stockBody.longName,
        currentPrice: stockBody.currentPrice,
        qtd: stockBody.qtd,
        vlBuy: stockBody.vlBuy,
        vlTotal: stockBody.qtd* stockBody.currentPrice,
        open: stockBody.open,
        high: stockBody.high,
        low: stockBody.low,
        marketChange: stockBody.marketChange,
        dtBuy: DateUtils.convertAnyToDate(stockBody.dtBuy),
        dtUpdate: new Date()
    };
    try{
        await stockModel.updateOne(stock);
        return stock;
    } catch(err){
        return err
    }
}

async function getAcao(codAcao) {
    const acao = await db.Stock.findOne({ stock: codAcao });
    if (!acao) throw 'Ação não encontrada!';
    return acao;
}

async function getAll() {
    const stocks = await db.Stock.find();
    return stocks.map(x => basicDetails(x));
}

async function getById(id) {
    const stock = await getStock(id);
    return basicDetails(stock);
}

async function getStock(id) {
    if (!db.isValidId(id)) throw 'Id da ação não encontrado!';
    const stock = await db.Stock.findById(id);
    if (!stock) throw 'Ação não encontrada!';
    return stock;
}

async function create(params) {
    // validate
    if (await db.Stock.findOne({ codAcao: params.codAcao })) {
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

async function _delete(codAcao) {
    const acao = await getAcao(codAcao);
    await acao.remove();
}

function basicDetails(stock) {
    const { stockCode, shortName, currentPrice, qtd, vlBuy, vlTotal, open, high, low, marketChange, dtBuy, dtUpdate} = stock;
    return { stockCode, shortName, currentPrice, qtd, vlBuy, vlTotal, open, high, low, marketChange, dtBuy, dtUpdate};
}




