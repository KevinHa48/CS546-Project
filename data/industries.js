const {industries} = require("../config/mongoCollection");
const {ObjectId} = require("mongodb");

// Industry names will be provided from an API.
// These functions will only be displayed in Admin view.

const idValidator = (id) => {
    if(!id) throw "Error: No ID provided.";
    if(id.trim().length === 0) throw "Error: Your input cannot be all whitespace";
    
    if(!ObjectId.isValid(id)) throw "Error: ObjectId is not of proper format.";
    let convertedId = ObjectId(id);

    return convertedId;
}

const getIndustry = async (id) => {
    const industryId = idValidator(id);
    
    const industryCollection = await industries();
    const foundIndustry = await industryCollection.findOne({ _id: industryId});

    if(foundIndustry === null) throw "Error: No industry with that ID.";
    foundIndustry._id = foundIndustry._id.toString();

    return foundIndustry;
}

const getAllIndustries = async() => {
    const industryCollection = await industries();
    const allIndustries = await industryCollection.find({}).toArray();

    allIndustries.forEach(industry => {
        industry._id = industry._id.toString();
    });

    return allIndustries;
}

module.exports = {
    getIndustry,
    getAllIndustries
}

// For deleting and updating, the user's current portfolio would also need to be updated.