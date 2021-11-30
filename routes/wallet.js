const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    res.render("extras/wallet", {});
});

router.post("/", async (req, res) => {
    res.render("extras/wallet", {});
});

module.exports = router;
