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
        stockCode: stockBody.stockCode.toUpperCase(),
        shortName: stockBody.shortName,
        longName: stockBody.longName == undefined?stockBody.shortName:stockBody.longName,
        currentPrice: stockBody.currentPrice,
        qtd: stockBody.qtd,
        vlBuy: stockBody.vlBuy,
        vlTotal: stockBody.qtd* stockBody.vlBuy,
        open: stockBody.open,
        high: stockBody.high,
        low: stockBody.low,
        marketChange: stockBody?.marketChange == undefined ? 0:stockBody?.marketChange,
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

async function updateStock(stockBody, stockMongo) {
        stockMongo.id = stockBody.id,
        stockMongo.shortName = stockBody.shortName,
        stockMongo.currentPrice = stockBody.currentPrice,
        stockMongo.qtd = stockBody.qtd,
        stockMongo.vlBuy = stockBody.vlBuy,
        stockMongo.vlTotal = stockBody.qtd* stockBody.currentPrice,
        stockMongo.open = stockBody.open,
        stockMongo.high = stockBody.high,
        stockMongo.low = stockBody.low,
        stockMongo.marketChange = stockBody?.marketChange,
        stockMongo.dtUpdate = new Date()

    try{
        Object.assign(stockMongo, stockBody);
        await stockMongo.save();
        return basicDetails(stockMongo);
    } catch(err){
        return err
    }
}

async function getById(id) {
    const stock = await getStock(id);
    const stockReturn = {
        id: stock.id,
        stockCode: stock.stockCode,
        shortName: stock.shortName,
        currentPrice: stock.currentPrice,
        qtd: stock.qtd,
        vlBuy: stock.vlBuy,
        vlTotal: stock.vlTotal,
        open: stock.open,
        high: stock.high,
        low: stock.low,
        marketChange: stock.marketChange,
        dtBuy: DateUtils.dateToStringYear(stock.dtBuy),
        dtUpdate: stock.dtUpdate
    }
    return stockReturn;
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

async function _delete(id) {
    const acao = await getAcao(id);
    await acao.remove();
}
async function getAcao(id) {
    const acao = await db.Stock.findById(id );
    if (!acao) throw 'Ação não encontrada!';
    return acao;
}

async function getAll() {
    const stocks = await db.Stock.find();
    return stocks.map(x => basicDetails(x));
}

function basicDetails(stock) {
    const { id, stockCode, shortName, currentPrice, qtd, vlBuy, vlTotal, open, high, low, marketChange, dtBuy, dtUpdate} = stock;
    return { id, stockCode, shortName, currentPrice, qtd, vlBuy, vlTotal, open, high, low, marketChange, dtBuy, dtUpdate};
}




