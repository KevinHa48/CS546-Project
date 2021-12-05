const express = require("express");
const xss = require("xss")
const { users, songs } = require("../data");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const username = req.session.user;
        const userData = await users.getByUsername(username);
        
        /* For each song call get and query for it's object representation, then put
         that into an array to pass to hbs.*/ 
        let songArr = await Promise.all(userData.wallet.holdings.songs.map(async (song) => {
            return await songs.get(song.toString());
        }));

        console.log(songArr);

        res.render("extras/wallet", {
            username: userData.firstName,
            stocks: userData.wallet.holdings.stocks,
            songs: songArr,
            balance: userData.wallet.balance,
            portfolioValues: userData.wallet.portfolioValues,
            transactions: userData.wallet.transactions
        });
    }
    catch {
        // Error here.
        res.status(400).json({"error": "e"})
    }
});

router.post("/", async (req, res) => {
    res.render("extras/wallet", {});
});

router.get('/portfolio_value', async (req, res) => {
    const userId = xss(req.body.userId)
    try {
        const _userId = users.getObjectId(userId)
        const user = await users.getById(userId)
    } catch (e) {
        res.status(400).json({error: e})
        return
    }
    try {
        const portfolioValues = await users.calculatePortfolioValue(userId)
        res.json(portfolioValues)
    } catch {
        res.status(500).json({error: 'Internal Server Error'})
    }
})

module.exports = router;
