const dayjs = require("dayjs");
const YahooFinance = require("yahoo-finance2").default;
const simulationModel = require("../simulation/simulation.model");
const stockSimulationModel = require('../simulation/stocks_simulation.model');
const simulationHistoric = require("../simulation/simulation_historic.model");
const stockSimulationHistoricModel = require('../simulation/stocks_simulation_historic.model');


module.exports = {
    refreshSimulations
};

async function refreshSimulations(req, res) {

  let simulations 

  try {

    if (req == null || req.params.nome == 'all') {
      simulations = await simulationModel.find({}).lean();
    } else {
      simulations = await simulationModel.find({nome: req.params.nome});
    }

    if (simulations.length == 0) {
      return res.status(204).json({ message: 'Simulação não localizada!' });
    }

    for (const simulation of simulations) {

          const yahooFinance = new YahooFinance();    

          let valorAtualSimulation = 0;
          let lucroSimulation = 0;
          let lucroPercentSimulation = 0;

        for (const stockID of simulation.stocks_simulation) {

          // Localiza o stockSimulation que contém este ID
          const stock = await stockSimulationModel.findById(stockID);

          if (!stock) continue;
            
          let quote = {}
          let quoteTicker = null;

          try {
            quoteTicker = await yahooFinance.quote(stock.codigo+'.SA');
          } catch (err) {
            console.error("Erro na API yahooFinance para a ação "+stock.codigo, err);
            continue;
          }

          if (quoteTicker !== null && quoteTicker !== undefined) {
              quote.price = quoteTicker.regularMarketPrice;
              // quote.price = quote.price + Math.random()
              quote.open = quoteTicker.regularMarketOpen;
              quote.high = quoteTicker.regularMarketDayHigh;
              quote.low = quoteTicker.regularMarketDayLow;
              quote.previousClose = quoteTicker.regularMarketPreviousClose;
              quote.volume = quoteTicker.summaryDetail == undefined?0:quoteTicker.summaryDetail.averageVolume;
              quote.marketChange = parseFloat(quoteTicker.regularMarketChangePercent).toPrecision(2);
              quote.shortName = quoteTicker.shortName;
              quote.longName = quoteTicker.longName;
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
                simulation_name: simulation.nome,
              },
            }
          );

           // Salva snapshot no histórico (nova collection)
           await stockSimulationHistoricModel.create({
                qtd_dias: diasCompra, 
                codigo: stock.codigo,
                kelly_continuo: stock.kelly_continuo,
                lucro: lucroStock.toFixed(2),
                preco_atual: quote.price,
                preco_compra: stock.preco_compra,
                qtd: stock.qtd,
                valor_atual: valorAtualStock.toFixed(2),
                valor_simulado: stock.valor_simulado,
                montante_percent: montantePercent.toFixed(2),
                lucro_percent: lucroPercentStock.toFixed(2),
                data_compra: stock.data_compra,
                data_atualizacao: new Date(),
                simulation_name: simulation.nome,
           });

          console.log(`Atualizado: ${stock.codigo} - Preço: ${quote.price}`);
        }

        lucroSimulation = valorAtualSimulation - simulation.valor_simulado
        lucroPercentSimulation = (lucroSimulation * 100) / simulation.valor_simulado;

        if (simulation) {
          const dataSimulacao = dayjs(simulation.data_simulacao);
          const dias = dayjs().diff(dataSimulacao, "day");

        await simulationModel.updateOne(
          { _id: simulation._id },
          {
            $set: {
              qtd_dias: dias,
              data_atualizacao: new Date(),
              vlr_atual: valorAtualSimulation.toFixed(2),
              lucro: lucroSimulation.toFixed(2),
              percent_lucro: lucroPercentSimulation.toFixed(2),
            },
          }
        );

        // Salva snapshot no histórico (nova collection)
        await simulationHistoric.create({
          nome: simulation.nome,
          descricao: simulation.descricao,
          valor_simulado: simulation.valor_simulado,
          vlr_atual: valorAtualSimulation.toFixed(2),
          lucro: lucroSimulation.toFixed(2),
          percent_lucro: lucroPercentSimulation.toFixed(2),
          qtd_dias: dias,
          data_simulacao: simulation.data_simulacao,
          data_atualizacao: new Date(),
          stocks_simulation: simulation.stocks_simulation,
        });

        console.log(
          `Snapshot salvo em simulations_historic para: ${simulation.nome}`
        );
        }
    }

  } catch (err) {
    console.error("Erro geral:", err);
    throw new Error(err.message);
  } 
}

// refreshSimulations();
