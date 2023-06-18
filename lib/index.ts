import { Cypher, DriverConfig } from "./config/neo4j";
import { MiddlewareParams } from "./config/prisma";
import { CreateNodeQuery, DeleteNodeQuery, FindNodeQuery, RunCypherTransactionRead, RunCypherTransactionWrite, UpdateNodeQuery } from "./helpers/crud-methods";
import { parseAction } from "./helpers/parse";

export function createNeo4jMiddleware({
    driver
  }: {
    driver: DriverConfig;
  }) {
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
        
        //execute statement 
        let result: any
        if (action === "findOne") {
            result = RunCypherTransactionRead(query, driver)
        } else {
            result = RunCypherTransactionWrite(query, driver)
        }
        
        return result
    }
  }