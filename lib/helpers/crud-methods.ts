import { Cypher } from "../config/neo4j"
import { iterateObjectCreation, iterateObjectUpdate, parseObjectsAndRelationships, parseObjectsAndRelationshipsUpdate } from "./parse"

export const CreateNodeQuery = (modelName: string | undefined, args: any): Cypher => {
    if (modelName == undefined) 
        return {
            query: "", 
            args: undefined
        }
    const objectsAndRelationships = iterateObjectCreation(modelName, 0, args['data'])
    const cypherFinal = parseObjectsAndRelationships(objectsAndRelationships)
    return cypherFinal
}

export const UpdateNodeQuery = (modelName: string | undefined, args: any): Cypher => {
    if (modelName == undefined) 
        return {
            query: "", 
            args: undefined
        }
    const objectsAndRelationships = iterateObjectUpdate(modelName, 0, args, undefined)
    const cypherFinal = parseObjectsAndRelationshipsUpdate(objectsAndRelationships)
    return cypherFinal
}

export const DeleteNodeQuery = (modelName: String | undefined, args:any): Cypher => {
    const argsBody = JSON.parse(args)
    let nodeargs:any
    let stmt:string = `MATCH (n:${modelName} `
    const where = argsBody["where"]
    var i = 0
    for (var key in where) {
        if (i++ == 0) stmt += `{${key} = $${key}`
        else stmt += `, ${key} = $${key}`
        nodeargs[`${key}`] = where[key]
    }
    stmt += `}) DETACH DELETE n;`
    let cypher:Cypher = {
        query: stmt,
        args: nodeargs
    }
    return cypher
}

export const FindNodeQuery = (modelName: String | undefined, args:any): Cypher => {
    const argsBody = JSON.parse(args)
    let nodeargs:any
    let stmt:string = `MATCH (n:${modelName} `
    const where = argsBody["where"]
    var i = 0
    for (var key in where) {
        if (i++ == 0) stmt += `{${key} = $${key}`
        else stmt += `, ${key} = $${key}`
        nodeargs[`${key}`] = where[key]
    }
    stmt += `}) RETURN n;`
    let cypher:Cypher = {
        query: stmt,
        args: nodeargs
    }
    return cypher
}

/*export const CreateNodeQuery = (modelName: string | undefined, args: any): Cypher => {
    const argsBody = parseJson(args)
    let stmt:string = "CREATE "
    stmt += `(n:${modelName} $props) `
    stmt += `RETURN n;`
    let cypher:Cypher = {
        query: stmt,
        args: {"props": argsBody.data}
    }
    return cypher
}*/

/*export const UpdateNodeQuery = (modelName: string | undefined, args: any): Cypher => {
    const argsBody = JSON.parse(args)
    let nodesargs:any
    let stmt:string = "MATCH "
    stmt += `(n:${modelName})`
    if (argsBody != undefined) {
        if (argsBody.where != undefined) {
            stmt += `WHERE `
            argsBody.where.array.forEach((element: [any, any], i: number) => {
                if (i != 0) stmt += ` AND `
                const [k, v] = element
                stmt += `${k} = $${(k as string).toUpperCase}`
                nodesargs[k] = v
            });
        }

        if (argsBody.data != undefined) {
            stmt += ` SET n = $props`
            let setparams:any
            argsBody.data.array.forEach((element: [any, any], i: any) => {
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
}*/

