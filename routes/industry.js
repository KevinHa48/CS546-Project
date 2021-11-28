const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.render('extras/industry', {

    })
})

module.exports = router
