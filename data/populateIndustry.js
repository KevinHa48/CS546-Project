const industries = require("./industries");
const connection = require("../config/mongoConnection");

const main = async() => {
    try {
        const spotify = await industries.createIndustry("Spotify", "SPOT");
    }
    catch(e) {
        console.log(e);
    }

    try {
        const sirius = await industries.createIndustry("Sirius XM", "SIRI");
    }
    catch(e) {
        console.log(e);
    }

    try {
        const heart = await industries.createIndustry("iHeart Media Inc", "IHRT");
    }
    catch(e) {
        console.log(e);
    }

    try {
        const db = await connection();
        await db.s.client.close();
    } catch (e) {
        console.log(e);
    }

}

main();