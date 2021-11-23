const {users} = require('../config/mongoCollection')
const {ObjectId} = require('mongodb')

const validEmail = email => {
    /* more thorough type checking for emails. */
    if (typeof email !== 'string') {
        return false
    }
    let username, website, domain, tld
    const emailComponents = email.split('@')
    if (emailComponents.length !== 2) {
        return false
    }
    username = emailComponents[0]
    website = emailComponents[1]

    const websiteComponents = website.split('.')
    if (websiteComponents.length !== 2) {
        return false
    }
    domain = websiteComponents[0]
    tld = websiteComponents[1]

    for (str of [username, website, domain, tld]) {
        if (str.trim().length === 0) {
            return false
        }
    }
    return true
}

const getObjectId = id => {
    if (typeof id !== 'string') {
        throw 'Provided id is not a string.'
    }
    let _id
    try {
        _id = ObjectId(id)
    } catch {
        throw 'Provided id is not a valid ObjectId.'
    }
    return _id
}

const userExists = async username => {
    /* checking that a user with the provided username does not already exist
       before creating document. Password is optional argument to verify that
       user has that password. It should be hashed when passed in. */
    if (typeof username !== 'string' || username.trim().length < 4) {
        throw 'Provided username must be at least 4 characters long.'
    }
    const collection = await users()
    const user = await collection.findOne({username})
    return !!user
}

const get = async id => {
    /* return document of user with provided id. */
    const _id = getObjectId(id)
    const collection = await users()
    let user = await collection.findOne({_id})
    if (!user) {
        throw 'No user was found with the provided id.'
    }
    user._id = user._id.toString()
    return user
}

const create = async (firstName, lastName, email, age, username, password) => {
    /* this method should run whenever someone creates a new account. password 
       should be hashed when passed in. */
    if (typeof firstName !== 'string' || firstName.trim().length === 0) {
        throw 'First name cannot be blank.'
    }
    if (typeof lastName !== 'string' || lastName.trim().length === 0) {
        throw 'Last name cannot be blank.'
    }
    if (typeof age !== 'number' || age < 18) {
        throw 'User must be at least 18 years old.'
    }
    if (!validEmail(email)) {
        throw 'Email is not valid.'
    }
    if (typeof username !== 'string' || username.trim().length < 4) {
        throw 'Username must be at least 4 characters long.'
    }
    const bool = await userExists(username)
    if (bool) {
        throw 'Provided username is unavailable.'
    }
    if (typeof password !== 'string' || password.trim().length < 8) {
        throw 'Password must be at least 8 characters long.'
    }
    const user = {
        firstName,
        lastName,
        age,
        email,
        username,
        password,
        wallet: {
            holdings: {
                stocks: [],
                songs: []
            },
            balance: 0.0,
            portfolioValues: [],
            transactions: []
        }
    }
    const collection = await users()
    let {insertedId} = await collection.insertOne(user)
    insertedId = insertedId.toString()
    const result = await get(insertedId)
    return result
}

const addBalance = async (id, amt) => {
    /* add to the balance of a user. */
    const _id = getObjectId(id)
    if (typeof amt !== 'number' || amt <= 0) {
        throw 'Added amount must be a number greater than 0.'
    }
    const collection = await users()
    const updateInfo = await collection.updateOne({_id}, {$inc: {'wallet.balance': amt}})
    if (updateInfo.matchedCount === 0) {
        throw 'User not found with the provided id.'
    }
    if (updateInfo.modifiedCount === 0) {
        throw 'Failed to update balance for user.'
    }
    const user = await get(id)
    return user
}

const addStockTransaction = async (userId, datetime, stockId, pos, price, shares) => {
    /* this will add a stock transaction to the transactions array for the user.
       the only difference is that this subdocument will include a shares key.
       this will also update holdings (e.g. they buy a new stock or they sell out of
       one completely) as well as balance. as a side note: another function. */
    const _userId = getObjectId(userId)
    const _stockId = getObjectId(stockId)
    if (!(datetime instanceof Date)) {
        throw 'Must provide a valid Date object.'
    }
    if (typeof pos !== 'string' || (pos !== 'buy' && pos !== 'sell')) {
        throw 'Position must be either "buy" or "sell".'
    }
    if (typeof price !== 'number' || price <= 0) {
        throw 'Price must be a number greater than 0.'
    }
    if (typeof shares !== 'number' || shares <= 0) {
        throw 'Shares must be a number greater than 0.'
    }
    const user = await get(userId)
    if (pos == 'buy' && price * shares > user.wallet.balance) {
        throw 'User does not have enough money to make this transaction.'
    }
    const transaction = {
        _id: new ObjectId(),
        datetime,
        itemId,
        price,
        shares,
        pos
    }
    const collection = await users()
    const updateInfo = await collection.updateOne({_id: _userId}, {})
    return
}

const addSongTransaction = (userId, datetime, songId, price) => {

}

module.exports = {
    userExists,
    get,
    create,
    addTransaction,
    addBalance,
    addStockTransaction,
    addSongTransaction
}