const marketRoutes = require("./market");
const walletRoutes = require("./wallet");
const musicRoutes = require("./songs");
const path = require("path");

const constructorMethod = (app) => {
    app.use("/market", marketRoutes);
    app.use("/songs", musicRoutes);
    app.use("/wallet", walletRoutes);
    app.get("/", (req, res) => {
        res.sendFile(path.resolve("static/home.html"));
    });

    app.use("*", (req, res) => {
        res.status(404).json({error: "Not found"});
    });
};

module.exports = constructorMethod;
