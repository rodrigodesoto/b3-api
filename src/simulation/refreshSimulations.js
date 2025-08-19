const axios = require("axios");
const dayjs = require("dayjs");
const simulationModel = require("../simulation/simulation.model");
const stockSimulationModel = require('../simulation/stocks_simulation.model');


async function getStockPrice(symbol) {
  try {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}.SA&interval=5min&apikey=${API_KEY}`;
    const res = await axios.get(url);
    const series = res.data["Time Series (5min)"];
    const latest = Object.values(series)[0];
    return parseFloat(latest["4. close"]);
  } catch (err) {
    console.error(`Erro ao buscar preço de ${symbol}:`, err.message);
    return null;
  }
}

async function main() {

  try {
    const stocks = await stockSimulationModel.find({}).lean();

    for (const stock of stocks) {
      const precoAtual = await getStockPrice(stock.codigo);
      if (!precoAtual) continue;

      const valorAtual = precoAtual * stock.qtd;
      const lucro = valorAtual - stock.valor_simulado;
      const lucroPercent = (lucro * 100) / stock.valor_simulado;

      // Atualiza o stocks_simulations
      await stockSimulationModel.updateOne(
        { _id: stock._id },
        {
          $set: {
            preco_atual: precoAtual,
            valor_atual: valorAtual,
            lucro: lucro,
            lucro_percent: lucroPercent,
          },
        }
      );

      // Localiza o simulation que contém este ID
      const simulation = await simulationModel.findOne({
        stocks_simulation: stock._id,
      });

      if (simulation) {
        const dataSimulacao = dayjs(simulation.data_simulacao);
        const dias = dayjs().diff(dataSimulacao, "day");

        await stockSimulationModel.updateOne(
          { _id: stock._id },
          { $set: { qtd_dias: dias } }
        );
      }

      console.log(`Atualizado: ${stock.codigo} - Preço: ${precoAtual}`);
    }
  } catch (err) {
    console.error("Erro geral:", err);
  } 
}

main();
