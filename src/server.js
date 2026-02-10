// server.js
const express = require('express');
const path = require('path');
const app = express();

// Serve static UI from /src
app.use(express.static(path.join(__dirname, 'src')));

// Default route -> src/index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// optional health
app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5173;
app.listen(PORT, () => console.log(`UI on http://localhost:${PORT}`));
