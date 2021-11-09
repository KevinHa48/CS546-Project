/* this file is strictly for testing db functions. */

const users = require('./users')
const connection = require('../config/mongoConnection')

const main = async () => {
    let id;
    try {
        const user = await users.create('Marcus', 'Zebrowski', 'mzebrows@stevens.edu',
                                        21, 'mzebrows', 'password')
        id = user._id
        console.log(user)
    } catch (e) {
        console.log(e)
    }

    try {
        const user = await users.create('Marcus', 'Zebrowski', 'mzebrows@stevens.edu',
                                        21, 'mzebrows', 'password')
    } catch (e) {
        console.log(e)
    }

    try {
        const user = await users.get('abcd1231')
        console.log(user)
    } catch (e) {
        console.log(e)
    }

    try {
        const db = await connection()
        await db.s.client.close()
        console.log('Done')
    } catch (e) {
        console.log(e)
    }
}

main()