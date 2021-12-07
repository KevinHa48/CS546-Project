const {ObjectId} = require('mongodb')
const connection = require("../config/mongoConnection");
const {users} = require('../config/mongoCollection')

const userid = "61a7ff46e20cf9e4f77221f5";

const main = async() => {
    try {
        //const share1 = await users.addStockTransaction(userid, new Date(), '61ac2c3fe342ad18b7682e4c', 'buy', 150, 10);
        //const share2 = await users.addStockTransaction(userid, new Date(), '61ac2c3fe342ad18b7682e4d', 'buy', 15, 50);
        //console.log(await users.calculatePortfolioValue(userid));
        const date = new Date();
        const userDB = await users();

        await userDB.updateOne({_id: ObjectId(userid)}, {
            $push: {
                'wallet.portfolioValues': {
                    date: date.toDateString(), 
                    value: 0
                }
            }
        })
        await userDB.updateOne({_id: ObjectId(userid)}, {
            $push: {
                'wallet.portfolioValues': {
                    date: new Date(date.setDate(date.getDate() + 1)).toDateString(), 
                    value: 430.98
                }
            }
        })
        await userDB.updateOne({_id: ObjectId(userid)}, {
            $push: {
                'wallet.portfolioValues': {
                    date: new Date(date.setDate(date.getDate() + 1)).toDateString(), 
                    value: 1090.90
                }
            }
        })
        await userDB.updateOne({_id: ObjectId(userid)}, {
            $push: {
                'wallet.portfolioValues': {
                    date: new Date(date.setDate(date.getDate() + 1)).toDateString(), 
                    value: 1500.69
                }
            }
        })
        await userDB.updateOne({_id: ObjectId(userid)}, {
            $push: {
                'wallet.portfolioValues': {
                    date: new Date(date.setDate(date.getDate() + 1)).toDateString(), 
                    value: 1.50
                }
            }
        })
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