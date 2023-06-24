import { Cypher, RunCypherTransactionRead, RunCypherTransactionWrite, dC } from "./config/neo4j";
import { MiddlewareParams } from "./config/prisma";
import { CreateNodeQuery, DeleteNodeQuery, FindNodeQuery, UpdateNodeQuery } from "./helpers/crud-methods";
import { parseAction } from "./helpers/parse";

export function CreateNeo4jMiddleware() {
    return async function prismaCacheMiddleware(
      params: MiddlewareParams,
      next: (params: MiddlewareParams) => Promise<any>
    ) {
        const action = parseAction(params.action)
        // build query cypher
        var query:Cypher = {
            query: '',
            args: {}
        }
        switch (action) {
            case "create":
                query = CreateNodeQuery(params.model, params.args)
                break
            case "update":
                query = UpdateNodeQuery(params.model, params.args)
                break
            case "delete":
                query = DeleteNodeQuery(params.model, params.args)
                break
            case "findOne":
                query = FindNodeQuery(params.model, params.args)
                break
            default:
                console.log("no method specified")
                break;
        }

        console.log("query: \n", query.query)
        console.log("args: \n", query.args)

        //execute statement 
        /*let result: any
        if (action === "findOne") {
            result = RunCypherTransactionRead(query, dC)
            await next(params)
        } else {
            result = RunCypherTransactionWrite(query, dC)
            result = await next(params)
        }*/
        
        const result = await next(params)
        return result
    }
  }