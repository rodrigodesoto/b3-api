const acaoService = require("../stock/acao.service");
const express = require("express");
const authorize = require("../_middleware/authorize");
const accountService = require("../accounts/account.service");
const Role = require("../_helpers/role");
const Joi = require("joi");
const validateRequest = require("../_middleware/validate-request");
const router = express.Router();

router.get('/', authorize(), getAll);
router.post('/', authorize(), createSchema, create);

function getAll(req, res, next) {
    acaoService.getAll()
        .then(acoes => res.json(acoes))
        .catch(next);
}

function create(req, res, next) {
    acaoService.create(req.body)
        .then(acoes => res.json(acoes))
        .catch(next);
}

function createSchema(req, res, next) {
    const schema = Joi.object({
        codAcao: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}
