const { initializeApp, cert } = require('firebase-admin/app')
const express = require('express')
// import { getFirestore,collection } from 'firebase/firestore'
const app = express()
const { getFirestore } = require('firebase-admin/firestore')
const { getAuth } = require('firebase-admin/auth')
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
const dotenv = require('dotenv')
dotenv.config()
initializeApp({
  credential: cert(JSON.parse(process.env.PRIVATE_KEY))
});

const db = getFirestore()
const auth = getAuth()

module.exports = { db, auth }
// var admin = require("firebase-admin");

// // var serviceAccount = require("path/to/serviceAccountKey.json");

// admin.initializeApp({
//   credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CONFIG))
// });

// const firestore = admin.firestore()
// const auth = admin.auth()

// module.exports = [firestore, auth]