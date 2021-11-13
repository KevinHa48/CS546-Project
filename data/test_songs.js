const songs = require("./songs");
const connection = require("../config/mongoConnection");

async function main() {
    try {
        const song1 = await songs.create(
            "Beautiful Lady",
            "Gyptian",
            8000,
            "Reggae",
            "track 1: BEAUTIFUL LADY, track 2: SAGA CONTINUES",
            7000,
            2,
            "618ef1adfc8ae9cb3864fdb2",
            true
        );
        console.log(song1);
    } catch (e) {
        console.log(e);
    }

    try {
        const songFind = await songs.get("618efa311a46a25d8d8c4108");
        console.log(songFind);
    } catch (e) {
        console.log(e);
    }

    try {
        const songTest = await songs.create(
            88372,
            "Gyptian",
            8000,
            "Reggae",
            "track 1: BEAUTIFUL LADY, track 2: SAGA CONTINUES",
            7000,
            2,
            "618ef1adfc8ae9cb3864fdb2",
            true
        );
        console.log(songTest);
    } catch (e) {
        console.log(e);
    }

    try {
        const songTest2 = await songs.create(
            "Beautiful Lady",
            "Gyptian",
            "wrongNumber",
            "Reggae",
            "track 1: BEAUTIFUL LADY, track 2: SAGA CONTINUES",
            7000,
            2,
            true
        );
        console.log(songTest2);
    } catch (e) {
        console.log(e);
    }
    try {
        const songTest3 = await songs.create(
            "Beautiful Lady",
            "Gyptian",
            4342,
            "Reggae",
            "track 1: BEAUTIFUL LADY, track 2: SAGA CONTINUES",
            7000,
            2,
            34
        );
        console.log(songTest3);
    } catch (e) {
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
