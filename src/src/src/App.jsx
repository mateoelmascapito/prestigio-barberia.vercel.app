import React, { useEffect, useMemo, useState } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDhftAGoxNiwjmz0l03CF15BTk24MTKTBA",
  authDomain: "prestigio-barberia.firebaseapp.com",
  projectId: "prestigio-barberia",
  storageBucket: "prestigio-barberia.firebasestorage.app",
  messagingSenderId: "950866234809",
  appId: "1:950866234809:web:650db9eeee65aa8c043a68",
  measurementId: "G-MJQBE0MLCN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function BarberiaApp() {
  const horariosBase = [
    '13:00', '13:45', '14:30', '15:15',
    '16:00', '16:45', '17:30', '18:15',
    '19:00', '19:45'
  ];

  const hoy = new Date().toISOString().split('T')[0];

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fecha, setFecha] = useState(hoy);
  const [servicio, setServicio] = useState('Corte');
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [turnos, setTurnos] = useState([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'turnos'), (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));
      setTurnos(data);
    });

    return () => unsub();
  }, []);

  const horariosDisponibles = useMemo(() => {
    const ocupados = turnos
      .filter((t) => t.fecha === fecha)
      .map((t) => t.hora);

    return horariosBase.filter((h) => !ocupados.includes(h));
  }, [fecha, turnos]);

  const reservarTurno = async () => {
    if (!nombre || !telefono || !fecha || !horaSeleccionada) {
      setMensaje('Completá todos los campos.');
      return;
    }

    await addDoc(collection(db, 'turnos'), {
      cliente: nombre,
      telefono,
      fecha,
      hora: horaSeleccionada,
      servicio
    });

    setNombre('');
    setTelefono('');
    setHoraSeleccionada('');

    setMensaje(
      'Turno registrado. Seña obligatoria: $20.000 | Alias: prestigio.barberia | Titular: Martin Aparicio'
    );
  };

  const eliminarTurno = async (id) => {
    await deleteDoc(doc(db, 'turnos', id));
  };

  return (
    <div style={{ minHeight: '100vh', padding: '20px', fontFamily: 'Arial' }}>
      <h1>Prestigio Barbería</h1>

      <div style={{ marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <br /><br />

        <input
          type="text"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
        <br /><br />

        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
        <br /><br />

        <select
          value={servicio}
          onChange={(e) => setServicio(e.target.value)}
        >
          <option>Corte</option>
          <option>Barba</option>
          <option>Corte + Barba</option>
        </select>

        <h3>Horarios disponibles</h3>
        <div>
          {horariosDisponibles.map((hora) => (
            <button
              key={hora}
              onClick={() => setHoraSeleccionada(hora)}
              style={{
                margin: '5px',
                padding: '10px',
                backgroundColor:
                  horaSeleccionada === hora ? 'black' : 'white',
                color:
                  horaSeleccionada === hora ? 'white' : 'black'
              }}
            >
              {hora}
            </button>
          ))}
        </div>

        <br />

        <button onClick={reservarTurno}>
          Confirmar turno
        </button>

        <p>{mensaje}</p>
      </div>

      <h2>Panel Admin</h2>

      {turnos.map((turno) => (
        <div
          key={turno.id}
          style={{
            border: '1px solid black',
            padding: '10px',
            marginBottom: '10px'
          }}
        >
          <p><strong>Cliente:</strong> {turno.cliente}</p>
          <p><strong>Fecha:</strong> {turno.fecha}</p>
          <p><strong>Hora:</strong> {turno.hora}</p>
          <p><strong>Servicio:</strong> {turno.servicio}</p>

          <button onClick={() => eliminarTurno(turno.id)}>
            Cancelar turno
          </button>
        </div>
      ))}
    </div>
  );
}