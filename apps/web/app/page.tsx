import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Highlight = {
  id: string;
  title: string;
  subtitle?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  badge?: string | null;
  imageUrl?: string | null;
};

type CarModel = {
  id: string;
  name: string;
  slug: string;
  heroImageUrl?: string | null;
  priceFromUsd?: number | null;
};

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`No se pudo cargar ${path}`);
  }
  return res.json();
}

export default async function HomePage() {
  const [highlights, models] = await Promise.all([
    fetchJSON<Highlight[]>("/highlights"),
    fetchJSON<CarModel[]>("/models"),
  ]);

  return (
    <main>
      {/* Hero / Destacados */}
      <section className="hero">
        <div className="container">
          <h1>Innovación, Diseño y Tecnología</h1>
          <p>Explorá nuestra línea de híbridos y eléctricos.</p>
          <div className="grid grid-3">
            {highlights.map((highlight) => (
              <article key={highlight.id} className="card">
                {highlight.badge && <span className="badge">{highlight.badge}</span>}
                <img
                  src={highlight.imageUrl || "/placeholder.jpg"}
                  alt={highlight.title}
                />
                <h3>{highlight.title}</h3>
                {highlight.subtitle && <p className="muted">{highlight.subtitle}</p>}
                {highlight.ctaHref && (
                  <Link className="btn" href={highlight.ctaHref}>
                    {highlight.ctaLabel || "Ver más"}
                  </Link>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Modelos */}
      <section className="section" id="modelos">
        <div className="container">
          <h2>¿Qué modelo te gusta?</h2>
          <div className="grid grid-3">
            {models.map((model) => (
              <Link key={model.id} href={`/modelos/${model.slug}`} className="card">
                <img
                  src={model.heroImageUrl || "/placeholder.jpg"}
                  alt={model.name}
                />
                <h3>{model.name}</h3>
                {typeof model.priceFromUsd === "number" && (
                  <p className="muted">Desde: USD {model.priceFromUsd.toLocaleString()}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sobre MG */}
      <section className="section alt">
        <div className="container two">
          <div>
            <h2>Tenemos un futuro brillante por delante</h2>
            <p className="muted">
              SUV híbridos eco eficientes, estilo y tecnología.
            </p>
            <Link className="btn" href="/mg-world">
              Más información
            </Link>
          </div>
          <div className="panel" />
        </div>
      </section>

      {/* Test Drive */}
      <section className="section" id="test-drive">
        <div className="container center">
          <h2>Manejar un MG, la aventura que no te podés perder.</h2>
          <Link className="btn primary" href="/test-drive">
            ¡Agendar Test Drive!
          </Link>
        </div>
      </section>
    </main>
  );
}
