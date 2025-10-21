"use client";
import { useEffect, useState, type FormEvent } from "react";

type CarModel = {
  id: string;
  name: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function TestDrive() {
  const [state, setState] = useState({
    fullName: "",
    email: "",
    phone: "",
    modelId: "",
    prefersDate: "",
    message: "",
  });
  const [models, setModels] = useState<CarModel[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/models`)
      .then((res) => res.json())
      .then((data) => setModels(data))
      .catch(() => setModels([]));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    const res = await fetch(`${API_BASE}/test-drive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...state,
        prefersDate: state.prefersDate || null,
        message: state.message || null,
      }),
    });
    if (res.ok) {
      setFeedback("¡Solicitud enviada! Un asesor se comunicará pronto.");
      setState({
        fullName: "",
        email: "",
        phone: "",
        modelId: "",
        prefersDate: "",
        message: "",
      });
    } else {
      setFeedback("No pudimos enviar la solicitud. Revisá los datos e intentá nuevamente.");
    }
    setSubmitting(false);
  }
  return (
    <div className="container">
      <h1>Agendar Test Drive</h1>
      <form onSubmit={submit} className="form">
        <input
          placeholder="Nombre completo"
          value={state.fullName}
          onChange={(event) => setState((value) => ({ ...value, fullName: event.target.value }))}
        />
        <input
          placeholder="Email"
          type="email"
          value={state.email}
          onChange={(event) => setState((value) => ({ ...value, email: event.target.value }))}
        />
        <input
          placeholder="Teléfono"
          value={state.phone}
          onChange={(event) => setState((value) => ({ ...value, phone: event.target.value }))}
        />
        <select
          value={state.modelId}
          onChange={(event) => setState((value) => ({ ...value, modelId: event.target.value }))}
          required
        >
          <option value="">Seleccioná un modelo</option>
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
        <input
          placeholder="Fecha preferida"
          type="date"
          value={state.prefersDate}
          onChange={(event) => setState((value) => ({ ...value, prefersDate: event.target.value }))}
        />
        <textarea
          placeholder="Mensaje (opcional)"
          rows={4}
          value={state.message}
          onChange={(event) => setState((value) => ({ ...value, message: event.target.value }))}
        />
        <button className="btn primary" disabled={submitting}>
          {submitting ? "Enviando..." : "Enviar"}
        </button>
      </form>
      {feedback && <p className="muted center">{feedback}</p>}
    </div>
  );
}
