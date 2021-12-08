const express = require("express");
const { getSpotifyData } = require('../utils/spotifyAPI');
const xss = require("xss")
const { users, songs, industries } = require("../data");
const { getAveragePrice } = require("../data/users");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const username = req.session.user;
        const userData = await users.getByUsername(username);
     
        /* For each song call get and query for it's object representation, then put
         that into an array to pass to hbs.*/ 
        const songArr = await Promise.all(userData.wallet.holdings.songs.map(async (song) => {
            let songObj = await songs.get(song.toString());
            return await getSpotifyData(songObj);
        }));

        const time = new Date().getHours();
        const greeting = time < 12 ? 'morning' : time < 18 ? 'afternoon' : 'evening';

        let stockIds = userData.wallet.holdings.stocks
        let stocks = []
        for (const stockId of stockIds) {
            const {symbol} = await industries.getIndustry(stockId)
            const shares = await users.getNumberOfShares(userData._id, stockId)
            const price = await users.getAveragePrice(userData._id, stockId)
            stocks.push({
                symbol,
                shares,
                price
            })
        }

        res.render("extras/wallet", {
            username: userData.firstName,
            time: greeting,
            stocks,
            songs: songArr,
            balance: userData.wallet.balance,
            portfolioValues: userData.wallet.portfolioValues,
            transactions: userData.wallet.transactions
        });
    }
    catch(e) {
        // Error here.
        console.log(e)
        res.status(400).json({"error": e})
    }
});

router.post("/", async (req, res) => {
    res.render("extras/wallet", {});
});

router.get('/portfolio_value', async (req, res) => {
    const username = req.session.user;
    console.log(username);
    // try {
    //     const _userId = users.getObjectId(userId)
    //     const user = await users.getBy(userId)
    // } catch (e) {
    //     res.status(400).json({error: e})
    //     return
    // }
    try {
        const user = await users.getByUsername(username)
        console.log(user);
        res.json(user.wallet.portfolioValues)
    } catch {
        res.status(500).json({error: 'Internal Server Error'})
    }
})

module.exports = router;
