const mongoose = require('mongoose');
const connectionOptions = { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URL, connectionOptions);
mongoose.Promise = global.Promise;

module.exports = {
    Account: require('src/accounts/account.model'),
    RefreshToken: require('src/accounts/refresh-token.model'),
    Stock: require('src/stock/stock.model'),
    StocksVar: require('src/stock/stocks-var.model'),
    isValidId
};

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}
