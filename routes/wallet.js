const express = require('express');
const {getSpotifyData} = require('../utils/spotifyAPI');
const xss = require('xss');
const {users, songs, industries} = require('../data');
const {getAveragePrice} = require('../data/users');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const username = xss(req.session.user);
        const userData = await users.getByUsername(username);

        /* For each song call get and query for it's object representation, then put
         that into an array to pass to hbs.*/
        const songArr = await Promise.all(
            userData.wallet.holdings.songs.map(async (song) => {
                let songObj = await songs.get(song.toString());
                return await getSpotifyData(songObj);
            })
        );
        // Get the current time of the day to greet the user.
        const time = new Date().getHours();
        const greeting =
            time < 12 ? 'morning' : time < 18 ? 'afternoon' : 'evening';

        // Create a new object array from the transactions object to be displayed on the front end.
        const transactions = await Promise.all(
            userData.wallet.transactions.map(async (transaction) => {
                if (!transaction.type) {
                    const {name, artist} = await songs.get(
                        transaction._itemId.toString()
                    );
                    transaction.name = name;
                    transaction.artist = artist;
                } else {
                    const industry = await industries.getIndustry(
                        transaction._itemId.toString()
                    );
                    transaction.name = industry.name;
                    transaction.symbol = industry.symbol;
                }
                return transaction;
            })
        );

        let stockIds = userData.wallet.holdings.stocks;
        if (stockIds.length === 0) {
            stocks = [];
        } else {
            let stocks = [];
            for (const stockId of stockIds) {
                const {name, symbol, lastPrice} = await industries.getIndustry(
                    stockId
                );
                console.log(lastPrice);
                const shares = await users.getNumberOfShares(
                    userData._id,
                    stockId
                );
                if (shares === 0) continue;
                const price = await users.getAveragePrice(
                    userData._id,
                    stockId
                );
                let ret = (lastPrice - price) / price;
                ret = Math.trunc(ret * 10000) / 100; // in terms of %, contains two decimal places.
                stocks.push({
                    name,
                    symbol,
                    shares,
                    price,
                    return: ret,
                });
            }
        }
        const portfolioValues = userData.wallet.portfolioValues;

        let assetVal = 0;
        if (portfolioValues.length > 0) {
            assetVal = portfolioValues[portfolioValues.length - 1].value;
        }
        res.render('extras/wallet', {
            username: userData.firstName,
            assets: assetVal,
            time: greeting,
            stocks,
            songs: songArr,
            balance: userData.wallet.balance,
            portfolioValues: portfolioValues,
            transactions: transactions,
        });
    } catch (e) {
        // Error here.
        console.log(e);
        res.status(400).json({error: e});
    }
});

// Buying a song
router.post('/songs/:id', async (req, res) => {
    try {
        // Validate the ID
        // Grab the song data, which will be used for the next function.
        const songId = users.getObjectId(req.params.id).toString();
        const songData = await songs.get(songId);
        // Grab the user to extract their ID.
        const userInfo = await users.getByUsername(req.session.user);
        const userId = userInfo._id.toString();

        // Call songs transaction
        await users.addSongTransaction(
            userId,
            new Date(),
            songId,
            'buy',
            songData.price
        );
        res.redirect('/wallet');
    } catch (e) {
        let songData = await songs.get(req.params.id);
        const songCover = await getSpotifyData(songData);
        console.log(songData.price);
        res.render('extras/songDetails', {
            title: 'Music Details',
            songs: songData,
            image: songCover.image,
            errors: e,
        });
    }
});

// Buying a stock
router.post('/stocks/:id', async (req, res) => {
    console.log(res);
    res.render('extras/wallet', {});
});

router.get('/portfolio_value', async (req, res) => {
    const username = xss(req.session.user);
    try {
        const user = await users.getByUsername(username);
        //console.log(user);
        res.json(user.wallet.portfolioValues);
    } catch {
        res.status(500).json({error: 'Internal Server Error'});
    }
});

module.exports = router;
