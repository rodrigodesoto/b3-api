const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StocksVarSchema = new Schema({
    stockCode: { type: String, required: true, unique: false, upercase: true },
    varDia: { type: Number, required: true},
    vlr: { type: Number, required: true},
    var12m: { type: Number, required: true}, 
    varAno: { type: Number, required: true},
    varSem: { type: Number, required: true},
    varMes: { type: Number, required: true},
    vlrMax: { type: Number, required: true},
    vlrMin: { type: Number, required: true},
    volume: { type: String, required: false, upercase: true },
    data: { type: Date, default: Date.now, required: true},
    state: { type: String, required: true, unique: false, upercase: true}
});


module.exports = mongoose.model('stocks-var', StocksVarSchema);
