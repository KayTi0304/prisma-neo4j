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
