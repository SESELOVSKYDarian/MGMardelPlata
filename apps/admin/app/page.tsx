"use client";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function Admin() {
  const [token, setToken] = useState<string>("");
  const [models, setModels] = useState<any[]>([]);

  async function login() {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@mgclone.local",
        password: "admin123",
      }),
    });
    const data = await res.json();
    setToken(data.token);
  }

  async function loadModels() {
    const res = await fetch(`${API}/models`);
    setModels(await res.json());
  }

  async function createModel() {
    const res = await fetch(`${API}/models`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: "Nuevo Modelo",
        slug: `modelo-${Date.now()}`,
        fuelType: "HYBRID",
      }),
    });
    if (res.ok) loadModels();
  }

  useEffect(() => {
    loadModels();
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>Admin MG Clone</h1>
      {!token ? (
        <button onClick={login}>Login demo</button>
      ) : (
        <span>Conectado</span>
      )}
      <hr />
      <h2>Modelos</h2>
      <button onClick={createModel} disabled={!token}>
        Crear
      </button>
      <ul>
        {models.map((m) => (
          <li key={m.id}>
            {m.name} — {m.fuelType}
          </li>
        ))}
      </ul>
    </main>
  );
}
