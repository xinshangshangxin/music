module.exports = {
  typeorm: {
    type: 'mongodb',
    host: 'localhost',
    port: 27017,
    database: 'noDbName',
    useNewUrlParser: true,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
  },
  logger: {
    level: 'trace',
  },
  port: process.env.PORT || 3000,
};
