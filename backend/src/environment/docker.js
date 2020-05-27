module.exports = {
  typeorm: {
    type: 'mongodb',
    url: process.env.MONGO_URL,
    useNewUrlParser: true,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
  },
  logger: {
    level: 'trace',
  },
  port: process.env.PORT || 3000,
};
