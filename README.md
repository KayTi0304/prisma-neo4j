# prisma-neo4j library

## About
This is a library to connect Neo4j to Prisma. Prisma currently does not support Neo4j connectors, hence here is an alternative library that you can use as a middleware. 

## Functionality
This library supports all basic CRUD operations. The filters are not fully supported yet. It will be added soon. 

## How to use it
Since Prisma Client 4.16.1, Middlewares have been depreciated and replaced by the extend operation. However, this library supports both ways. 

The middleware version:
```
DriverInit(url, username, password, database).then(cfg => {
    prisma.$use(CreateNeo4jMiddleware())
}).then(() => main()
.then(async () => {
  await DriverDisconnect()
  await prisma.$disconnect()
})
.catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
}))
```

The prisma client extension version:
```
await DriverInit(url, username, password, database).then(async () => {
    const xprisma = prisma.$extends({
      query: {
        async $allOperations({operation, model, args, query}) {
          await Neo4jOperations(model as string, operation, args, dC).then(res => {
            const people = res.records.map((row: { get: (arg0: string) => any }) => row.get('n'))
            console.log(people)
          })
          const result = await query(args)
          console.log("result: ", result)
        }
      }
    })
```
