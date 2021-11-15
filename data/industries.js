const {industries} = require("../config/mongoCollection");
const {ObjectId} = require("mongodb");

// Industry names will be provided from an API

const getIndustry = async (id) => {
    const industryCollection = await industries();
    const foundIndustry = await industryCollection.findOne({ _id: id});

    
    return foundIndustry;
}