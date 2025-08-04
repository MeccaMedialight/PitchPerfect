const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test server is working!' });
});

app.get('/api/templates', (req, res) => {
  res.json([
    { id: 'test', name: 'Test Template', description: 'Test template' }
  ]);
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
}); 