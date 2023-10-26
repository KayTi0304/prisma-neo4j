export type DriverConfig = {
    url?: string
    username?: string
    password?: string
    database?: string
    driver?: any | undefined
}

export type CypherUpdate = {
    match: string
    set: string
    args: any
}

export type Cypher = {
    query: string
    args: any
}

export type ObjectAndRelationshipCyperUpdate = {
    cypher: CypherUpdate[]
    relationship: string[] 
}

export type ObjectAndRelationshipCyper = {
    cypher: Cypher[]
    relationship: string[] 
}

export var dC:DriverConfig = {};
