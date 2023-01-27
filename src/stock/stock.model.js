const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StockSchema = new Schema({
    stock: { type: String, required: true, unique: true, upercase: true },
    shortName: { type: String, required: true, unique: true, upercase: true },
    longName: { type: String, required: false, unique: true, upercase: true },
    ebitdaMargins: { type: Number, required: false},
    profitMargins: { type: Number, required: false},
    grossMargins: { type: Number, required: false},
    operatingCashflow: { type: Number, required: false},
    revenueGrowth: { type: Number, required: false},
    operatingMargins: { type: Number, required: false},
    ebitda: { type: Number, required: false},
    targetLowPrice: { type: Number, required: false},
    recommendationKey: { type: String, required: false},
    grossProfits: { type: Number, required: false},
    freeCashflow: { type: Number, required: false},
    targetMedianPrice: { type: Number, required: false},
    currentPrice: { type: Number, required: true},
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
    qtd: { type: Number, required: false},
    vlrInvest: { type: Number, required: false},
    vlrTotal: { type: Number, required: false},
    vlrLucro: { type: Number, required: false},
    prcLucro: { type: Number, required: false},
    dtAtual: { type: Date, default: Date.now, required: true}
});


module.exports = mongoose.model('Stock', StockSchema);
