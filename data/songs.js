const {songs} = require("../config/mongoCollection");
const {ObjectId} = require("mongodb");

async function get(searchId) {
    searchId = searchId.trim();
    if (!ObjectId.isValid(searchId)) {
        throw `Error : Id passed in must be a Buffer or string of 12 bytes or a string of 24 hex characters`;
    }
    let parseId = ObjectId(searchId);
    const songsCollection = await songs();
    const songFound = await songsCollection.findOne({_id: parseId});
    if (songFound === null) {
        throw `No song found with the id ${searchId}`;
    } else {
        songFound["_id"] = searchId;
    }
    return songFound;
}

async function create(
    name,
    artist,
    price,
    genre,
    description,
    lastSoldPrice,
    numberOfTracks,
    currentlyAvailable
) {
    const songsCollection = await songs();
    let newSong = {
        name: name,
        artist: artist,
        price: price,
        genre: genre,
        description: description,
        lastSoldPrice: lastSoldPrice,
        numberOfTracks: numberOfTracks,
        currentOwner: "None",
        currentlyAvailable: currentlyAvailable,
    };
    const insertedDatadetails = await songsCollection.insertOne(newSong);
    if (insertedDatadetails.insertedCount === 0) {
        throw "Song could not be inserted";
    }

    const songId = insertedDatadetails.insertedId.toString();

    const songDetails = await get(songId);
    return songDetails;
}

module.exports = {create, get};
