import app from './src/app.js';

try {
  const teardown = await app();
  process.on('SIGINT', () => {
    teardown()
      .then(() => {
        process.exit(0);
      })
      .catch((err) => {
        console.error(err);
        process.exit(-1);
      });
  });
} catch (error) {
  console.error(error);
  process.exit(-1);
}
