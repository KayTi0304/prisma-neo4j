export type DriverConfig = {
    url: string
    username: string
    password: string
    database: string
    driver: any
}

export type Cypher = {
    query: string
    args: any
}

export const DriverInit = async (url: string, username: string, password: string, database: string): Promise<any> => {
   const neo4j = require('neo4j-driver')
   try {
    const driver = neo4j.driver(url, username, password)
    await driver.verifyConnectivity()
    console.log('Connection established')
   
    const driverConfig: DriverConfig = {
        url: url,
        username: username,
        password: password,
        database: database,
        driver: driver
    }
    return driverConfig
   } catch (err) {
        return err
   }
}