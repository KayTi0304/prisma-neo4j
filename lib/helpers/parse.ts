import { Cypher, CypherUpdate, ObjectAndRelationshipCyper, ObjectAndRelationshipCyperUpdate } from "../config/neo4j";
import {getModelNameSingular, getAction, getModelName} from "./helper";

export const parseObjectsAndRelationshipsUpdate = (obj: ObjectAndRelationshipCyperUpdate): Cypher => {
    let cypher:Cypher = {query: "", args: {}}, i:number = 0
    for (var c of obj.cypher) {
        if (i++ != 0) cypher.query += " "
        cypher.query += c.match
        cypher.args = Object.assign(cypher.args, c.args)
    }
    for (var c of obj.cypher) {
        if (i++ != 0) cypher.query += " "
        cypher.query += c.set
    }
    for (var r of obj.relationship) {
        cypher.query += r
    }
    return cypher
}

export const parseObjectsAndRelationships = (obj: ObjectAndRelationshipCyper): Cypher => {
    let cypher:Cypher = {query: "", args: {}}, i:number = 0
    for (var c of obj.cypher) {
        if (i++ != 0) cypher.query += " "
        cypher.query += c.query
        cypher.args = Object.assign(cypher.args, c.args)
    }
    for (var r of obj.relationship) {
        cypher.query += r
    }
    return cypher
}

export const parseMatchObjAndArgs = (modelName: String, num: Number, params: any): Cypher => {
    let childCypher:Cypher = {
        query: "",
        args: {}
    }
    childCypher.query = `MATCH (${modelName.toLocaleLowerCase()}_${num}:${modelName} `
    var i = 0
    for (var key of Object.keys(params)) {
        if (i == 0) childCypher.query += `{${key}: ${key}${modelName}${num}`
        else childCypher.query += `, ${key}: ${key}${modelName}${num}}`
        childCypher.args[`${key}${modelName}${num}`] = params[key]
    }
    childCypher.query += '}) '
    return childCypher
}

