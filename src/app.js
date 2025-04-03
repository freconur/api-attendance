const express = require("express");
const morgan = require("morgan");
// const admin = require("firebase-admin");
const { auth, db } = require("./firebase");
const app = express();
const cors = require("cors");
const { months, days } = require("./dates");
const cron = require("node-cron")
// const whitelist = ['http://localhost:3001', 'http://localhost:3000', 'https://www.tuescuelagestiona.online/, https://tuescuelagestiona.online']
const whitelist = [
  "https://www.tuescuelagestiona.online, https://tuescuelagestiona.online",
];
const options = {
  origin: (origin, callback) => {
    if (whitelist.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("no permitido"));
    }
  },
};
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: "https://www.tuescuelagestiona.online" }));

const corsOptions = {
  origin: "https://www.tuescuelagestiona.online", // Solo permite solicitudes desde este dominio
  methods: "GET,POST", // Solo permite estos métodos HTTP
  allowedHeaders: ["Content-Type", "Authorization"], // Permite ciertos encabezados
};
app.get("/", async (req, res) => {
  res.send("holiwis");
});

// app.post('/crear-director', async (req, res) => {
//   res.header('Access-Control-Allow-Origin', 'https://www.tuescuelagestiona.online')
//   // res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
//   const usuarioRef = db.collection('usuarios').doc(`${req.body.dni}`);
//   await usuarioRef.get()
//     .then(async doc => {
//       if (doc.exists === false) {
//         console.log('entroa a no existe')
//         const rta = await auth.createUser({
//           uid: req.body.dni,
//           email: req.body.email,
//           password: req.body.password,
//           emailVerified: false,
//           disabled: false
//         })
//         res.json({ ...rta, estado: true, warning: 'usuario creado con éxito', exists: false })
//       } else if (doc.exists === true) {
//         console.log('entroa a si existe')
//         res.json({ warning: 'usuario ya existe', estado: true, exists: true })
//       }
//     })
// })

app.post("/crear-docente", async (req, res) => {
  // res.header('Access-Control-Allow-Origin','https://www.tuescuelagestiona.online')
  // res.header('Access-Control-Allow-Origin', 'http://localhost:3000')

  const usuarioRef = db
    .collection(`intituciones/${req.body.idInstitution}/usuarios`)
    .doc(`${req.body.dni}`);
  await usuarioRef.get().then(async (doc) => {
    if (!doc.exists) {
      const rta = await auth.createUser({
        uid: req.body.dni,
        email: req.body.email,
        password: req.body.password,
        emailVerified: false,
        disabled: false,
      });
      res.json({
        ...rta,
        estado: true,
        warning: "usuario creado con éxito",
        exists: false,
      });
    } else if (doc.exists) {
      res.json({ warning: "usuario ya existe", estado: true, exists: true });
    }
  });
});

// cron.schedule('15 16 * * *', () => {
// // app.get("/update-attendance", async (req, res) => {
//   // el id de la institucion por ahora sera estitico pero cuando se agregen mas colegios se hara dinamico
//   //crearemos una nueva instancia para la fecha actual
//   const currentDate = new Date();
//   //hago un get de todos los estudiantes de la institucion
//   if (days[currentDate.getDay()] !== 'sabado' || days[currentDate.getDay()] !== 'domingo') {

//     const usuarioRef = db.collection(
//       `/intituciones/l2MjRJSZU2K6Qdyc3lUz/students`
//     );

//     const newPromise = new Promise(async (resolve, recject) => {
//       try {
//         await usuarioRef.get().then((rtaEstudiantes) => {
//           //creo un array vacio para poder almacenar todos los datos obtenidos del get
//           console.log('rtaEstudiantes', rtaEstudiantes)
//           const arrayEstudiantes = [];
//           //creamos un id con el nombre de index para poder identificar el ultimo elemento del array
//           let index = 0
//           rtaEstudiantes.forEach((doc) => {
//             arrayEstudiantes.push({ ...doc.data(), id: doc.id });
//             // console.log('rtaEstudiantes.size', rtaEstudiantes.size)
//             // console.log('index', index)
//             index = index + 1
//             if (rtaEstudiantes.size === index) {
//               console.log('aqui quedamos')
//               resolve(arrayEstudiantes)
//             }
//           });
//         });
//       } catch (error) {
//         console.log("error", error);
//         recject();
//       }
//     });


//     const validarAsistenciaPromise = new Promise((resolve, reject) => {

//       let index = 0
//       try {
//         newPromise.then(rtaDeEstudiantes => {
//           //una vez obtenido los id de todos los estudiantes de la institucion procederemos a verificar si tienen registro de asistencia tanto de entrada como de salida
//           const arrayEstudiantesData = []
//           rtaDeEstudiantes.forEach(async (estudiante) => {
//             const asistenciaPath = `/intituciones/l2MjRJSZU2K6Qdyc3lUz/attendance-student/${estudiante.dni}/${currentDate.getFullYear()}/${months[currentDate.getMonth()]}/${months[currentDate.getMonth()]}`;
//             // const asistenciaPath = `/intituciones/l2MjRJSZU2K6Qdyc3lUz/attendance-student/${estudiante.dni}/${currentDate.getFullYear()}/marzo/marzo`; //esto esta hardcodeado para poder actualizar los datos del mes de marzo
//             const asistenciaRef = db
//               .collection(asistenciaPath)
//               .doc(`${currentDate.getDate()}`);
//             // .doc(`${currentDate.getDate()}`);

