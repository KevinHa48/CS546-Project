const {users} = require('../config/mongoCollection')
const {ObjectId} = require('mongodb')
const bcrypt = require('bcryptjs')
const saltRounds = 16

const validEmail = email => {
    // more thorough type checking for emails.
    if (typeof email !== 'string') {
        return false
    }
    const [username, website] = email.split('@')
    if (!username || !website) {
        return false
    }
    const [domain, tld] = website.split('.')
    if (!domain || !tld) {
        return false
    }
    if (username.length === 0 || username.match('[^A-Za-z0-9\.]+')) {
        return false
    }
    if (domain.length === 0 || domain.match('[^A-Za-z0-9\-]+')) {
        return false
    }
    if (tld.length === 0 || tld.match('[^A-Za-z0-9\-]+')) {
        return false
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
    if (username.match('[^A-Za-z0-9]+')) {
        throw 'Username can only contain alphanumeric characters.'
    }
    username = username.toLowerCase()
    const collection = await users()
    const user = await collection.findOne({username})
    return !!user
}

const get = async id => {
    // return document of user with provided id.
    const _id = getObjectId(id)
    const collection = await users()
    let user = await collection.findOne({_id})
    if (!user) {
        throw 'No user was found with the provided id.'
    }
    // displaying all the ObjectIds as strings.
    user._id = user._id.toString()
    for (holdingType of Object.keys(user.wallet.holdings)) {
        user.wallet.holdings[holdingType] = user.wallet.holdings[holdingType].map(holding => holding.toString())
    }
    user.wallet.transactions = user.wallet.transactions.map(transaction => {
        return {
            ...transaction,
            _id: transaction._id.toString(),
            _itemId: transaction._itemId.toString()
        }
    })
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
    if (username.match('[^A-Za-z0-9]+')) {
        throw 'Username must only consist of alphanumeric characters only.'
    }
    const bool = await userExists(username)
    if (bool) {
        throw 'Provided username is unavailable.'
    }
    if (typeof password !== 'string' || password.trim().length < 8) {
        throw 'Password must be at least 8 characters long.'
    }
    if (password.match('[ ]+')) {
        throw 'Password cannot contain spaces.'
    }
    const hash = await bcrypt.hash(password, saltRounds)
    const collection = await users()
    const {insertedId} = await collection.insertOne({
        firstName,
        lastName,
        age,
        email,
        username: username.toLowerCase(),
        password: hash,
        wallet: {
            holdings: {
                stocks: [],
                songs: []
            },
            balance: 0.0,
            portfolioValues: [],
            transactions: []
        }
    })
    const result = await get(insertedId.toString())
    return result
}

const addBalance = async (id, amt) => {
    // add to the balance of a user.
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

const getNumberOfShares = async (userId, stockId) => {
    // calculates the total number of shares a user has of a particular stock.
    const user = await get(userId)
    const {transactions} = user.wallet
    return transactions
        .filter(transaction => transaction._itemId === stockId)
        .map(transaction => transaction.shares * (transaction.pos === 'buy' ? 1 : -1))
        .reduce((a, b) => a + b, 0)
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
        throw 'Pos must either be "buy" or "sell".'
    }
    if (typeof price !== 'number' || price <= 0) {
        throw 'Price must be a number greater than 0.'
    }
    if (typeof shares !== 'number' || shares <= 0) {
        throw 'Shares must be a number greater than 0.'
    }
    const user = await get(userId)
    if (price * shares > user.wallet.balance) {
        throw 'User does not have enough money to make this transaction.'
    }
    const oldShareAmount = await getNumberOfShares(userId, stockId)
    const newShareAmount = oldShareAmount + shares
    if (newShareAmount < 0) {
        throw 'User cannot sell more shares than they own.'
    }
    const transaction = {
        _id: new ObjectId(),
        datetime,
        _itemId: _stockId,
        price,
        shares,
        pos
    }
    const collection = await users()
    let updateInfo = await collection.updateOne({_id: _userId}, {
        $push: {'wallet.transactions': transaction},
        $inc: {'wallet.balance': price * shares * (pos === 'buy' ? -1 : 1)},
    })
    if (updateInfo.matchedCount === 0) {
        throw 'Could not find user with the provided id.'
    }
    if (updateInfo.modifiedCount === 0) {
        throw 'Failed to update user transactions history and balance after transaction.'
    }
    if (oldShareAmount === 0) {
        updateInfo = await collection.updateOne({_id: _userId}, {$push: {'wallet.holdings.stocks': _stockId}})
    } else if (newShareAmount === 0) {
        updateInfo = await collection.updateOne({_id: _userId}, {$pull: {'wallet.holdings.stocks': _stockId}})
    }
    if (updateInfo.matchedCount === 0) {
        throw 'Could not find user with the provided id.'
    }
    if (updateInfo.modifiedCount === 0) {
        throw 'Failed to update user holdings after transaction.'
    }
    const result = await get(userId)
    return result
}

const addSongTransaction = async (userId, datetime, songId, pos, price) => {
    /* this will add a stock transaction to the transactions array for the user.
       the only difference is that this subdocument will include a shares key.
       this will also update holdings (e.g. they buy a new stock or they sell out of
       one completely) as well as balance. as a side note: another function. */
    const _userId = getObjectId(userId)
    const _songId = getObjectId(songId)
    if (!(datetime instanceof Date)) {
        throw 'Must provide a valid Date object.'
    }
    if (typeof pos !== 'string' || (pos !== 'buy' && pos !== 'sell')) {
        throw 'Position must either be "buy" or "sell".'
    }
    if (typeof price !== 'number' || price <= 0) {
        throw 'Price must be a number greater than 0.'
    }
    const transaction = {
        _id: new ObjectId(),
        datetime,
        _itemId: _songId,
        price,
        pos
    }
    const collection = await users()
    let updateInfo = await collection.updateOne({_id: _userId}, {
        $push: {'wallet.transactions': transaction},
        $inc: {'wallet.balance': price * (pos === 'buy' ? -1 : 1)},
    })
    if (updateInfo.matchedCount === 0) {
        throw 'Could not find user with the provided id.'
    }
    if (updateInfo.modifiedCount === 0) {
        throw 'Failed to update user transactions history and balance after transaction.'
    }
    const user = await get(userId)
    if (pos === 'buy' && user.wallet.balance < price) {
        throw 'User cannot afford to buy the rights to this music.'
    }
    if (pos === 'sell' && !(songId in user.wallet.holdings.songs)) {
        throw 'User does not own the rights to the music that they are trying to sell.'
    }
    if (pos === 'buy') {
        updateInfo = await collection.updateOne({_id: _userId}, {$push: {'wallet.holdings.songs': _songId}})
    } else {
        updateInfo = await collection.updateOne({_id: _userId}, {$pull: {'wallet.holdings.songs': _songId}})
    }
    if (updateInfo.matchedCount === 0) {
        throw 'Could not find user with the provided id.'
    }
    if (updateInfo.modifiedCount === 0) {
        throw 'Failed to update user holdings after transaction.'
    }
    const result = await get(userId)
    return result
}

module.exports = {
    userExists,
    get,
    create,
    getNumberOfShares,
    addBalance,
    addStockTransaction,
    addSongTransaction
}