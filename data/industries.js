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

// borrowing this for now..
function validateStringParams(param, paramName) {
    if (!param) {
        throw `Error: No ${paramName} passed to the function`;
    } else if (typeof param !== "string") {
        throw `Type Error: Argument ${param} passed is not a string ${paramName}`;
    } else if (param.length === 0) {
        throw `Error: No element present in string ${paramName}`;
    } else if (!param.trim()) {
        throw `Error: Empty spaces passed to string ${paramName}`;
    }
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

const createIndustry = async(name, symbol) => {
    validateStringParams(name);
    validateStringParams(symbol);

    const symbolTrim = symbol.trim();

    const industryCollection = await industries();
    const industry = {
        name: name,
        symbol: symbolTrim
    }

    const insertedIndustry = await industryCollection.insertOne(industry);
    if(insertedIndustry.modifiedCount === 0) {
        throw "Error: Industry could not be inserted";
    }

    return insertedIndustry;
}

module.exports = {
    getIndustry,
    getAllIndustries,
    createIndustry
}

// For deleting and updating, the user's current portfolio would also need to be updated.