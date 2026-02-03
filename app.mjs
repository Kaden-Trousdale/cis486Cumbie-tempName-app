import 'dotenv/config'; 
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile } from 'fs/promises';
import { MongoClient , ServerApiVersion} from 'mongodb';

//const { MongoClient, ServerApiVersion } = require('mongodb');


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//MONGO DB CONNECTION STRING
const uri = process.env.MONGO_URI;  

const myVar = 'injected from server'; // Declare your variable

app.use(express.static(join(__dirname, 'public')));
app.use(express.json());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);




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
