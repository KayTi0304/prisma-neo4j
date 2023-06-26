import { Cypher, ObjectAndRelationshipCyper } from "../config/neo4j"
import { getConds } from "./helper"
import { iterateObjectCreation, iterateObjectUpdate, parseObjectsAndRelationships, parseObjectsAndRelationshipsUpdate } from "./parse"

export const CreateNodeQuery = (modelName: string | undefined, args: any): Cypher => {
    if (modelName == undefined) return {query: "", args: undefined}
    const objectsAndRelationships = iterateObjectCreation(modelName, 0, args['data'])
    return parseObjectsAndRelationships(objectsAndRelationships)
}

export const UpdateNodeQuery = (modelName: string | undefined, args: any): Cypher => {
    if (modelName == undefined) return {query: "", args: undefined}

    const objectsAndRelationships = iterateObjectUpdate(modelName, 0, args, undefined)
    return parseObjectsAndRelationshipsUpdate(objectsAndRelationships)
}

export const CreateMultipleNodesQuery = (modelName: String | undefined, args:any): Cypher => {
    if (modelName == undefined) return {query: "", args: undefined}
    let finalCypher:ObjectAndRelationshipCyper = {cypher: [], relationship: []}

    const nodes = args["data"]; var i = 0
    for (var node of nodes) {
        const obj = iterateObjectCreation(modelName, i++, node)
        finalCypher.cypher = finalCypher.cypher.concat(obj.cypher)
        finalCypher.relationship = finalCypher.relationship.concat(obj.relationship)
    }
    return parseObjectsAndRelationships(finalCypher)
}

export const UpdateMultipleNodesQuery = (modelName: String | undefined, args:any): Cypher => {
    if (modelName == undefined) return {query: "", args: undefined}
    let nodeargs:any
    let stmt:string = `MATCH (n:${modelName}) WHERE`
    const where = args["where"]
    var i = 0
    for (var key in where) {
        if (i++ != 0) stmt += ' AND '

        const field = where[key]

        if (typeof(field) == "object") {
            const conds = getConds(field)
            if (conds == "contains") {
                stmt += `u.${key} CONTAINS '${field[conds]}'`
            }
        } else {
            stmt += ` ${key} = $${key}`
            nodeargs[`${key}`] = where[key]
        }
    }

    const set = args["data"]
    stmt += ` SET `; i = 0
    for (var key in set) {
        if (i++ != 0) stmt += ', '

        stmt += `u.${key} = '${set[key]}'`
    }

    return {query: stmt, args: nodeargs}
}

export const DeleteNodeQuery = (modelName: String | undefined, args:any): Cypher => {
    const argsBody = JSON.parse(args)
    let nodeargs:any
    let stmt:string = `MATCH (n:${modelName}) WHERE`
    const where = argsBody["where"]
    var i = 0
    for (var key in where) {
        if (i++ != 0) stmt += ' AND '

        const field = where[key]

        if (typeof(field) == "object") {
            const conds = getConds(field)
            if (conds == "contains") {
                stmt += `u.${key} CONTAINS '${field[conds]}'`
            }
        } else {
            stmt += ` ${key} = $${key}`
            nodeargs[`${key}`] = where[key]
        }
    }
    stmt += `}) DETACH DELETE n;`

    return {query: stmt, args: nodeargs}
}

export const DeleteMultipleNodesQuery = (modelName: String | undefined, args:any): Cypher => {
    if (modelName == undefined) return {query: "", args: undefined}

    if (args == undefined) return {query: `MATCH (u:${modelName}) MATCH (u)-[:PARENT_OF]->(p) DETACH DELETE u, p`, args: {}}

    let nodeargs:any
    let stmt:string = `MATCH (n:${modelName}) WHERE`
    stmt += `MATCH (n)-[:PARENT_OF]->(p)`

    const where = args["where"]
    var i = 0
    for (var key in where) {
        if (i++ != 0) stmt += ' AND '

        const field = where[key]

        if (typeof(field) == "object") {
            const conds = getConds(field)
            if (conds == "contains") {
                stmt += `u.${key} CONTAINS '${field[conds]}'`
            }
        } else {
            stmt += ` ${key} = $${key}`
            nodeargs[`${key}`] = where[key]
        }
    }

    stmt += ` DETACH DELETE n, p`

    return {query: stmt, args: nodeargs}
}

export const FindNodeQuery = (modelName: String | undefined, args:any, limit: boolean): Cypher => {
    const argsBody = JSON.parse(args)
    let nodeargs:any
    let stmt:string = `MATCH (n:${modelName}) WHERE`
    const where = argsBody["where"]
    var i = 0

    for (var key in where) {
        if (i++ != 0) stmt += ' AND '

        const field = where[key]

        if (typeof(field) == "object") {
            const conds = getConds(field)
            if (conds == "contains") {
                stmt += `u.${key} CONTAINS '${field[conds]}'`
            }
        } else {
            stmt += ` ${key} = $${key}`
            nodeargs[`${key}`] = where[key]
        }
    }

    stmt += `}) RETURN n`

    if (limit) stmt += ` LIMIT 1`

    return {query: stmt, args: nodeargs}
}
