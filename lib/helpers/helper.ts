import { Cypher } from "../config/neo4j";
import { Action } from "../config/prisma";

export const getAction = (object: any): String => {
    const keys = Object.keys(object)
    return keys[0] as String 
}

export const getModelName = (str: String): String => {
    var firstCapital = str.substring(0, 1).toUpperCase()
    var rest = str.substring(1, str.length-1)
    return firstCapital + rest
}

export const getModelNameSingular = (str: String): String => {
    var firstCapital = str.substring(0, 1).toUpperCase()
    var rest = str.substring(1, str.length)
    return firstCapital + rest
}

export const parseAction = (action: Action): String => {
    return action as String
}

export const getKey = (args: any): string => {
    const keys = Object.keys(args)
    return keys[0] as string
}

export const parseJson = (args: any): any => {
    const argsBody = JSON.stringify(args)
    const argsJson = JSON.parse(argsBody)
    return argsJson
}

export const getCondsQuery = (condition: string, key: string, val: any): string => {
    switch (condition) {
        case 'lt':
            return `n.${key} < ${val}`
        case 'gt':
            return `n.${key} > ${val}`
        case 'lte':
            return `n.${key} <= ${val}`
        case 'gte':
            return `n.${key} >= ${val}`
        case 'contains':
            return `n.${key} CONTAINS '${val}'`
        case 'startsWith':
            return `n.${key} STARTS WITH '${val}'`
        case 'endsWith':
            return `n.${key} ENDS WITH '${val}'`
        case 'equals':
            return `n.${key} EQUALS '${val}'`
        case 'not':
            return `NOT n.${key} = '${val}'`
        case 'in':
            var stmt = `n.${key} IN [`
            var i = 0
            for (var v in val) {
                if (i++ == 0) stmt += `'${v}'`
                else stmt += `, '${v}'`
            }
            stmt += ']'
        case 'notIn':
            var stmt = `NOT n.${key} IN [`
            var i = 0
            for (var v in val) {
                if (i++ == 0) stmt += `'${v}'`
                else stmt += `, '${v}'`
            }
            stmt += ']'
        default:
            return ``
    }
}

export const getFilterQuery = (key: any, keystr: string): Cypher => {
    var stmt = ""; var args:any
    if (typeof(key) == "object") {
        const conds = getKey(key)
        const qry = getCondsQuery(conds, key, key[conds])
        stmt += ` OR ` + qry
    } else {
        stmt += ` ${keystr} = $${keystr}`
        args[keystr] = key
    }
    return {query: stmt, args: args}
}
