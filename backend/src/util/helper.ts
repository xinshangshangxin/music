import { DeepPartial, Repository } from 'typeorm';

async function createOrUpdate<T>(
  registory: Repository<T>,
  where: object,
  entityLike: DeepPartial<T>,
): Promise<T> {
  let item = await registory.findOne({
    where,
  });

  if (item) {
    return registory.save({ ...item, ...entityLike });
  }

  item = registory.create(entityLike);
  return registory.save(item);
}

export { createOrUpdate };
