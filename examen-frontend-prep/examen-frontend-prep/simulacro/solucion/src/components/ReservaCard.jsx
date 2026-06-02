// ⭐ Componente de UNA reserva.
// Recibe DATOS (reserva) y FUNCIONES/callbacks (onCambiarEstado, onEliminar) por props.
// No sabe de axios: solo avisa al padre cuando el usuario interactúa.

const ESTADOS = ["PENDIENTE", "CONFIRMADA", "CANCELADA"];

export default function ReservaCard({ reserva, onCambiarEstado, onEliminar }) {
  return (
    <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, margin: 8 }}>
      {/* muestra TODA la info */}
      <h3>{reserva.nombreHuesped}</h3>
      <p>Reserva #{reserva.id} · Habitación {reserva.numeroHabitacion}</p>
      <p>Estado: <strong>{reserva.estado}</strong></p>

      {/* CAMBIAR ESTADO → avisa al padre con (id, nuevoEstado) */}
      <label>Estado: </label>
      <select
        value={reserva.estado}
        onChange={(e) => onCambiarEstado(reserva.id, e.target.value)}
      >
        {ESTADOS.map((es) => (
          <option key={es} value={es}>{es}</option>
        ))}
      </select>

      {/* ELIMINAR → avisa al padre con el id */}
      <button onClick={() => onEliminar(reserva.id)} style={{ marginLeft: 8 }}>
        Eliminar
      </button>
    </div>
  );
}
