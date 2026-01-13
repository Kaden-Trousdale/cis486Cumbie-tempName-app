//app.js

//es5 import express from 'express'
import { express } from 'express';
//
//const express = require('express');

const app = express()

app.get('/', (req, res) => {
  res.send('Hello World!!! TESTING FROM THE DEV')
})


//server start
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})