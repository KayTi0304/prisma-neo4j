export type DriverConfig = {
    url?: string
    username?: string
    password?: string
    database?: string
    driver?: any | undefined
}

export type CypherUpdate = {
    match: string
    set: string
    args: any
}

export type Cypher = {
    query: string
    args: any
}

export type ObjectAndRelationshipCyperUpdate = {
    cypher: CypherUpdate[]
    relationship: string[] 
}

export type ObjectAndRelationshipCyper = {
    cypher: Cypher[]
    relationship: string[] 
}

export var dC:DriverConfig = {};

export const DriverDisconnect = async () => {
    await dC.driver.close()
}

export const DriverInit = async (url: string, username: string, password: string, database: string) => {
    const neo4j = require('neo4j-driver')
   try {
    const driver = await neo4j.driver(url, neo4j.auth.basic(username, password))
    await driver.verifyConnectivity()
    dC.url = url
    dC.username
    dC.database = database
    dC.password = password
    dC.driver = driver
   } catch (err) {
        return err
   }
}

export const RunCypherTransactionRead = async (query: Cypher, driver:DriverConfig): Promise<any> => {
    const session = driver.driver.session({database: driver.database})
    const result = await session.executeRead(async (tx: { run: (arg0: string, arg1: any) => any }) => {
        return await tx.run(query.query, query.args)
    })
    await session.close()
    return result
}

export const RunCypherTransactionWrite = async (query: Cypher, driver:DriverConfig): Promise<any> => {
    const session = driver.driver.session({database: driver.database})
    const result = await session.executeWrite(async (tx: { run: (arg0: string, arg1: any) => any }) => {
        return await tx.run(query.query, query.args)
    })
    await session.close()
    return result
}