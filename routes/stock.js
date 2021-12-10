const express = require('express');
const router = express.Router();
const {users, songs, industries} = require('../data');

router.get('/:id', async (req, res) => {
    const stockId = await users.getObjectId(req.params.id).toString();
    let ind = await industries.getIndustry(stockId);
    res.render('extras/stock', {
        name: ind.name,
        id: req.params.id,
        symbol: ind.symbol,
        fiftyDayAverage: ind.fiftyDayAverage,
        regularMarketPrice: ind.lastPrice,
        regularMarketDayHigh: ind.regularMarketDayHigh,
        regularMarketDayLow: ind.regularMarketDayLow,
    })
})

module.exports = router