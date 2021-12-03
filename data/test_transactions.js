const users = require('./users');
const songs = require('./songs');
const connection = require("../config/mongoConnection");

const userid = "61a7ff46e20cf9e4f77221f5";

const main = async() => {
    try {
        await users.addBalance(userid, 1000000);
    }
    catch(e) {
        console.log(e);
    }

    try {
        const id1 = '61a97815c9b087a9c02fa6d2'
        const song1 = await songs.get(id1);
        console.log(song1);
        await users.addSongTransaction(userid, 
            new Date(), id1 , 'buy', song1.price);
    }
    catch(e) {
        console.log(e);
    }

    try {
        const id1 = '61a97815c9b087a9c02fa6d3'
        const song1 = await songs.get(id1);
        await users.addSongTransaction(userid, 
            new Date(), id1 , 'buy', song1.price);
    }
    catch(e) {
        console.log(e);
    }

    try {
        const id1 = '61a97815c9b087a9c02fa6d4'
        const song1 = await songs.get(id1);
        await users.addSongTransaction(userid, 
            new Date(), id1 , 'buy', song1.price);
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