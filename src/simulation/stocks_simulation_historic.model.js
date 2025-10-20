const mongoose = require('mongoose');

const StocksSimulationHistoricSchema = new mongoose.Schema(
  {
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
    simulation_name: {type: String, required: false},
  },
    {
    timestamps: false, // cria createdAt e updatedAt automáticos
    collection: "stocks_simulations_historic", // garante o nome da collection
  }
);


module.exports = mongoose.model('stocks_simulations_historic', StocksSimulationHistoricSchema);
