const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/test', (req, res) => {
  res.send('Hello from the test page!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});