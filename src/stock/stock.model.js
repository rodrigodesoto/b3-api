const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StockSchema = new Schema({
    stockCode: { type: String, required: true, unique: true, upercase: true },
    shortName: { type: String, required: true, unique: true, upercase: true },
    longName: { type: String, required: false, unique: true, upercase: true },
    currentPrice: { type: Number, required: true},
    qtd: { type: Number, required: true},
    vlBuy: { type: Number, required: true},
    vlTotal: { type: Number, required: true},
    dtBuy: { type: Date, default: Date.now, required: true},
    dtUpdate: { type: Date, default: Date.now, required: true},

    open: { type: Number, required: false},
    high: { type: Number, required: false},
    low: { type: Number, required: false},
    marketChange: { type: Number, required: false},
    revenueGrowth: { type: Number, required: false},
    operatingMargins: { type: Number, required: false},
    ebitda: { type: Number, required: false},
    targetLowPrice: { type: Number, required: false},
    recommendationKey: { type: String, required: false},
    grossProfits: { type: Number, required: false},
    freeCashflow: { type: Number, required: false},
    targetMedianPrice: { type: Number, required: false},
    earningsGrowth: { type: Number, required: false},
    currentRatio: { type: Number, required: false},
    returnOnAssets: { type: Number, required: false},
    numberOfAnalystOpinions: { type: Number, required: false},
    targetMeanPrice: { type: Number, required: false},
    debtToEquity: { type: Number, required: false},
    returnOnEquity: { type: Number, required: false},
    targetHighPrice: { type: Number, required: false},
    totalCash: { type: Number, required: false},
    totalDebt: { type: Number, required: false},
    totalRevenue: { type: Number, required: false},
    totalCashPerShare: { type: Number, required: false},
    financialCurrency: { type: String, required: false, upercase: true},
    quickRatio: { type: Number, required: false},
    recommendationMean: { type: Number, required: false},
    var30d: { type: Number, required: false},
    var12m: { type: Number, required: false},
    vlYeld: { type: Number, required: false},
    prcYeld: { type: Number, required: false}
});


module.exports = mongoose.model('stocks', StockSchema);
