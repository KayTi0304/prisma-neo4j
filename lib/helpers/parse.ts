import { Action } from "../config/prisma";

export const parseAction = (action: Action): String => {
    return action as String
}

export const parseJson = (args: any): any => {
    const argsBody = JSON.stringify(args)
    const argsJson = JSON.parse(argsBody)
    return argsJson
}