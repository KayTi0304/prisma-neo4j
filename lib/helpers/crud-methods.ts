import { Cypher, DriverConfig } from "../config/neo4j"

export const CreateNodeQuery = (modelName: string | undefined, args: any): Cypher => {
    const argsBody = JSON.parse(args)
    let nodesargs:any
    let stmt:string = "CREATE "
    stmt += `(n:${modelName} $props) `
    if (argsBody != undefined) {
        argsBody.array.forEach((element) => {
            const [k, v] = element
            nodesargs[k] = v
        });
    }
    stmt += `RETURN n;`
    let cypher:Cypher = {
        query: stmt,
        args: {"props": nodesargs}
    }
    return cypher
}

export const UpdateNodeQuery = (modelName: string | undefined, args: any): Cypher => {
    const argsBody = JSON.parse(args)
    let nodesargs:any
    let stmt:string = "MATCH "
    stmt += `(n:${modelName})`
    if (argsBody != undefined) {
        if (argsBody.where != undefined) {
            stmt += `WHERE `
            argsBody.where.array.forEach((element, i) => {
                if (i != 0) stmt += ` AND `
                const [k, v] = element
                stmt += `${k} = $${(k as string).toUpperCase}`
                nodesargs[k] = v
            });
        }

        if (argsBody.data != undefined) {
            stmt += ` SET n = $props`
            let setparams:any
            argsBody.data.array.forEach((element, i) => {
                const [k, v] = element
                setparams[k] = v
            });
            nodesargs.props = setparams
        }
    }

    stmt += `RETURN n;`
    let cypher:Cypher = {
        query: stmt,
        args: nodesargs
    }
    return cypher
}

export const DeleteNodeQuery = (modelName: string | undefined, args:any): Cypher => {
    const argsBody = JSON.parse(args)
    let nodesargs:any
    let stmt:string = "MATCH "
    stmt += `(n:${modelName})`
    if (argsBody != undefined && argsBody.where != undefined) {
        stmt += `WHERE `
        argsBody.where.array.forEach((element, i) => {
            if (i != 0) stmt += ` AND `
            const [k, v] = element
            stmt += `${k} = $${(k as string).toUpperCase}`
            nodesargs[k] = v
        });
    }
    stmt += `DELETE n;`
    let cypher:Cypher = {
        query: stmt,
        args: nodesargs
    }
    return cypher
}

export const FindNodeQuery = (modelName: string | undefined, args:any): Cypher => {
    const argsBody = JSON.parse(args)
    let nodesargs:any
    let stmt:string = "MATCH "
    stmt += `(n:${modelName})`
    if (argsBody != undefined && argsBody.where != undefined) {
        stmt += `WHERE `
        argsBody.where.array.forEach((element, i) => {
            if (i != 0) stmt += ` AND `
            const [k, v] = element
            stmt += `${k} = $${(k as string).toUpperCase}`
            nodesargs[k] = v
        });
    }
    stmt += `RETURN n;`
    let cypher:Cypher = {
        query: stmt,
        args: nodesargs
    }
    return cypher
}

export const RunCypherTransactionRead = async (query: Cypher, driver:DriverConfig): Promise<any> => {
    const session = driver.driver.session({database: driver.database})
    const result = await session.executeRead(async tx => {
        return await tx.run(query.query, query.args)
    })
    session.close()
    return result
}

export const RunCypherTransactionWrite = async (query: Cypher, driver:DriverConfig): Promise<any> => {
    const session = driver.driver.session({database: driver.database})
    const result = await session.executeWrite(async tx => {
        return await tx.run(query.query, query.args)
    })
    session.close()
    return result
}