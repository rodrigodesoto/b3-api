const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StocksSimulationSchema = new Schema({
    qtd_dias: { type: Number, default: 0, required: false}, 
    codigo: { type: String, required: true, upercase: true },
    kelly_continuo: { type: Number, required: false},
    lucro: { type: Number, required: false},
    preco_atual: { type: Number, required: true},
    preco_compra: { type: Number, required: true},
    qtd: { type: Number, required: true},
    valor_atual: { type: Number, required: true},
    valor_simulado: { type: Number, required: true},
    montante_percent: { type: Number, required: true},
    lucro_percent: { type: Number, required: true}, 
    data_compra: { type: Date, default: Date.now, required: true},
    data_atualizacao: { type: Date, default: Date.now, required: true},
});


module.exports = mongoose.model('stocks_simulation', StocksSimulationSchema);
