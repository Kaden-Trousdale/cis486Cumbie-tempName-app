//app.js

//es5 import express from 'express'
import pkg from 'express';
const { express } = pkg;

//
//const express = require('express');

const app = express()

app.get('/', (req, res) => {
  res.send('Hello World!!!')
})


//server start
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})
