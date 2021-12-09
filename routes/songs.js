const express = require("express");
const songsData = require("../data/songs");
const {getSpotifyData} = require("../utils/spotifyAPI");
const router = express.Router();

router.get("/", async (req, res) => {
    let songsList = await songsData.getAll();
    res.render("extras/songs", {title: "Music Rights Page", songs: songsList});
});

router.get("/:id", async (req, res) => {
    let songs = await songsData.get(req.params.id);
    const songCover = await getSpotifyData(songs);
    res.render("extras/songDetails", {
        title: "Music Details",
        songs: songs,
        image: songCover.image,
    });
});

module.exports = router;
