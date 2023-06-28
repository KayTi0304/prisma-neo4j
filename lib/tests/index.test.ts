import { DriverDisconnect, DriverInit, dC } from "../config/neo4j";
import {Neo4jOperations} from "../index";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const url = "<neo4j-url-here>"
const username = "<username>"
const password = "<password>"
const database = "<database-name>"

describe('sanity check', async () => {
    it('connecting to driver', async () => {
        await DriverInit(url, username, password, database)
        const testDriver = dC.driver
        expect(testDriver).toBe(Object)
    }); 

    await DriverDisconnect()
  });

describe('basic operation', async () => {
    await DriverInit(url, username, password, database)
    const xprisma = prisma.$extends({
        query: {
          async $allOperations({operation, model, args, query}) {
            await Neo4jOperations(model as string, operation, args, dC).then(res => {
                const people = res.records.map((row: { get: (arg0: string) => any }) => row.get('n'))
                if (operation == "readUnique") return people 
                else return query(args)
              })
          }
        }
      })

    it('basic create', async () => {
        const user = await xprisma.user.create({
            data: { email: 'alice@prisma.io' },
          })
        expect(user).toBe(Object)
    }); 

    it('basic update', async () => {
        const user = await xprisma.user.create({
            where: {id: 1},
            data: { email: 'alice@prisma.io' },
          })
        expect(user).toBe(Object)
    });

    it('basic read (readUnique)', async () => {
        const result = await xprisma.user.findUnique({
            where: { id: 42 },
          })
        expect(result).toBe(Object)
    });

    it('basic delete', async () => {
        const user = await xprisma.user.delete({
            where: { id: 1 },
          })
        expect(user).toBe(Object)
    });

    await DriverDisconnect()
  });

describe('nested operation', async () => {
    await DriverInit(url, username, password, database)
    const xprisma = prisma.$extends({
        query: {
          async $allOperations({operation, model, args, query}) {
            await Neo4jOperations(model as string, operation, args, dC).then(res => {
                const people = res.records.map((row: { get: (arg0: string) => any }) => row.get('n'))
                if (operation == "readUnique") return people 
                else return query(args)
              })
          }
        }
      })

    it('nested create', async () => {
        const user = await prisma.user.create({
            data: {
              email: 'alice@prisma.io',
              profile: {
                create: { bio: 'Hello World' },
              },
            },
          })
        expect(user).toBe(Object)
    }); 

    it('nested multiple create', async () => {
        const userAndPosts = await prisma.user.create({
            data: {
              posts: {
                create: [
                  { title: 'Prisma Day 2020' }, // Populates authorId with user's id
                  { title: 'How to write a Prisma schema' }, // Populates authorId with user's id
                ],
              },
            },
          })
        expect(userAndPosts).toBe(Object)
    });

    it('nested update create', async () => {
        const user = await prisma.user.update({
            where: { email: 'alice@prisma.io' },
            data: {
                name: "kay",
                profile: {
                create: { bio: 'Hello World' },
              },
            },
          })
        expect(user).toBe(Object)
    });

    it('nested update update', async () => {
        const user = await prisma.user.update({
            where: { id: 1 },
            data: {
              email: 'alice@prisma.io',
              profile: {
                    update: { title: 'My updated title' },
              },
            },
          })
        expect(user).toBe(Object)
    });

    it('nested multiple update update', async () => {
        const user = await prisma.user.update({
            where: { email: 'alice@prisma.io' },
            data: {
              posts: {
                update: [
                  {
                    data: { published: true },
                    where: { id: 32 },
                  },
                  {
                    data: { published: true },
                    where: { id: 23 },
                  },
                ],
              },
            },
          })
        expect(user).toBe(Object)
    });

    it('nested multiple create update', async () => {
        const user = await prisma.user.update({
            where: {id: 1},
            data: {
              email: 'alice@prisma.io',
              posts: {
                create: [
                  {title: 'Hello world'},
                  {title: 'Another one'},
                ],
              },
            },
          })
        expect(user).toBe(Object)
    });
  });

  describe('advanced operation', async () => {
    it('createMany', async () => {
        const createMany = await prisma.user.createMany({
            data: [
              { name: 'Bob', email: 'bob@prisma.io' },
              { name: 'Alice', email: 'alice@prisma.io' }, // Duplicate unique key!
              { name: 'Yewande', email: 'yewande@prisma.io' },
              { name: 'Angelique', email: 'angelique@prisma.io' },
            ],
          })
          expect(createMany).toBe(Object)
    }); 

    it('updateMany', async () => {
        const updateUsers = await prisma.user.updateMany({
            where: {
              email: { contains: 'prisma.io' },
            },
            data: { role: 'ADMIN' },
          })
        expect(updateUsers).toBe(Object)
    });

    it('readMany', async () => {
        const users = await prisma.user.findMany({
            where: {
              email: { endsWith: 'prisma.io' },
            },
          })
        expect(users).toBe(Object)
    });

    it('readFirst', async () => {
        const user = await prisma.user.findFirst({
            where: {
              email: {
                endsWith: 'prisma.io',
              },
            },
          })
        expect(user).toBe(Object)
    });

    it('deleteMany', async () => {
        const deleteMany = await prisma.user.deleteMany({
            where: {
              email: {
                contains: 'prisma.io',
              },
            },
          })
        expect(deleteMany).toBe(Object)
    });
  });