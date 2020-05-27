logger.debug('loading exception');

process.on('uncaughtException', err => {
  logger.error(err, 'uncaughtException:');
  process.exit(1);
});

process.on('unhandledRejection', (err, p) => {
  if (err) {
    logger.error(err, 'unhandledRejection at: ');
  }
  logger.error(p);
  process.exit(1);
});
