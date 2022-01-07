const { MongoClient, ObjectID } = require('mongodb')

function circulationRepo() {
    const url = "mongodb://localhost:27017"
    const dbName = "circulation"

    function get(query, limit) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url)
            try {
                await client.connect()
                const db = client.db(dbName)

                let items = db.collection('newspapers').find(query)

                if (limit > 0) items = items.limit(limit)

                resolve(await items.toArray())
                client.close()
            }
            catch (err) {
                reject(err)
            }
        })
    }

    function getById(id) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url)
            try {
                await client.connect()
                const db = client.db(dbName)

                const item = await db.collection('newspapers').findOne({ _id: ObjectID(id) })
                resolve(item)
                client.close()
            }
            catch (err) {
                reject(err)
            }
        })
    }

    function loadData(data) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url)
            try {
                await client.connect()
                const db = client.db(dbName)

                const results = await db.collection('newspapers').insertMany(data)
                resolve(results)
                client.close()
            }

            catch(err) {
                reject(err)
            }
        })
    }

    function add(item) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url)
            try {
                await client.connect()
                const db = client.db(dbName)

                const addedItem = await db.collection('newspapers').insertOne(item)
                resolve(addedItem.ops[0])
                client.close()
            }
            catch(err) {
                reject(err)
            }
        })
    }

    function update(id, item) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url)
            try {
                await client.connect()
                const db = client.db(dbName)

                const updatedItem = await db.collection('newspapers')
                    .findOneAndReplace({ _id: ObjectID(id) }, item, { returnOriginal: false })
                resolve(updatedItem.value)
                client.close()
            }
            catch(err) {
                reject(err)
            }
        })
    }

    function remove(id) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url)
            try {
                await client.connect()
                const db = client.db(dbName)

                const removed = await db.collection('newspapers').deleteOne({ _id: ObjectID(id) })
                resolve(removed.deletedCount === 1)
                client.close()
            }
            catch(err) {
                reject(err)
            }
        })
    }
    function averageFinalists() {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url)
            try {
                await client.connect()
                const db = client.db(dbName)

                const average = await db.collection('newspapers')
                    .aggregate([{ 
                        $group: { 
                            _id: null, 
                            avgFinalists: { $avg: "$Pulitzer Prize Winners and Finalists, 1990-2014" }
                        }}]).toArray()
                resolve(average[0].avgFinalists)
                client.close()
            }
            catch(err) {
                reject(err)
            }
        })
    }
    function averageFinalistsByChange() {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url)
            try {
                await client.connect()
                const db = client.db(dbName)

                const average = await db.collection('newspapers')
                    .aggregate([
                        { $project: {
                            "Newspaper": 1,
                            "Pulitzer Prize Winners and Finalists, 1990-2014": 1,
                            "Change in Daily Circulation, 2004-2013": 1,
                            overallChange: {
                                $cond: { if: { $gte: ["$Change in Daily Circulation, 2004-2013", 0] }, then: "positive", else: "negative" }
                            }
                        }},
                        { $group: {
                            _id: "$overallChange",
                            avgFinalists: { $avg: "$Pulitzer Prize Winners and Finalists, 1990-2014" }
                        }}
                    ]).toArray()
                resolve(average)
                client.close()
            }
            catch(err) {
                reject(err)
            }
        })
    }
    return { loadData, get, getById, add, update, remove, averageFinalists, averageFinalistsByChange }
}

module.exports = circulationRepo()