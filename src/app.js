const express = require('express')
const morgan = require('morgan')
// const admin = require("firebase-admin");
const { auth, db } = require('./firebase')
const app = express()
const cors = require('cors')

const whitelist = ['http://localhost:3001', 'http://localhost:3000', 'https://www.tuescuelagestiona.online/, https://tuescuelagestiona.online']
const options = {
  origin: (origin, callback) => {
    if (whitelist.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('no permitido'));
    }
  }
}
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors(whitelist))


app.get('/', async (req, res) => {
  res.send('holiwis')
})

app.post('/crear-director', async (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://www.tuescuelagestiona.online')
  // res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
  const usuarioRef = db.collection('usuarios').doc(`${req.body.dni}`);
  await usuarioRef.get()
    .then(async doc => {
      if (doc.exists === false) {
        console.log('entroa a no existe')
        const rta = await auth.createUser({
          uid: req.body.dni,
          email: req.body.email,
          password: req.body.password,
          emailVerified: false,
          disabled: false
        })
        res.json({ ...rta, estado: true, warning: 'usuario creado con éxito', exists: false })
      } else if (doc.exists === true) {
        console.log('entroa a si existe')
        res.json({ warning: 'usuario ya existe', estado: true, exists: true })
      }
    })
})

app.post('/crear-docente', async (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://www.tuescuelagestiona.online')
  // res.header('Access-Control-Allow-Origin', 'http://localhost:3000')

  const usuarioRef = db.collection(`intituciones/${req.body.idInstitution}/usuarios`).doc(`${req.body.dni}`);
  await usuarioRef.get()
    .then(async doc => {
      if (!doc.exists) {
        const rta = await auth.createUser({
          uid: req.body.dni,
          email: req.body.email,
          password: req.body.password,
          emailVerified: false,
          disabled: false
        })
        res.json({ ...rta, estado: true, warning: 'usuario creado con éxito', exists: false })
      } else if (doc.exists) {
        res.json({ warning: 'usuario ya existe', estado: true, exists: true })
      }
    })
})
app.post('/borrar-usuario', async (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://www.tuescuelagestiona.online')
  // res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
  const usuarioRef = db.collection('usuarios').doc(`${req.body.dni}`);
  await usuarioRef.get()
    .then(async doc => {
      if (!doc.exists) {
        res.json({ warning: 'usuario no existe', estado: true, delete: false })
      } else if (doc.exists) {
        await db.collection('usuarios').doc(`${req.body.dni}`).delete()
          .then(rta => {
            console.log('res', rta)
            auth.deleteUser(`${req.body.dni}`)
              .then(() => {
                console.log('Successfully deleted user');
                res.json({ warning: 'se ha eliminado usuario con exito', estado: true, delete: true })
              })
              .catch((error) => {
                console.log('Error deleting user:', error);
              });
          })
      }
    })

})
module.exports = app