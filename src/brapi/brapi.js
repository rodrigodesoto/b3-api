const axios = require("axios");

async function getQuoteFromBrapi(ticker) {
  try {
    // 1️⃣ Tentativa direta
    const url = `https://brapi.dev/api/quote/${ticker}?range=1d&interval=1d`;
    const { data } = await axios.get(url);

    if (!data?.results?.length) throw new Error("Ticker não encontrado no endpoint direto");

    return normalizeQuote(data.results[0], "BRAPI-DIRECT");

  } catch (err) {
    console.warn(`BRAPI direto falhou para ${ticker}. Tentando fallback LIST...`);

    try {
      // 2️⃣ Fallback pesado: lista completa
      const listUrl = "https://brapi.dev/api/quote/list";
      const { data } = await axios.get(listUrl);

      if (!data?.stocks?.length) return null;

      // 3️⃣ Localiza o ativo
      const found = data.stocks.forEach(s => {

        if (s.stock === ticker) {
          console.log("ACHOU:", s);
          return s;
        }
      });

      if (!found) return null;

      // 4️⃣ Normaliza
      return {
        price: found.close,
        open: found.open,
        high: found.high,
        low: found.low,
        previousClose: found.close,
        volume: found.volume,
        shortName: found.name,
        longName: found.name,
        source: "BRAPI-LIST"
      };

    } catch (listErr) {
      console.error("Erro BRAPI LIST:", listErr.message);
      return null;
    }
  }
}

/* 🔧 Normalização do endpoint /quote/{ticker} */
function normalizeQuote(q, source) {
  return {
    price: q.regularMarketPrice,
    open: q.regularMarketOpen,
    high: q.regularMarketDayHigh,
    low: q.regularMarketDayLow,
    previousClose: q.regularMarketPreviousClose,
    volume: q.regularMarketVolume,
    shortName: q.shortName,
    longName: q.longName,
    source
  };
}

module.exports = {
  getQuoteFromBrapi
};