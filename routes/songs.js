const express = require("express");
const songsData = require("../data/songs");
const router = express.Router();

router.get("/", async (req, res) => {
    let songsList = await songsData.getAll();
    res.render("extras/songs", {title: "Music Rights Page", songs: songsList});
});

router.get("/:id", async (req, res) => {
    let songs = await songsData.get(req.params.id);
    res.render("extras/songDetails", {title: "Music Details", songs: songs});
});

module.exports = router;
