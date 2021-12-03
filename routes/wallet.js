const express = require("express");
const { users } = require("../data");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const username = req.session.user;
        const userData = await users.getByUsername(username);

        console.log(userData);

        res.render("extras/wallet", {
            username: username,
            stocks: userData.wallet.holdings.stocks,
            songs: userData.wallet.holdings.songs,
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

module.exports = router;
