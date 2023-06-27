import { Cypher, ObjectAndRelationshipCyper } from "../config/neo4j"
import { getCondsQuery, getFilterQuery, getKey } from "./helper"
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
    let stmt:string = `MATCH (n:${modelName}) WHERE `
    const where = args["where"]
    var i = 0
    for (var key in where) {
        if (key == "OR") {
            const field = where[key]
            for (var entry of field) {
                stmt += ` OR `
                const keyCond = getKey(entry) //email
                const valCond = where[key] // {endsWith: 'hotmail.com'}
                const keyvalCypher = getFilterQuery(valCond, keyCond)
                stmt += keyvalCypher.query
                args = Object.assign(args, keyvalCypher.args)
            }

        } else if (key == "NOT") {
            if (i++ != 0) stmt += ' AND '
            stmt += ` NOT `
            const keyCond = getKey(where[key]) //email
            const valCond = where[key] // {endsWith: 'hotmail.com'}
            const keyvalCypher = getFilterQuery(valCond, keyCond)
            stmt += keyvalCypher.query
            args = Object.assign(args, keyvalCypher.args)

        } else {
            if (i++ != 0) stmt += ' AND '
            const field = where[key]
            const keyvalCypher = getFilterQuery(field, key)
            stmt += keyvalCypher.query
            args = Object.assign(args, keyvalCypher.args)
        }
    }

    const set = args["data"]
    stmt += ` SET `; i = 0
    for (var key in set) {
        if (i++ != 0) stmt += ', '

        stmt += `n.${key} = '${set[key]}'`
    }

    return {query: stmt, args: nodeargs}
}

export const DeleteNodeQuery = (modelName: String | undefined, args:any): Cypher => {
    const argsBody = JSON.parse(args)
    let nodeargs:any
    let stmt:string = `MATCH (n:${modelName}) WHERE `
    const where = argsBody["where"]
    var i = 0
    for (var key in where) {
        if (i++ != 0) stmt += ' AND '

        const field = where[key]

        if (typeof(field) == "object") {
            const conds = getKey(field)
            const qry = getCondsQuery(conds, key, field[conds])
            stmt += qry
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

    if (Object.keys(args).length == 0) return {query: `MATCH (n:${modelName}) MATCH (n)-[:PARENT_OF]->(p) DETACH DELETE n, p`, args: {}}

    let nodeargs:any
    let stmt:string = `MATCH (n:${modelName}) `
    stmt += `MATCH (n)-[:PARENT_OF]->(p) WHERE `

    const where = args["where"]
    var i = 0
    for (var key in where) {
        if (i++ != 0) stmt += ' AND '

        const field = where[key]

        if (typeof(field) == "object") {
            const conds = getKey(field)
            const qry = getCondsQuery(conds, key, field[conds])
            stmt += qry
        } else {
            stmt += ` ${key} = $${key}`
            nodeargs[`${key}`] = where[key]
        }
    }

    stmt += ` DETACH DELETE n, p`

    return {query: stmt, args: nodeargs}
}

export const FindNodeQuery = (modelName: String | undefined, args:any, limit: boolean): Cypher => {
    if (Object.keys(args).length == 0) return {query: `MATCH (n:${modelName}) RETURN n`, args: {}}
    
    let nodeargs:any
    let stmt:string = `MATCH (n:${modelName}) WHERE `
    const where = args["where"]
    var i = 0

    for (var key in where) {
        if (i++ != 0) stmt += ' AND '

        const field = where[key]

        if (typeof(field) == "object") {
            const conds = getKey(field)
            const qry = getCondsQuery(conds, key, field[conds])
            stmt += qry
        } else {
            stmt += ` ${key} = $${key}`
            nodeargs[`${key}`] = where[key]
        }
    }

    stmt += ` RETURN n`

    if (limit) stmt += ` LIMIT 1`

    return {query: stmt, args: nodeargs}
}
