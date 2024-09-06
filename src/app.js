const express = require('express');
const bodyParser = require('body-parser');
const routes = require('../src/routes/route');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  return res.status(200).json({ message: `Health check is successfull` });
});

app.use('/api/v1', routes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
