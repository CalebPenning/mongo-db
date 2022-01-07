const { MongoClient } = require('mongodb')

function circulationRepo() {
    function loadData(data) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url)
            try {
                await client.connect()
                const db = client.db(dbName)

                const results = await db.collection('newspapers').insertMany(data)
                resolve(results)
            }

            catch(err) {
                reject(err)
            }
        })
    }
    return { loadData }
}

module.exports = circulationRepo()