const express = require('express');
const router = express.Router();
const stocksData = require("../data/industries");

router.get('/', async (req, res) => {
    let stockList = await stocksData.getAllIndustries();
    res.render('extras/industry', {
        industries: stockList
    })
})

module.exports = router
