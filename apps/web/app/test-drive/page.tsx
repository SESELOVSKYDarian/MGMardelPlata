"use client";
import { useState } from "react";

export default function TestDrive() {
  const [state, set] = useState({
    fullName: "",
    email: "",
    phone: "",
    modelId: "",
    prefersDate: "",
  });
  async function submit(e: any) {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/test-drive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...state,
        prefersDate: state.prefersDate || null,
      }),
    });
    if (res.ok) alert("Solicitud enviada");
  }
  return (
    <div className="container">
      <h1>Agendar Test Drive</h1>
      <form onSubmit={submit} className="form">
        <input
          placeholder="Nombre completo"
          onChange={(e) => set((v) => ({ ...v, fullName: e.target.value }))}
        />
        <input
          placeholder="Email"
          type="email"
          onChange={(e) => set((v) => ({ ...v, email: e.target.value }))}
        />
        <input
          placeholder="Teléfono"
          onChange={(e) => set((v) => ({ ...v, phone: e.target.value }))}
        />
        <input
          placeholder="ID de modelo (provisorio)"
          onChange={(e) => set((v) => ({ ...v, modelId: e.target.value }))}
        />
        <input
          placeholder="Fecha preferida"
          type="date"
          onChange={(e) => set((v) => ({ ...v, prefersDate: e.target.value }))}
        />
        <button className="btn primary">Enviar</button>
      </form>
    </div>
  );
}
