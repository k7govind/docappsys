import express from 'express';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Simple test working!' });
});

app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint working!' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Simple test server running on port ${PORT}`);
});