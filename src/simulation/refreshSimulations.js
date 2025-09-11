const dayjs = require("dayjs");
const {default: yahooFinance} = require("yahoo-finance2");
const simulationModel = require("../simulation/simulation.model");
const stockSimulationModel = require('../simulation/stocks_simulation.model');

module.exports = {
    refreshSimulations
};

async function refreshSimulations(req, res) {

  var simulations 

  try {

    if (req.params.nome == 'all') {
      simulations = await simulationModel.find({}).lean();
    } else {
      simulations = await simulationModel.find({nome: req.params.nome});
    }

    if (simulations.length == 0) {
      return res.status(204).json({ message: 'Simulação não localizada!' });
    }
    for (const simulation of simulations) {

          let valorAtualSimulation = 0;
          let lucroSimulation = 0;
          let lucroPercentSimulation = 0;

        for (const stockID of simulation.stocks_simulation) {

          // Localiza o stockSimulation que contém este ID
          const stock = await stockSimulationModel.findById(stockID);

          if (!stock) continue;
            
          let quote = {}
          const queryOptions = { modules: ['price', 'summaryDetail'] }; // defaults
          const quoteTicker = await yahooFinance.quoteSummary(stock.codigo+'.SA', queryOptions);
          console.log(quoteTicker);
          if (quoteTicker !== undefined) {
              quote.price = quoteTicker.price.regularMarketPrice;
              // quote.price = quote.price + Math.random()
              quote.open = quoteTicker.price.regularMarketOpen;
              quote.high = quoteTicker.price.regularMarketDayHigh;
              quote.low = quoteTicker.price.regularMarketDayLow;
              quote.previousClose = quoteTicker.price.regularMarketPreviousClose;
              quote.volume = quoteTicker.summaryDetail.averageVolume;
              quote.marketChange = parseFloat(quoteTicker.price.regularMarketChangePercent*100).toPrecision(2);
              quote.shortName = quoteTicker.price.shortName;
              quote.longName = quoteTicker.price.longName;
          }

          if (!quote) continue;

          const dataCompra = dayjs(stock.data_compra);
          const diasCompra = dayjs().diff(dataCompra, "day");
          const valorAtualStock = quote.price * stock.qtd;
          valorAtualSimulation = valorAtualSimulation + valorAtualStock;
          const lucroStock = valorAtualStock - stock.valor_simulado;
          const lucroPercentStock = (lucroStock * 100) / stock.valor_simulado;
          const montantePercent = (valorAtualStock * 100) / simulation.vlr_atual;

          // Atualiza o stocks_simulations
          await stockSimulationModel.updateOne(
            { _id: stock._id },
            {
              $set: {
                qtd_dias: diasCompra,
                preco_atual: quote.price,
                valor_atual: valorAtualStock.toFixed(2),
                lucro: lucroStock.toFixed(2),
                lucro_percent: lucroPercentStock.toFixed(2),
                montante_percent: montantePercent.toFixed(2),
                data_atualizacao: new Date(),
              },
            }
          );

          console.log(`Atualizado: ${stock.codigo} - Preço: ${quote.price}`);
        }

        lucroSimulation = valorAtualSimulation - simulation.valor_simulado
        lucroPercentSimulation = (lucroSimulation * 100) / simulation.valor_simulado;

        if (simulation) {
          const dataSimulacao = dayjs(simulation.data_simulacao);
          const dias = dayjs().diff(dataSimulacao, "day");

          await simulationModel.updateOne(
            { _id: simulation._id },
            { $set: { qtd_dias: dias,
              data_atualizacao: new Date(),
              vlr_atual: valorAtualSimulation.toFixed(2),
              lucro: lucroSimulation.toFixed(2),
              percent_lucro: lucroPercentSimulation.toFixed(2),
              } },

          );
        }

    }

  } catch (err) {
    console.error("Erro geral:", err);
    throw new Error(err.message);
  } 
}

// refreshSimulations();
