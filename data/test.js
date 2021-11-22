/* this file is strictly for testing db functions. */

const users = require('./users')
const connection = require('../config/mongoConnection')

const main = async () => {
    try {
        const user = await users.create('Marcus', 'Zebrowski', 'mzebrows@stevens.edu',
                                        21, 'mzebrows', 'password')
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
        const id = '618a8125cc8852153fe59da1'
        const user = await users.addBalance(id, 100000)
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