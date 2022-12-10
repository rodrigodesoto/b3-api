const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StockSchema = new Schema({
    stock: { type: String, required: true, unique: true, upercase: true },
    shortName: { type: String, required: true, unique: true, upercase: true },
    longName: { type: String, required: true, unique: true, upercase: true },
    ebitdaMargins: { type: Number, required: true},
    profitMargins: { type: Number, required: true},
    grossMargins: { type: Number, required: true},
    operatingCashflow: { type: Number, required: true},
    revenueGrowth: { type: Number, required: true},
    operatingMargins: { type: Number, required: true},
    ebitda: { type: Number, required: true},
    targetLowPrice: { type: Number, required: true},
    recommendationKey: { type: String, required: true},
    grossProfits: { type: Number, required: true},
    freeCashflow: { type: Number, required: true},
    targetMedianPrice: { type: Number, required: true},
    currentPrice: { type: Number, required: true},
    earningsGrowth: { type: Number, required: true},
    currentRatio: { type: Number, required: true},
    returnOnAssets: { type: Number, required: true},
    numberOfAnalystOpinions: { type: Number, required: true},
    targetMeanPrice: { type: Number, required: true},
    debtToEquity: { type: Number, required: true},
    returnOnEquity: { type: Number, required: true},
    targetHighPrice: { type: Number, required: true},
    totalCash: { type: Number, required: true},
    totalDebt: { type: Number, required: true},
    totalRevenue: { type: Number, required: true},
    totalCashPerShare: { type: Number, required: true},
    financialCurrency: { type: String, required: true, upercase: true},
    quickRatio: { type: Number, required: true},
    recommendationMean: { type: Number, required: true},
    var30d: { type: Number, required: false},
    var12m: { type: Number, required: false},
    qtd: { type: Number, required: false},
    vlrInvest: { type: Number, required: false},
    vlrTotal: { type: Number, required: false},
    vlrLucro: { type: Number, required: false},
    prcLucro: { type: Number, required: false},
    dtAtual: { type: Date, default: Date.now}
});


module.exports = mongoose.model('Stocks', StockSchema);
