import test from 'ava';
// eslint-disable-next-line
import * as mongodb from 'mongodb';
import muri from 'muri';
// eslint-disable-next-line
import { MongoClientOptions } from 'mongodb';
import { Nmdb, Schema } from '../dist/index';

function getMongoUrl() {
  let url = 'mongodb://';
  if (process.env.MONGO_PORT_27017_TCP_ADDR) {
    url += process.env.MONGO_PORT_27017_TCP_ADDR;
  } else {
    url += '127.0.0.1';
  }

  url += ':';
  if (process.env.MONGO_PORT_27017_TCP_PORT) {
    url += process.env.MONGO_PORT_27017_TCP_PORT;
  } else {
    url += '27017';
  }

  url += '/nmdb-test';

  return url;
}

const mongoUrl = getMongoUrl();

let index = 0;
function getModel() {
  let nmdb = new Nmdb();
  nmdb.connect(mongoUrl);

  const TestSchema = new Schema('TestSchema', {
    name: { type: 'string', required: true },
    age: { type: 'number' },
  });

  index += 1;
  const TestModel = nmdb.model(`test-${index}`, TestSchema);
  return TestModel;
}

async function dropDatabase() {
  let client = await mongodb.MongoClient.connect(
    mongoUrl,
    { useNewUrlParser: true } as MongoClientOptions
  );

  await client.db(muri(mongoUrl).db).dropDatabase();

  client.close();
}

test.before(async (t) => {
  await dropDatabase();
  t.pass();
});

test.after(async (t) => {
  await dropDatabase();
  t.pass();
});

test('create Index && drop Index', async (t) => {
  const Model = getModel();

  try {
    await Model.createIndex('name', { unique: true });
    await Model.insertOne({ name: 'name' });
    await Model.insertOne({ name: 'name' });

    t.fail();
  } catch (e) {
    t.regex(e.message, /E11000 duplicate/);
  }

  await Model.dropIndex('name_1');
  await Model.insertOne({ name: 'name' });
});

test('field required', async (t) => {
  const Model = getModel();

  try {
    await Model.insertOne({});
    t.fail();
  } catch (e) {
    t.is(e.validator, 'required');
    t.is(e.path, '$.name');
  }
});

test('insertOne && insertMany', async (t) => {
  const Model = getModel();

  await Model.insertOne({ name: 'name' });

  let nu = await Model.countDocuments({ name: 'name' });
  t.is(nu, 1);

  await Model.insertMany([{ name: 'name' }, { name: 'name' }]);

  nu = await Model.countDocuments({ name: 'name' });
  t.is(nu, 3);
});

test('delete && countDocuments', async (t) => {
  const Model = getModel();

  await Model.insertOne({ name: 'name' });

  let nu = await Model.countDocuments({ name: 'name' });
  t.is(nu, 1);

  await Model.insertOne({ name: 'name' });

  nu = await Model.countDocuments({ name: 'name' });
  t.is(nu, 2);

  await Model.deleteOne({ name: 'name' });
  nu = await Model.countDocuments({ name: 'name' });
  t.is(nu, 1);

  await Model.insertOne({ name: 'name' });
  await Model.deleteMany({ name: 'name' });
  nu = await Model.countDocuments({ name: 'name' });
});

test('find && findOne', async (t) => {
  const Model = getModel();

  await Model.insertMany([
    { name: 'name', age: 1 },
    { name: 'name', age: 2 },
    { name: 'name', age: 3 },
    { name: 'name4', age: 4 },
  ]);

  let users = await Model.find({ name: 'name' });
  t.is(users.length, 3);

  users = await Model.find(
    { name: 'name' },
    {
      sort: {
        age: -1,
      },
    }
  );

  t.is(users.length, 3);
  t.is(users[0].age, 3);
  t.is(users[1].age, 2);

  users = await Model.find(
    { name: 'name' },
    {
      sort: {
        age: -1,
      },
      skip: 1,
      limit: 1,
    }
  );

  t.is(users.length, 1);
  t.is(users[0].age, 2);
});

test('updateOne && updateMany', async (t) => {
  const Model = getModel();

  await Model.insertMany([
    { name: 'name', age: 1 },
    { name: 'name', age: 2 },
    { name: 'name', age: 3 },
  ]);

  let result = await Model.updateOne(
    { name: 'name' },
    {
      $set: { age: -1 },
    }
  );

  t.is(result.ok, 1);
  t.is(result.nModified, 1);
  t.is(result.n, 1);

  let nu = await Model.countDocuments({ name: 'name', age: -1 });

  t.is(nu, 1);

  result = await Model.updateMany(
    { name: 'name' },
    {
      $set: { age: -1 },
    }
  );

  t.is(result.ok, 1);
  t.is(result.nModified, 2);
  t.is(result.n, 3);

  nu = await Model.countDocuments({ name: 'name', age: -1 });
  t.is(nu, 3);
});
