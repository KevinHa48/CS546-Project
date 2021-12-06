const express = require('express');
const router = express.Router();
const stocksData = require("../data/industries");

router.get('/:id', async (req, res) => {
    let industry = await stocksData.getIndustry(req.params.id)
    res.render('extras/stock', {
        name: industry.name,
        symbol: industry.symbol
    })
})

module.exports = router