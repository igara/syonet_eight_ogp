import app from './src/app';

app.listen(process.env.PORT, () => {
  console.info(`Server Started PORT: ${process.env.PORT}`);
});
