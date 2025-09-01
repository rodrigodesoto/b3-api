const express = require('express');
const router = express.Router();
const authorize = require('src/_middleware/authorize')
const simulationService = require('./simulation.service');
const refreshSimulation = require('./refreshSimulations');


router.post('/insertSimulatiom', authorize(), insertSimulation);
router.get('/refreshSimulations', authorize(), refreshSimulations);
router.get('/getAllSimulations', authorize(), getAllSimulations);
router.get('/:id', authorize(), getById);
router.delete('/:id', authorize(), _delete);

async function getAllSimulations(req, res, next) {
    simulationService.getAll()
        .then(stocks => res.json(stocks))
        .catch(next);
}

function getById(req, res, next) {
    simulationService.getById(req.params.id)
        .then(stock => stock ? res.json(stock) : res.sendStatus(404))
        .catch(next);
}

function _delete(req, res, next) {
    simulationService.delete(req, res, next)
        .then(() => res.json({ message: 'Simulação excluída com sucesso!' }))
        .catch(next);
}

async function insertSimulation(req, res, next) {
    try{
        const simulationBody = req.body
            const pass_ok = await simulationService.insertSimulation(simulationBody);

            if(pass_ok.errors || pass_ok.name == 'MongoError' || pass_ok.name == 'TypeError') {
                const erro = { error: pass_ok.errors==undefined?pass_ok.stack:pass_ok.errors}
                const retorno = res.status(400).send(erro);
                return erro
            }
            return res.status(201).
            send({message: simulationBody.nome.toString() + ' salvo com sucesso!'});

    }catch(err){
        return res.status(500).send({ error: err.message});
    }
};

async function refreshSimulations(req, res, next) {
    try{
        await refreshSimulation.refreshSimulations();
        return res.status(201).
        send({message: 'Refresh das Simulações executado com sucesso!'});

    }catch(err){
        return res.status(500).send({ error: err.message});
    }
};

module.exports = router;
