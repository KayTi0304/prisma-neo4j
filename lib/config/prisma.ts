export type Action =
  | "findUnique"
  | "findFirst"
  | "findMany"
  | "create"
  | "createMany"
  | "count"
  | "update"
  | "updateMany"
  | "upsert"
  | "delete"
  | "deleteMany"
  | "executeRaw"
  | "queryRaw"
  | "runCommandRaw"
  | "findRaw" 
  | "aggregate";

/**
 * These options are being passed in to the middleware as "params"
 */
export type MiddlewareParams = {
    model?: string | any;
    action: Action;
    args: any;
    dataPath: string[];
    runInTransaction: boolean;
};

export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => Promise<T>
  ) => Promise<T>;