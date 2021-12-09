const express = require('express');
const router = express.Router();
const stocksData = require("../data/industries");

router.get('/:id', async (req, res) => {
    let industry = await stocksData.getIndustry(req.params.id)
    let call1 = await stocksData.financeAPI(industry.symbol)
    res.render('extras/stock', {
        name: industry.name,
        symbol: industry.symbol,
        fiftyDayAverage: call1.quoteResponse.result[0].fiftyDayAverage,
        regularMarketPrice: call1.quoteResponse.result[0].regularMarketPrice,
        regularMarketDayHigh: call1.quoteResponse.result[0].regularMarketDayHigh,
        regularMarketDayLow: call1.quoteResponse.result[0].regularMarketDayLow
    })
})

module.exports = router