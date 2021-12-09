const express = require("express");
const { getSpotifyData } = require('../utils/spotifyAPI');
const xss = require("xss")
const { users, songs, industries } = require("../data");
const { getAveragePrice } = require("../data/users");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const username = xss(req.session.user);
        const userData = await users.getByUsername(username);
     
        /* For each song call get and query for it's object representation, then put
         that into an array to pass to hbs.*/ 
        const songArr = await Promise.all(userData.wallet.holdings.songs.map(async (song) => {
            let songObj = await songs.get(song.toString());
            return await getSpotifyData(songObj);
        }));
        // Get the current time of the day to greet the user.
        const time = new Date().getHours();
        const greeting = time < 12 ? 'morning' : time < 18 ? 'afternoon' : 'evening';

        // Create a new object array from the transactions object to be displayed on the front end.
        const transactions = await Promise.all(userData.wallet.transactions.map(async (transaction) => {
            if(!transaction.type) {
                const { name, artist } = await songs.get(transaction._itemId.toString());
                transaction.name = name;
                transaction.artist = artist;
            }
            else {
                const industry = await industries.getIndustry(transaction._itemId.toString());
                transaction.name = industry.name;
                transaction.symbol = industry.symbol
            }
            return transaction;
        }));

        let stockIds = userData.wallet.holdings.stocks
        let stocks = []
        for (const stockId of stockIds) {
            const {name, symbol, lastPrice} = await industries.getIndustry(stockId)
            const shares = await users.getNumberOfShares(userData._id, stockId)
            const price = await users.getAveragePrice(userData._id, stockId)
            let ret = (lastPrice - price) / price
            ret = Math.trunc(ret * 10000) / 100 // in terms of %, contains two decimal places.
            stocks.push({
                name,
                symbol,
                shares,
                price,
                return: ret,
            })
        }
        console.log(stocks[0]);
        // songArr to songs?
        res.render("extras/wallet", {
            username: userData.firstName,
            time: greeting,
            stocks,
            songs: songArr,
            balance: userData.wallet.balance,
            portfolioValues: userData.wallet.portfolioValues,
            transactions: transactions
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
    const username = xss(req.session.user);
    try {
        const user = await users.getByUsername(username)
        console.log(user);
        res.json(user.wallet.portfolioValues)
    } catch {
        res.status(500).json({error: 'Internal Server Error'})
    }
})

module.exports = router;
