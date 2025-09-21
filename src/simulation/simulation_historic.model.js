const mongoose = require("mongoose");

const SimulationsHistoricSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    descricao: { type: String },
    valor_simulado: { type: Number, required: true },
    vlr_atual: { type: Number, default: 0 },
    lucro: { type: Number, default: 0 },
    percent_lucro: { type: Number, default: 0 },
    qtd_dias: { type: Number, default: 0 },
    data_simulacao: { type: Date, default: Date.now },
    data_atualizacao: { type: Date, default: Date.now },

    // mantém referência aos stocks_simulation usados
    stocks_simulation: [{ type: mongoose.Schema.Types.ObjectId, ref: "StockSimulation" }],
  },
  {
    timestamps: false, // cria createdAt e updatedAt automáticos
    collection: "simulations_historic", // garante o nome da collection
  }
);

module.exports = mongoose.model("simulations_historic", SimulationsHistoricSchema);
