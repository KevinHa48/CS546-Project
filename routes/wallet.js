const express = require("express");
const { users } = require("../data");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const username = req.session.user;
        const userData = await users.getByUsername();

        console.log(userData);

        res.render("extras/wallet", {
            username: username,
        })
    }
    catch {
        // Error here.
    }
});

router.post("/", async (req, res) => {
    res.render("extras/wallet", {});
});

module.exports = router;
