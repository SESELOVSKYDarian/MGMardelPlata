import Link from 'next/link'
const [highlights, models] = await Promise.all([
fetchJSON('/highlights'),
fetchJSON('/models')
])


return (
<main>
{/* Hero / Destacados (similar a secciones "Destacados / Híbridos / Eléctricos") */}
<section className="hero">
<div className="container">
<h1>Innovación, Diseño y Tecnología</h1>
<p>Explorá nuestra línea de híbridos y eléctricos.</p>
<div className="grid grid-3">
{highlights.map((h:any)=> (
<article key={h.id} className="card">
{h.badge && <span className="badge">{h.badge}</span>}
<img src={h.imageUrl || '/placeholder.jpg'} alt={h.title} />
<h3>{h.title}</h3>
{h.subtitle && <p className="muted">{h.subtitle}</p>}
{h.ctaHref && <Link className="btn" href={h.ctaHref}>{h.ctaLabel || 'Ver más'}</Link>}
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
{models.map((m:any)=> (
<Link key={m.id} href={`/modelos/${m.slug}`} className="card">
<img src={m.heroImageUrl || '/placeholder.jpg'} alt={m.name} />
<h3>{m.name}</h3>
{m.priceFromUsd && <p className="muted">Desde: USD {m.priceFromUsd.toLocaleString()}</p>}
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
<p className="muted">SUV híbridos eco eficientes, estilo y tecnología.</p>
<Link className="btn" href="/mg-world">Más información</Link>
</div>
<div className="panel" />
</div>
</section>


{/* Test Drive */}
<section className="section" id="test-drive">
<div className="container center">
<h2>Manejar un MG, la aventura que no te podés perder.</h2>
<Link className="btn primary" href="/test-drive">¡Agendar Test Drive!</Link>
</div>
</section>
</main>
)
}