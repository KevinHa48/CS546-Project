const {users} = require('../config/mongoCollection')
const {ObjectId} = require('mongodb')
const md5 = require('blueimp-md5')

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

const userExists = async username => {
    /* checking that a user with the provided username does not already exist
       before creating document. */
    if (typeof username !== 'string' || username.trim().length < 4) {
        throw 'Provided username must be at least 4 characters long.'
    }
    const collection = await users()
    const user = await collection.findOne({username})
    return !!user
}

const get = async id => {
    /* return document of user with provided id. */
    if (typeof id !== 'string') {
        throw 'Provided id is not a string.'
    }
    let _id
    try {
        _id = ObjectId(id)
    } catch {
        throw 'Provided id is not a valid ObjectId.'
    }
    const collection = await users()
    let user = await collection.findOne({_id})
    if (!user) {
        throw 'No user was found with the provided id.'
    }
    user._id = user._id.toString()
    return user
}

const create = async (firstName, lastName, email, age, username, password) => {
    /* this method should run whenever someone creates a new account. */
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
        password: md5(password),
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

module.exports = {
    userExists,
    get,
    create
}