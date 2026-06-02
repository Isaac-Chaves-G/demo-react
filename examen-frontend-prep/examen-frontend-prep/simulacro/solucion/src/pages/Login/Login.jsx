import { useContext } from "react";
import { useNavigate } from "react-router";
import { login } from "../../services/auth.service";
import AuthContext from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login: guardarToken } = useContext(AuthContext);

  async function onSubmit(e) {
    e.preventDefault(); // no recargar la página
    const data = Object.fromEntries(new FormData(e.target)); // { username, password }
    try {
      const res = await login(data.username, data.password); // { accessToken }
      guardarToken(res.accessToken);
      navigate("/dashboard");
    } catch (err) {
      alert("Credenciales inválidas");
      console.error(err);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 320, margin: "80px auto", display: "grid", gap: 8 }}>
      <h1>Login — Hotel</h1>
      <input name="username" placeholder="Usuario (recepcion1@hotel.com)" />
      <input name="password" type="password" placeholder="Contraseña (123456)" />
      <button type="submit">Entrar</button>
    </form>
  );
}
