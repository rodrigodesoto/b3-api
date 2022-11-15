const db = require('src/_helpers/db');

module.exports = {
    getAll,
    create,
    update,
    getAcao,
    delete: _delete
};

async function getAcao(codAcao) {
    const acao = await db.Acoes.findOne({ codAcao: codAcao });
    if (!acao) throw 'Ação não encontrada!';
    return acao;
}

async function getAll() {
    const acoes = await db.Acoes.find();
    return acoes.map(x => basicDetails(x));
}

async function create(params) {
    // validate
    if (await db.Acoes.findOne({ codAcao: params.codAcao })) {
        throw 'Ação "' + params.codAcao + '" já está registrada!';
    }

    const acoes = new db.Acoes(params);
    acoes.codAcao = params.codAcao;
    acoes.vlrAtual = params.vlrAtual;
    acoes.vlrCompra = params.vlrCompra;
    acoes.varDia = params.varDia;
    acoes.var30d = params.var30d;
    acoes.var12m = params.var12m;
    acoes.qtd = params.qtd;
    acoes.vlrInvest = params.vlrInvest;
    acoes.vlrTotal = params.vlrTotal;
    acoes.vlrLucro = params.vlrLucro;
    acoes.prcLucro = params.prcLucro;

    // save ação
    await acoes.save();

    return basicDetails(acoes);
}

async function update(codAcao, params) {
    const acao = await getAcao(codAcao);

    // validate (if email was changed)
    if (await db.Account.findOne({ codAcao: params.codAcao })) {
        throw 'Ação "' + params.email + '" já existe';
    }

    // copy params to acao and save
    Object.assign(acao, params);
    acao.updated = Date.now();
    await acao.updateOne();

    return basicDetails(acao);
}

async function _delete(codAcao) {
    const acao = await getAcao(codAcao);
    await acao.remove();
}

function basicDetails(account) {
    const { codAcao, vlrAtual, vlrCompra, varDia, var30d, var12m, qtd, vlrInvest, vlrTotal, vlrLucro, prcLucro, dtAtual} = acao;
    return { codAcao, vlrAtual, vlrCompra, varDia, var30d, var12m, qtd, vlrInvest, vlrTotal, vlrLucro, prcLucro, dtAtual};
}




