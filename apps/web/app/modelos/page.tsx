import { notFound } from "next/navigation";

async function getModel(slug: string) {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const res = await fetch(`${base}/models`, { cache: "no-store" });
  const all = await res.json();
  return all.find((m: any) => m.slug === slug);
}

export default async function ModelPage({
  params,
}: {
  params: { slug: string };
}) {
  const model = await getModel(params.slug);
  if (!model) return notFound();
  return (
    <div className="container">
      <h1>{model.name}</h1>
      <img src={model.heroImageUrl || "/placeholder.jpg"} alt={model.name} />
      <p>{model.teaser}</p>
      {/* specs / gallery */}
    </div>
  );
}
