import test from 'ava';

import { access } from 'fs';
import { resolve as pathResolve } from 'path';
import rimraf from 'rimraf';
import { Nmdb, Schema } from '../dist/index';

const nedbSaveDir = pathResolve(__dirname, '../.tmp');

let index = 0;
function getModel() {
  let nmdb = new Nmdb();
  nmdb.connect(`nedb://${nedbSaveDir}`);
  // nmdb.connect('nedb://memory');

  const TestSchema = new Schema('TestSchema', {
    name: { type: 'string', required: true },
    age: { type: 'number' },
  });

  index += 1;
  const TestModel = nmdb.model(`test-${index}`, TestSchema);
  return TestModel;
}

async function removeNedbDir() {
  return new Promise((resolve, reject) => {
    access(nedbSaveDir, (err) => {
      if (err) {
        return resolve();
      }

      return rimraf(nedbSaveDir, (e) => {
        if (e) {
          return reject(e);
        }

        return resolve();
      });
    });
  });
}

test.before(async (t) => {
  await removeNedbDir();
  t.pass();
});

test.after(async (t) => {
  await removeNedbDir();
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
    t.is(e.errorType, 'uniqueViolated');
    t.is(e.key, 'name');
  }

  await Model.dropIndex('name');
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

  await Model.updateOne(
    { name: 'name' },
    {
      $set: { age: -1 },
    }
  );
  let nu = await Model.countDocuments({ name: 'name', age: -1 });

  t.is(nu, 1);

  await Model.updateMany(
    { name: 'name' },
    {
      $set: { age: -1 },
    }
  );

  nu = await Model.countDocuments({ name: 'name', age: -1 });
  t.is(nu, 3);
});
