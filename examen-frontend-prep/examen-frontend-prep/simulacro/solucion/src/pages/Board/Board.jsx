import { useEffect, useState } from "react";
import {
  getReservas,
  createReserva,
  updateReserva,
  deleteReserva,
} from "../../services/reservas.service";
import ReservaCard from "../../components/ReservaCard";

const ESTADOS = ["PENDIENTE", "CONFIRMADA", "CANCELADA"];

export default function Board() {
  const [reservas, setReservas] = useState([]);

  // 1) cargar la lista al montar
  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const data = await getReservas();
    setReservas(data);
  }

  // 2) CREAR
  async function onCrear(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target)); // { nombreHuesped, numeroHabitacion, estado }
    data.numeroHabitacion = Number(data.numeroHabitacion);
    data.userId = reservas[0]?.userId; // gotcha: el token no trae userId → sácalo de la lista
    await createReserva(data);
    e.target.reset();
    await cargar(); // refrescar
  }

  // 3) CAMBIAR ESTADO (callback que recibe la Card)
  async function onCambiarEstado(id, nuevoEstado) {
    const r = reservas.find((x) => x.id === id);
    await updateReserva(id, {
      nombreHuesped: r.nombreHuesped,        // objeto completo
      numeroHabitacion: r.numeroHabitacion,
      estado: nuevoEstado,
      userId: r.userId,
    });
    await cargar();
  }

  // 4) ELIMINAR (callback que recibe la Card)
  async function onEliminar(id) {
    await deleteReserva(id);
    await cargar();
  }

  return (
    <div style={{ maxWidth: 600, margin: "24px auto" }}>
      <h1>Tablero de Reservas</h1>

      {/* FORM CREAR */}
      <form onSubmit={onCrear} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input name="nombreHuesped" placeholder="Nombre del huésped" />
        <input name="numeroHabitacion" type="number" placeholder="Habitación" />
        <select name="estado" defaultValue="PENDIENTE">
          {ESTADOS.map((es) => (
            <option key={es} value={es}>{es}</option>
          ))}
        </select>
        <button type="submit">Crear reserva</button>
      </form>

      <p>Total: {reservas.length}</p>

      {/* LISTA: pasa DATOS y CALLBACKS a cada Card */}
      {reservas.map((r) => (
        <ReservaCard
          key={r.id}
          reserva={r}
          onCambiarEstado={onCambiarEstado}
          onEliminar={onEliminar}
        />
      ))}
    </div>
  );
}
