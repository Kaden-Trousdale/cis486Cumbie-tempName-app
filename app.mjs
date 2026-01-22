//app.js

//es5 import express from 'express'
import express from 'express'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

//
//const express = require('express');

const app = express()
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT || 3000;

// middlewares (get to slash) = "http verb" to slash "Endpoint name"
app.get('/', (req, res) => {
 // res.send('Hello World!!! updated');//string response
 // res.sendFile('index.html');
  res.sendFile(join(__dirname, 'public', 'index.html'));
})


//server start
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})
