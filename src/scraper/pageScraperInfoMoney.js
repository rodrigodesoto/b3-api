const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const scraperObject = {
  async scraper() {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-notifications',
      ],
    });

    const page = await browser.newPage();

    // Definir user-agent falso para evitar bloqueio
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    try {
      await page.goto('https://www.infomoney.com.br/ferramentas/altas-e-baixas/', {
        waitUntil: 'domcontentloaded',
        timeout: 120000,
      });

      // ===== PRIMEIRA TENTATIVA: Scraping direto do DOM =====
      try {
        await page.waitForSelector('#altas_e_baixas tbody tr', { timeout: 15000 });
        await page.waitForTimeout(3000);

        const result = await page.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('#altas_e_baixas tbody tr'));
          if (!rows.length) return null;

          function parsePercent(str) {
            if (!str) return NaN;
            const cleaned = String(str).replace('%', '').replace(/\s/g, '').replace(',', '.');
            return parseFloat(cleaned.replace(/[^\d\.\-+]/g, ''));
          }

          const objects = rows.map((r) => {
            const cells = Array.from(r.querySelectorAll('td')).map(c => c.innerText.trim());
            return {
              stockCode: cells[0] || '',
              data: cells[1] || '',
              vlr: cells[2] || '',
              varDia: cells[3] || '',
              varDiaNum: parsePercent(cells[3]),
              varMes: cells[4] || '',
              varAno: cells[5] || '',
              var12m: cells[6] || '',
              vlrMin: cells[7] || '',
              vlrMax: cells[8] || '',
              volume: cells[9] || '',
            };
          }).filter(o => !Number.isNaN(o.varDiaNum));

          if (!objects.length) return null;

          let max = objects[0], min = objects[0];
          objects.forEach((o) => {
            if (o.varDiaNum > max.varDiaNum) max = o;
            if (o.varDiaNum < min.varDiaNum) min = o;
          });

          const format = (o, state) => ({
            stockCode: o.stockCode,
            varDia: o.varDia,
            vlr: o.vlr,
            var12m: o.var12m,
            varAno: o.varAno,
            varMes: o.varMes,
            vlrMax: o.vlrMax,
            vlrMin: o.vlrMin,
            volume: o.volume,
            data: o.data,
            state,
          });

          return [format(max, 'MAX'), format(min, 'MIN')];
        });

        if (result) {
          await browser.close();
          return result;
        }
      } catch (domError) {
        console.warn('⚠️ Falha no DOM scraping, tentando XHR fallback...');
      }

      // ===== SEGUNDA TENTATIVA: Buscar via XHR (API JSON do DataTables) =====
      const client = await page.target().createCDPSession();
      await client.send('Network.enable');

      let apiData = null;
      client.on('Network.responseReceived', async (params) => {
        const { response } = params;
        if (response.url.includes('/altas-e-baixas/')) {
          try {
            const body = await client.send('Network.getResponseBody', { requestId: params.requestId });
            if (body && body.body) {
              apiData = JSON.parse(body.body);
            }
          } catch (_) {}
        }
      });

      // Recarregar para capturar XHR
      await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });
      await page.waitForTimeout(5000);

      if (apiData && apiData.data && apiData.data.length) {
        const rows = apiData.data.map((cells) => ({
          stockCode: cells[0] || '',
          data: cells[1] || '',
          vlr: cells[2] || '',
          varDia: cells[3] || '',
          varDiaNum: parseFloat(String(cells[3]).replace('%', '').replace(',', '.')),
          varMes: cells[4] || '',
          varAno: cells[5] || '',
          var12m: cells[6] || '',
          vlrMin: cells[7] || '',
          vlrMax: cells[8] || '',
          volume: cells[9] || '',
        }));

        let max = rows[0], min = rows[0];
        rows.forEach((o) => {
          if (o.varDiaNum > max.varDiaNum) max = o;
          if (o.varDiaNum < min.varDiaNum) min = o;
        });

        const format = (o, state) => ({
          stockCode: o.stockCode,
          varDia: o.varDia,
          vlr: o.vlr,
          var12m: o.var12m,
          varAno: o.varAno,
          varMes: o.varMes,
          vlrMax: o.vlrMax,
          vlrMin: o.vlrMin,
          volume: o.volume,
          data: o.data,
          state,
        });

        await browser.close();
        return [format(max, 'MAX'), format(min, 'MIN')];
      }

      // Se falhar tudo:
      await browser.close();
      return [
        { stockCode: 'Falha scraping', state: 'MAX' },
        { stockCode: 'Falha scraping', state: 'MIN' },
      ];
    } catch (err) {
      console.error('Erro no scraper:', err);
      await browser.close();
      return [
        { stockCode: 'Erro', state: 'MAX' },
        { stockCode: 'Erro', state: 'MIN' },
      ];
    }
  },
};

module.exports = scraperObject;
