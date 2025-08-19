const db = require('src/_helpers/db');
const {DateUtils} = require("../util/date-utils");
const StockSimulationModel = require('./stocks_simulation.model');
const SimulationModel = require("../simulation/simulation.model");

module.exports = {
    getAll,
    getById,
    insertSimulation,
    delete: _delete
};

async function getById(id) {
    const simulacao = await SimulationModel.findById(id);
    return simulacao;
}

async function _delete(id) {
    const simulacao = await getById(id);

    for (const idSimulation of simulacao.stocks_simulation) {
        await StockSimulationModel.deleteMany(StockSimulationModel.findById(idSimulation))
    }
    await simulacao.remove();
}

async function getAll() {
    const simulations = await db.Simulations.find();
    const simulationsModel = simulations.map(x => basicDetails(x));
    const simulationsOrder = simulationsModel.sort((a, b) => a.data_simulacao - b.data_simulacao);
    return simulationsOrder;
}

async function insertSimulation(simulationBody){

    // 1. Inserir os objetos de stocks_simulation um por um e coletar os _id
    const stocksSimulationIds = [];
    var simulation = Object;

    try{

        for (const stock of simulationBody.stocks_simulation) {
            const result = await StockSimulationModel.create(stock);
            stocksSimulationIds.push(result._id);
        }

        simulation = {
            nome: simulationBody.nome.toUpperCase(),
            data_atualizacao: new Date(),
            data_simulacao: new Date(),
            valor_simulado: Number(simulationBody.valor_simulado),
            vlr_atual: simulationBody.vlr_atual == null ? valor_simulado : Number(simulationBody.vlr_atual),
            percent_lucro: simulationBody.percent_lucro == null ? Number(0) : Number(simulationBody.percent_lucro),
            lucro: simulationBody.lucro == null ? Number(0) : Number(simulationBody.lucro),
            stocks_simulation: stocksSimulationIds
        };
        await SimulationModel.create(simulation);
        return simulation;
    } catch(err){
        for (const idSimulation of stocksSimulationIds) {
            await StockSimulationModel.deleteMany(StockSimulationModel.findById(idSimulation))
        }
        
        await SimulationModel.delete(simulation)
        return err
    }
    
}

function basicDetails(simulation) {
    const { id, lucro, percent_lucro, vlr_atual, data_simulacao, data_atualizacao, nome, valor_simulado, stocks_simulation} = simulation;
    return { id, lucro, percent_lucro, vlr_atual, data_simulacao, data_atualizacao, nome, valor_simulado, stocks_simulation};
}




