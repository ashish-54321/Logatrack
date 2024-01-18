const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello, World!');
  console.log("its working..");
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
