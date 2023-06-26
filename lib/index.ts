import { Cypher, DriverConfig, RunCypherTransactionRead, RunCypherTransactionWrite, dC } from "./config/neo4j";
import { MiddlewareParams } from "./config/prisma";
import { CreateMultipleNodesQuery, CreateNodeQuery, DeleteMultipleNodesQuery, DeleteNodeQuery, FindNodeQuery, UpdateMultipleNodesQuery, UpdateNodeQuery } from "./helpers/crud-methods";
import { parseAction } from "./helpers/helper";

export function CreateNeo4jMiddleware() {
    return async function prismaCacheMiddleware(
      params: MiddlewareParams,
      next: (params: MiddlewareParams) => Promise<any>
    ) {
        const action = parseAction(params.action)
        // build query cypher
        Neo4jOperations(params.model, action, params.args, dC)

        const result = await next(params)
        return result
    }
}

export async function Neo4jOperations(model: string, operation: String, params: any, driver: any) {
    // build query cypher
    var query:Cypher = {query: '', args: {}}

    switch (operation) {
        case "create":
            query = CreateNodeQuery(model, params)
            break
        case "createMany":
            query = CreateMultipleNodesQuery(model, params)
            break
        case "update":
            query = UpdateNodeQuery(model, params)
            break
        case "updateMany":
            query = UpdateMultipleNodesQuery(model, params)
            break
        case "delete":
            query = DeleteNodeQuery(model, params)
            break
        case "deleteMany":
            query = DeleteMultipleNodesQuery(model, params)
            break
        case "findMany":
            query = FindNodeQuery(model, params, false)
            break
        case "findFirst":
            query = FindNodeQuery(model, params, true)
            break
        case "findUnique":
            query = FindNodeQuery(model, params, true)
            break
        default:
            console.log("no method specified")
            break;
    }

    console.log("query: \n", query.query)
    console.log("args: \n", query.args)

    //execute statement 
    let result: any
    if (operation === "findOne" || operation === "findFirst" || operation === "findMany") {
        result = await RunCypherTransactionRead(query, driver)
    } else {
        result = await RunCypherTransactionWrite(query, driver)
    }
    return result
    
}