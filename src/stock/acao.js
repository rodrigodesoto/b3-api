const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const AcaoSchema = new Schema({
    codAcao: { type: String, required: true, unique: true, upercase: true },
    vlrAtual: { type: Number, required: false},
    vlrCompra: { type: Number, required: false},
    varDia:{ type: Number, required: false},
    var30d: { type: Number, required: false},
    var12m: { type: Number, required: false},
    qtd: { type: Number, required: false},
    vlrInvest: { type: Number, required: false},
    vlrTotal: { type: Number, required: false},
    vlrLucro: { type: Number, required: false},
    prcLucro: { type: Number, required: false},
    dtAtual: { type: Date, default: Date.now}
});


module.exports = mongoose.model('Acoes', AcaoSchema);
