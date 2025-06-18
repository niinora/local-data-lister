const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());

app.get('/api/items', (req, res) => {
  const data = JSON.parse(fs.readFileSync('data.json'));
  res.json(data);
});

app.listen(5000, () => console.log('Server on port 5000'));