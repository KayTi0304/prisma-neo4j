export type DriverConfig = {
    url?: string
    username?: string
    password?: string
    database?: string
    driver?: any | undefined
}

export type Cypher = {
    query: string
    args: any
}

export var dC:DriverConfig = {};

export const DriverDisconnect = async () => {
    await dC.driver.close()
}

export const DriverInit = async (url: string, username: string, password: string, database: string) => {
   console.log("in driver init")
    const neo4j = require('neo4j-driver')
   try {
    const driver = await neo4j.driver(url, neo4j.auth.basic(username, password))
    await driver.verifyConnectivity()
    console.log('Connection established')
    dC.url = url
    dC.username
    dC.database = database
    dC.password = password
    dC.driver = driver
   } catch (err) {
        return err
   }
}