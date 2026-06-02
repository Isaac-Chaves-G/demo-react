import axiosClient from "../lib/axios/axiosClient";

const URL = "/reservas";

export async function getReservas() {
  const res = await axiosClient.get(URL);
  return res.data; // [{ id, nombreHuesped, numeroHabitacion, estado, userId, username }]
}

export async function createReserva(data) {
  const res = await axiosClient.post(URL, data); // { nombreHuesped, numeroHabitacion, estado, userId }
  return res.data;
}

export async function updateReserva(id, data) {
  const res = await axiosClient.put(`${URL}/${id}`, data);
  return res.data;
}

export async function deleteReserva(id) {
  const res = await axiosClient.delete(`${URL}/${id}`);
  return res.data;
}
