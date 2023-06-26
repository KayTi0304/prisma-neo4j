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

export const getConds = (args: any): string => {
    const keys = Object.keys(args)
    return keys[0] as string
}

export const parseJson = (args: any): any => {
    const argsBody = JSON.stringify(args)
    const argsJson = JSON.parse(argsBody)
    return argsJson
}