//             await asistenciaRef.get()
//               .then(async (asistencia) => {
//                 // console.log('asistencia.data()', asistencia.data())
//                 if (asistencia.exists) {
//                   if (
//                     asistencia.data().arrivalTime === undefined &&
//                     asistencia.data().departure === undefined
//                   ) {
//                     index = index + 1
//                     // console.log("estudiante ha faltado, se le pondra como falta para esta fecha");
//                     arrayEstudiantesData.push({ ...asistencia.data(), id: estudiante.dni, llegada: 'tarde' })
//                     const rutaDeNuevoMes = db.collection(asistenciaPath).doc(`${currentDate.getDate()}`);

//                     await rutaDeNuevoMes.set({
//                       // arrivalTime: 'falto',
//                       falta: true
//                     }, { merge: true });
//                     if (rtaDeEstudiantes.length === index) {
//                       resolve(true)
//                     }
//                   } else {
//                     index = index + 1
//                     // console.log(`dni:${asistencia.data().dni}, ingreso: ${asistencia.data()}`)
//                     arrayEstudiantesData.push({ ...asistencia.data(), id: estudiante.dni, llegada: 'temprano' })
//                     if (rtaDeEstudiantes.length === index) {
//                       resolve(true)
//                     }
//                   }
//                 } else {
//                   console.log("estudiante no existe");
//                 }

//               })
//           });

//         })
//       } catch (error) {
//         console.log('error', error)
//         reject()
//       }
//     })
//     validarAsistenciaPromise.then(response => {
//       // console.log('response', response.filter(a => a.llegada === 'tarde'))

//       // response === true && res.send("holiwis");
//       response === true && console.log("holiwis");
//     })
//   }
// });
// })

//SE AGREGO LA VARIABLE DE ENTORNO TZ PARA PODER MANEJAR LA ZONA HORARIA LOCAL

// app.get("/create-route", async (req, res) => {
// el id de la institucion por ahora sera estitico pero cuando se agregen mas colegios se hara dinamico
//crearemos una nueva instancia para la fecha actual
cron.schedule('11 1 * * *', () => {
  const currentDate = new Date();
  if (days[currentDate.getDay()] !== 'sabado' || days[currentDate.getDay()] !== 'domingo') {
    //hago un get de todos los estudiantes de la institucion
    const usuarioRef = db.collection(
      `/intituciones/l2MjRJSZU2K6Qdyc3lUz/students`
    );

    const newPromise = new Promise(async (resolve, recject) => {
      try {
        await usuarioRef.get().then((rtaEstudiantes) => {
          //creo un array vacio para poder almacenar todos los datos obtenidos del get
          console.log('rtaEstudiantes', rtaEstudiantes)
          const arrayEstudiantes = [];
          //creamos un id con el nombre de index para poder identificar el ultimo elemento del array
          let index = 0
          rtaEstudiantes.forEach((doc) => {
            arrayEstudiantes.push({ ...doc.data(), id: doc.id });
            // console.log('rtaEstudiantes.size', rtaEstudiantes.size)
            // console.log('index', index)
            index = index + 1
            if (rtaEstudiantes.size === index) {
              console.log('aqui quedamos')
              resolve(arrayEstudiantes)
            }
          });
        });
      } catch (error) {
        console.log("error", error);
        recject();
      }
    });

    newPromise.then(async (estudiantes) => {
      let index = 0
      estudiantes.forEach(async (estudiante) => {
        const asistenciaPath = `/intituciones/l2MjRJSZU2K6Qdyc3lUz/attendance-student/${estudiante.dni}/${currentDate.getFullYear()}/${months[currentDate.getMonth()]}/${months[currentDate.getMonth()]}`;
        index = index + 1
        // const asistenciaPath = `/intituciones/l2MjRJSZU2K6Qdyc3lUz/attendance-student/${estudiante.dni}/${currentDate.getFullYear()}/marzo/marzo`;
        const rutaDeNuevoMes = db.collection(asistenciaPath).doc(`${currentDate.getDate()}`);

        await rutaDeNuevoMes.set({
          // active: true
          falta:true
        }, { merge: true });
      })
      if (estudiantes.length === index) {
        // res.send("terminamos")
        console.log("terminamos")
      }
    })
  }

})
// })
app.get("/dime-la-hora", async (req, res) => {

  const currentDate = new Date()
  
  console.log(`fecha: ${currentDate.getDate()}, hora:${currentDate.getHours()}, minutos: ${currentDate.getMinutes()},`)
  console.log(currentDate.toString())
  res.send(`fecha: ${currentDate.getDate()}, hora:${currentDate.getHours()}, minutos: ${currentDate.getMinutes()}`)
})
cron.schedule('18 2 * * *', () => {
  const currentDate = new Date()
  
  console.log(`fecha: ${currentDate.getDate()}, hora:${currentDate.getHours()}, minutos: ${currentDate.getMinutes()},`)
  console.log(currentDate.toString())
  res.send(`fecha: ${currentDate.getDate()}, hora:${currentDate.getHours()}, minutos: ${currentDate.getMinutes()}`)
})

module.exports = app;
