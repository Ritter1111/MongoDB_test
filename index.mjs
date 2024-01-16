import Fastify from "fastify";
import * as mongodb from "@fastify/mongodb";

const fastify = Fastify({
  logger: true,
});

fastify.register(mongodb, {
  forceClose: true,
  url: process.env.MONGODB_URL,
});

fastify.get("/", async (request, reply) => {
  return { hello: "world" };
});

fastify.get("/items", async function handler(request, reply) {
  const itemsCollection = this.mongo.db.collection("items");
  const limit = Number(request.query.limit) ?? 10;

  const orderBy = request.query.orderBy;
  const orderDirection = request.query.orderDirection;

  const sort = {};
  if (orderBy && orderDirection) {
    sort[orderBy] = +orderDirection;
  }

  const item = await itemsCollection.find({}, { limit, sort }).toArray();

  return item;
});

fastify.get("/items/:id", async function handler(request, reply) {
  const itemsCollection = this.mongo.db.collection("items");

  const _id = new this.mongo.ObjectId(request.params.id);
  const item = await itemsCollection.findOne({ _id });

  return item;
});

fastify.delete("/items/:id", async function handler(request, reply) {
  const itemsCollection = this.mongo.db.collection("items");

  const _id = new this.mongo.ObjectId(request.params.id);
  const item = await itemsCollection.deleteOne({ _id });

  return item;
});

fastify.patch("/items/:id", async function handler(request, reply) {
  const itemsCollection = this.mongo.db.collection("items");

  const _id = new this.mongo.ObjectId(request.params.id);
  const item = await itemsCollection.updateOne(
    { _id },
    { $set: { ...request.body } }
  );

  return item;
});

fastify.post("/items", async function handler(request, reply) {
  const itemsCollection = this.mongo.db.collection("items");

  const item = await itemsCollection.insertOne({
    title: request.body.title,
    body: request.body.body,
  });

  reply.send(item.insertedId);
});

try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
