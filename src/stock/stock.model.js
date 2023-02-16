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
    var30d: { type: Number, required: false},
    var12m: { type: Number, required: false},
    vlYeld: { type: Number, required: false},
    prcYeld: { type: Number, required: false}
});


module.exports = mongoose.model('stocks', StockSchema);
