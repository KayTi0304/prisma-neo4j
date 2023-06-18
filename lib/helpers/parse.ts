import { Action } from "../config/prisma";

export const parseAction = (action: Action): String => {
    return action as String
}