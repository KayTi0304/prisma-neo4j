export type Action =
  | "findUnique"
  | "findMany"
  | "create"
  | "update"
  | "updateMany"
  | "upsert"
  | "delete"
  | "deleteMany"
  | "executeRaw"
  | "queryRaw"
  | "aggregate";

/**
 * These options are being passed in to the middleware as "params"
 */
export type MiddlewareParams = {
    model?: string;
    action: Action;
    args: any;
    dataPath: string[];
    runInTransaction: boolean;
  };