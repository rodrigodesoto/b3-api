const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const sendEmail = require('src/_helpers/send-email');
const db = require('src/_helpers/db');
const Role = require('src/_helpers/role');

module.exports = {
    authenticate,
    refreshToken,
    revokeToken,
    register,
    verifyEmail,
    forgotPassword,
    validateResetToken,
    resetPassword,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function authenticate({ email, password, ipAddress }) {
    const account = await db.Account.findOne({ email });

    if (!account || !account.isVerified || !bcrypt.compareSync(password, account.passwordHash)) {
        throw 'Email ou senha está incorreto';
    }

    // authentication successful so generate jwt and refresh tokens
    const jwtToken = generateJwtToken(account);
    const refreshToken = generateRefreshToken(account, ipAddress);

    // save refresh token
    await refreshToken.save();

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

async function refreshToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);
    const { account } = refreshToken;

    // replace old refresh token with a new one and save
    const newRefreshToken = generateRefreshToken(account, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    // generate new jwt
    const jwtToken = generateJwtToken(account);

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: newRefreshToken.token
    };
}

async function revokeToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);

    // revoke token and save
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}

async function register(params, origin) {
    // validate
    if (await db.Account.findOne({ email: params.email })) {
        // send already registered error in email to prevent account enumeration
        return await sendAlreadyRegisteredEmail(params.email, origin);
    }

    // create account object
    const account = new db.Account(params);

    // first registered account is an admin
    const isFirstAccount = (await db.Account.countDocuments({})) === 0;
    account.role = isFirstAccount ? Role.Admin : Role.User;
    account.verificationToken = randomTokenString();

    // hash password
    account.passwordHash = hash(params.password);

    // save account
    await account.save();

    // send email
    await sendVerificationEmail(account, origin);
}

async function verifyEmail({ token }) {
    const account = await db.Account.findOne({ verificationToken: token });

    if (!account) throw 'Falha na verificação';

    account.verified = Date.now();
    account.verificationToken = undefined;
    await account.save();
}

async function forgotPassword({ email }, origin) {
    const account = await db.Account.findOne({ email });

    // always return ok response to prevent email enumeration
    if (!account) return;

    // create reset token that expires after 24 hours
    account.resetToken = {
        token: randomTokenString(),
        expires: new Date(Date.now() + 24*60*60*1000)
    };
    await account.save();

    // send email
    await sendPasswordResetEmail(account, origin);
}

async function validateResetToken({ token }) {
    const account = await db.Account.findOne({
        'resetToken.token': token,
        'resetToken.expires': { $gt: Date.now() }
    });

    if (!account) throw 'Invalid token';
}

async function resetPassword({ token, password }) {
    const account = await db.Account.findOne({
        'resetToken.token': token,
        'resetToken.expires': { $gt: Date.now() }
    });

    if (!account) throw 'Token inválido';

    // update password and remove reset token
    account.passwordHash = hash(password);
    account.passwordReset = Date.now();
    account.resetToken = undefined;
    await account.save();
}

async function getAll() {
    const accounts = await db.Account.find();
    return accounts.map(x => basicDetails(x));
}

async function getById(id) {
    const account = await getAccount(id);
    return basicDetails(account);
}

async function create(params) {
    // validate
    if (await db.Account.findOne({ email: params.email })) {
        throw 'Email "' + params.email + '" já está registrado';
    }

    const account = new db.Account(params);
    account.verified = Date.now();

    // hash password
    account.passwordHash = hash(params.password);

    // save account
    await account.save();

    return basicDetails(account);
}

async function update(id, params) {
    const account = await getAccount(id);

    // validate (if email was changed)
    if (params.email && account.email !== params.email && await db.Account.findOne({ email: params.email })) {
        throw 'Email "' + params.email + '" já existe';
    }

    // hash password if it was entered
    if (params.password) {
        params.passwordHash = hash(params.password);
    }

    // copy params to account and save
    Object.assign(account, params);
    account.updated = Date.now();
    await account.save();

    return basicDetails(account);
}

async function _delete(id) {
    const account = await getAccount(id);
    await account.remove();
}

// helper functions

async function getAccount(id) {
    if (!db.isValidId(id)) throw 'Usuário não encontrado!';
    const account = await db.Account.findById(id);
    if (!account) throw 'Usuário não encontrado!';
    return account;
}

async function getRefreshToken(token) {
    const refreshToken = await db.RefreshToken.findOne({ token }).populate('account');
    if (!refreshToken || !refreshToken.isActive) throw 'Token inválido';
    return refreshToken;
}

function hash(password) {
    return bcrypt.hashSync(password, 10);
}

function generateJwtToken(account) {
    // create a jwt token containing the account id that expires in 15 minutes
    return jwt.sign({ sub: account.id, id: account.id }, process.env.JWTSECRET, { expiresIn: '15m' });
}

function generateRefreshToken(account, ipAddress) {
    // create a refresh token that expires in 7 days
    return new db.RefreshToken({
        account: account.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7*24*60*60*1000),
        createdByIp: ipAddress
    });
}

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

function basicDetails(account) {
    const { id, firstName, lastName, email, role, created, updated, isVerified } = account;
    return { id, firstName, lastName, email, role, created, updated, isVerified };
}

async function sendVerificationEmail(account, origin) {
    let message;
    if (origin) {
        const verifyUrl = `${origin}/account/verify-email?token=${account.verificationToken}`;
        message = `<p>Por favor, clique no link abaixo para verificar seu endereço de e-mail:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
    } else {
        message = `<p>Use o token abaixo para verificar seu endereço de e-mail com o <code>/account/verify-email</code> api rota:</p>
                   <p><code>${account.verificationToken}</code></p>`;
    }

    await sendEmail({
        to: account.email,
        subject: 'Sign-up Verification API - Verificar Email',
        html: `<h4>Email verificado!</h4>
               <p>Obrigado por se registrar!</p>
               ${message}`
    });
}

async function sendAlreadyRegisteredEmail(email, origin) {
    let message;
    if (origin) {
        message = `<p>Se você não sabe sua senha, visite o <a href="${origin}/account/forgot-password">Esqueceu a senha</a> página.</p>`;
    } else {
        message = `<p>Se você não sabe sua senha, você pode redefini-la através do<code>/account/forgot-password</code> api rota.</p>`;
    }

    await sendEmail({
        to: email,
        subject: 'Sign-up Verificação API - Email já registrado',
        html: `<h4>E-mail já registrado</h4>
               <p>Seu email <strong>${email}</strong> já foi registrado.</p>
               ${message}`
    });
}

async function sendPasswordResetEmail(account, origin) {
    let message;
    if (origin) {
        const resetUrl = `${origin}/account/reset-password?token=${account.resetToken.token}`;
        message = `<p>Por favor, clique no link abaixo para redefinir sua senha, o link será válido por 1 dia:</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>`;
    } else {
        message = `<p>Por favor, use o token abaixo para redefinir sua senha com o<code>/account/reset-password</code> api rota:</p>
                   <p><code>${account.resetToken.token}</code></p>`;
    }

    await sendEmail({
        to: account.email,
        subject: 'Sign-up Verificação API - Reset Senha',
        html: `<h4>Reset Senha Email</h4>
               ${message}`
    });
}
