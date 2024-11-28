const puppeteer = require('puppeteer');


const scraperObject = {
    async scraper() {
        // Iniciar o navegador e abrir uma nova página
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox','--disable-popup-blocking',
            '--disable-notifications',] });
        const page = await browser.newPage();

        browser.on('targetcreated', async (target) => {
            const newPage = await target.page();
            if (newPage) {
                const url = await newPage.url();
                console.log('Popup detectado:', url);
        
                // Fechar popups relacionados à publicidade
                if (url.includes('google') || url.includes('ad')) {
                    await newPage.close();
                    console.log('Popup Publicidade fechado:', url);
                }
            }
        });

        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const blockList = ['ads', 'google', 'doubleclick', 'marketing', 'adservice'];
            if (blockList.some((resource) => request.url().includes(resource))) {
                console.log('Recurso bloqueado:', request.url());
                request.abort();
            } else {
                request.continue();
            }
        });

        try {
            let arrTickets = [];

            // Navegar até a página alvo
            await page.goto('https://www.infomoney.com.br/ferramentas/altas-e-baixas/', {
                waitUntil: 'networkidle2',
            });

            // Esperar que o primeiro elemento da tabela seja carregado e que o texto não seja "Carregando..."
            await page.waitForFunction(() => {
                const firstCell = document.querySelector('tbody tr td');
                return firstCell && firstCell.innerText.trim() !== 'Carregando...';
            }, { timeout: 30000 });

            // Capturar os valores desejados
            const dataMax = await page.evaluate(() => {

                // Seleciona o primeiro <tr> dentro do <tbody>
                const rowMax = document.querySelector('tbody tr');
                
                // Verifica se encontrou a linha, se não, retorna null
                if (!rowMax) return null;
                
                // Extrai o texto de cada célula (coluna) na linha
                const cellsMax = Array.from(rowMax.querySelectorAll('td')).map(cell => cell.innerText.trim());
                
                const stockMax = {
                    stockCode: cellsMax[0] || null,
                    varDia: cellsMax[3] || null,
                    vlr: cellsMax[2] || null,
                    var12m: cellsMax[7] || null,
                    varAno: cellsMax[6] || null,
                    varSem: cellsMax[4] || null,
                    varMes: cellsMax[5] || null,
                    vlrMax: cellsMax[9] || null,
                    vlrMin: cellsMax[8] || null,
                    volume: cellsMax[10] || null,
                    data: cellsMax[1] || null,
                    state: 'MAX',
                };

                return stockMax;
            });
            arrTickets.push(dataMax);

            // Ordenar "Var Dia (%)"
            const headerSelector = '#altas_e_baixas > thead > tr > th.sorting_desc';
            await page.waitForSelector(headerSelector, { timeout: 60000 });

            // Simular interação para garantir ordenação
            await page.hover(headerSelector); // Passar o mouse sobre o cabeçalho
            await page.click(headerSelector); // Primeiro clique
            await page.waitForTimeout(2000);  // Esperar a tabela recarregar

            // Capturar os valores desejados
            const dataMin = await page.evaluate(() => {

                // const dataMin = page.evaluate(() => {
            // // Seleciona o primeiro <tr> dentro do <tbody>
            const rowMin = document.querySelector('tbody tr');
            
            // Verifica se encontrou a linha, se não, retorna null
            if (!rowMin) return null;
            
            // Extrai o texto de cada célula (coluna) na linha
            const cellsMin = Array.from(rowMin.querySelectorAll('td')).map(cell => cell.innerText.trim());
            
            const stockMin = {
                stockCode: cellsMin[0] || null,
                varDia: cellsMin[3] || null,
                vlr: cellsMin[2] || null,
                var12m: cellsMin[7] || null,
                varAno: cellsMin[6] || null,
                varSem: cellsMin[4] || null,
                varMes: cellsMin[5] || null,
                vlrMax: cellsMin[9] || null,
                vlrMin: cellsMin[8] || null,
                volume: cellsMin[10] || null,
                data: cellsMin[1] || null,
                state: 'MIN',
            };

                return stockMin;
            });
            arrTickets.push(dataMin);
            // await browser.close();
            return arrTickets;
        } catch (error) {
            console.log(error);
            return error;
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
}

module.exports = scraperObject;
