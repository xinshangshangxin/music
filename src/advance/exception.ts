console.info('loading exception');

process.on('uncaughtException', err => {
  console.error('uncaughtException:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason);
  process.exit(1);
});
