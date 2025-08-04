const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const stocksSimulationModel = require('./stocks_simulation.model');
const { ObjectID } = require('mongodb');

const SimulationSchema = new Schema({
    nome: { type: String, required: true, unique: false, upercase: true },
    data_atualizacao: { type: Date, default: Date.now, required: true},
    data_simulacao: { type: Date, default: Date.now, required: true},
    valor_simulado: { type: Number, required: true},
    vlr_atual: { type: Number, required: true},
    percent_lucro: { type: Number, required: false}, 
    lucro: { type: Number, required: false},
    stocks_simulation: [{ type: ObjectID, required: true}],
});


module.exports = mongoose.model('simulation', SimulationSchema);
