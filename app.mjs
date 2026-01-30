import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile } from 'fs/promises';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(join(__dirname, 'public')));
app.use(express.json());

app.get('/inject', async (req, res) => {
  const myVar = 'injected from server';
  try {
    const html = await readFile(join(__dirname, 'public', 'index.html'), 'utf8');
    res.send(html.replace('{{myVar}}', myVar));
  } catch {
    res.status(500).send('Error loading page');
  }
});

app.get('/api/json', (req, res) => {
  res.json({ myVar: 'Hello from server!' });
});

app.get('/api/query', (req, res) => {
  res.json({ message: req.query.name });
});

app.get('/api/url/:id', (req, res) => {
  res.json({ message: `Hi, ${req.params.id}. How are you?` });
});

app.post('/api/body', (req, res) => {
  res.json({ message: req.body.name });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