// create all objects first then relationships
// only supports create JSON objects now; not connect
export const iterateObjectCreation = (modelName: String, num: number, params: any): ObjectAndRelationshipCyper => {
    let cypher:Cypher = {
        query: `CREATE (${modelName.toLocaleLowerCase()}_${num}:${modelName} `,
        args: {}
    }
    let oarC:ObjectAndRelationshipCyper = {
         cypher: [],
         relationship: []
    }
    var j = 0;
    for(var key in params) {
        const val = params[key]
        
        if (typeof(val) == "object") {
            if (Array.isArray(val["create"])) {
                // val["create"] is a children
                const children = val["create"]; var i = 0
                const keySingular = getModelName(key)
                for (let index = 0; index < children.length; index++) {
                    const child = children[index];
                    const childCypher = iterateObjectCreation(keySingular, i++, child)
                    oarC.cypher = oarC.cypher.concat(childCypher.cypher)
                    oarC.relationship = oarC.relationship.concat(childCypher.relationship) 

                    oarC.relationship.push(` CREATE (${modelName.toLocaleLowerCase()}_${num})-[:PARENT_OF]->(${keySingular.toLocaleLowerCase()}_${i-1}) `)
                }

            } else {
                // val["create"] is a single child
                const keySingular = getModelNameSingular(key)
                const childCypher = iterateObjectCreation(keySingular, 0, val["create"])
                oarC.cypher = oarC.cypher.concat(childCypher.cypher)
                oarC.relationship = oarC.relationship.concat(childCypher.relationship) 

                oarC.relationship.push(` CREATE (${modelName.toLocaleLowerCase()}_${num})-[:PARENT_OF]->(${key.toLocaleLowerCase()}_0) `)
            }
        
        } else {
            // deal with scalar objects
            const newKey = `${key}${modelName.toLocaleLowerCase()}${num}`
            if (j++ == 0) cypher.query += `{${key}: $${newKey}` 
            else cypher.query += `, ${key}: $${newKey}` 
            cypher.args[newKey] = val
        }
   }
    cypher.query += '})'

    oarC.cypher.unshift(cypher)
    return oarC
 }

 export const iterateObjectUpdate = (modelName: String, num: number, params: any, parentModelName: String | undefined): ObjectAndRelationshipCyperUpdate => {
    let cypher:CypherUpdate
    if (parentModelName == undefined) {
        cypher = {
            match: `MATCH (${modelName.toLocaleLowerCase()}_${num}:${modelName}`,
            set: ``,
            args: {}
        }
    } else {
        cypher = {
            match: `MATCH (${parentModelName})-[:PARENT_OF]->(${modelName.toLocaleLowerCase()}_${num}:${modelName}`,
            set: ``,
            args: {}
        }
    }

    let oarC:ObjectAndRelationshipCyperUpdate = {
         cypher: [],
         relationship: []
    }

    const where = params["where"]
    var j = 0;
    for (var key in where) {
        if (j++ == 0) cypher.match += ` {${key}: $${key}${modelName.toLocaleLowerCase()}${num}`
        else cypher.match += `, ${key} = $${key}${modelName.toLocaleLowerCase()}${num}`
        cypher.args[`${key}${modelName.toLocaleLowerCase()}${num}`] = where[key]
    }
    if (where != undefined) cypher.match += "}) "
    else cypher.match += ") "

    let data:any
    if (params["data"] != undefined) {
        data = params["data"]
    } else {
        data = params
    }
    j = 0;
    for (var key in data) {
        const val = data[key]

        if (typeof(val) == "object") {
            const action = getAction(val)

            switch (action) {
                case "create": 
                    if (Array.isArray(val["create"])) {
                        const children = val["create"]; var i = 0
                        const keySingular = getModelName(key)
                        for (let index = 0; index < children.length; index++) {
                            const child = children[index];
                            const childObj = iterateObjectCreation(keySingular, i++, child)
                            var childObjCypherUpdate:CypherUpdate[] = []
                            for (var c of childObj.cypher) {
                                childObjCypherUpdate.push({match: c.query, set: "", args: c.args})
                            }
                            const childObjUpdate:ObjectAndRelationshipCyperUpdate = {
                                cypher: childObjCypherUpdate,
                                relationship: childObj.relationship
                            }
                            oarC.cypher = oarC.cypher.concat(childObjUpdate.cypher)
                            oarC.relationship = oarC.relationship.concat(childObj.relationship) 

                            oarC.relationship.push(` CREATE (${modelName.toLocaleLowerCase()}_${num})-[:PARENT_OF]->(${keySingular.toLocaleLowerCase()}_${i-1}) `)
                        }
                    } else {
                        const keySingular = getModelNameSingular(key)
                        const childObj = iterateObjectCreation(keySingular, 0, val["create"])
                            var childObjCypherUpdate:CypherUpdate[] = []
                            for (var c of childObj.cypher) {
                                childObjCypherUpdate.push({match: c.query, set: "", args: c.args})
                            }
                            const childObjUpdate:ObjectAndRelationshipCyperUpdate = {
                                cypher: childObjCypherUpdate,
                                relationship: childObj.relationship
                            }
                        oarC.cypher = oarC.cypher.concat(childObjUpdate.cypher)
                        oarC.relationship = oarC.relationship.concat(childObj.relationship) 
                        oarC.relationship.push(` CREATE (${modelName.toLocaleLowerCase()}_${num})-[:PARENT_OF]->(${keySingular.toLocaleLowerCase()}_0) `)
                    }
                break

                case "update":
                    if (Array.isArray(val["update"])) {
                        const children = val["update"]; var i = 0
                        const keySingular = getModelName(key)
                        for (let index = 0; index < children.length; index++) {
                            const child = children[index];
                            const childObj = iterateObjectUpdate(keySingular, i++, child, `${modelName.toLocaleLowerCase()}_${num}`)
                            oarC.cypher = oarC.cypher.concat(childObj.cypher)
                            oarC.relationship = oarC.relationship.concat(childObj.relationship) 
                        }
                    } else {
                        const keySingular = getModelNameSingular(key)
                        const childObj = iterateObjectUpdate(keySingular, 0, val["update"], `${modelName.toLocaleLowerCase()}_${num}`)
                        oarC.cypher = oarC.cypher.concat(childObj.cypher)
                        console.log("oarc: ", oarC)
                        oarC.relationship = oarC.relationship.concat(childObj.relationship) 
                    }
                break

                case "connect":
                    if (Array.isArray(val["connect"])) {
                        const children = val["connect"]; var i = 0
                        const keySingular = getModelName(key)
                        for (let index = 0; index < children.length; index++) {
                            const child = children[index];
                            const childCypher = parseMatchObjAndArgs(keySingular, i, child)
                            const relQuery = ` CREATE (${modelName}_${j})-[:PARENT_OF]->(${key.toLocaleLowerCase()}_${i})`
                            var childObjUpdate:CypherUpdate = {
                                match: "",
                                set: childCypher.query,
                                args: childCypher.args
                            }
                            oarC.cypher.push(childObjUpdate)
                            oarC.relationship.push(relQuery)
                            i++
                        }
                    } else {
                        const keySingular = getModelName(key)
                        const childCypher = parseMatchObjAndArgs(keySingular, 0, val["connect"])
                        const relQuery = ` CREATE (${modelName}_${j})-[:PARENT_OF]->(${keySingular.toLocaleLowerCase()}_${0})`
                        var childObjUpdate:CypherUpdate = {
                            match: "",
                            set: childCypher.query,
                            args: childCypher.args
                        }
                        oarC.cypher.push(childObjUpdate)
                        oarC.relationship.push(relQuery)
                    }
                break
            }
        } else {
            // deal with scalar objects
            const newKey = `${key}${modelName.toLocaleLowerCase()}${num}`
            if (j++ == 0) cypher.set += `SET ${modelName.toLocaleLowerCase()}_${num}.${key} = $${newKey} `
            else cypher.set += `, ${modelName.toLocaleLowerCase()}_${num}.${key} = $${newKey} `
            cypher.args[newKey] = data[key]
        }
    }
    oarC.cypher.unshift(cypher)

    return oarC
 }
