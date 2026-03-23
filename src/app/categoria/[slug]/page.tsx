import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ThinDivider } from "@/components/ThinDivider";
import { CategoryPagination } from "@/components/CategoryPagination";
import { articles, type ArticleKind } from "@/data/archive";

const CATEGORY_CONFIG: Record<
  string,
  { label: string; kinds: ArticleKind[] }
> = {
  ensayos: { label: "Ensayos", kinds: ["ENSAYO"] },
  ficcion: { label: "Ficción", kinds: ["FICCIÓN"] },
  cronicas: { label: "Crónicas", kinds: ["CRÓNICA"] },
  teoria: { label: "Teoría", kinds: ["TEORÍA"] },
  relatos: { label: "Relatos", kinds: ["RELATO"] },
  hayla: { label: "Hayla", kinds: ["HAYLA"] },
};

export async function generateStaticParams() {
  return Object.keys(CATEGORY_CONFIG).map((slug) => ({ slug }));
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: {
    page?: string;
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;

  const config = CATEGORY_CONFIG[slug];

  if (!config) {
    notFound();
  }

  // Protección simple: si es la categoría HAYLA, exige cookie de acceso
  if (slug === "hayla") {
    const cookieStore = await cookies();
    const token = cookieStore.get("hayla_auth")?.value;

    if (token !== "ok") {
      redirect(`/hayla-acceso?from=/categoria/hayla`);
    }
  }

  let filteredArticles = [...articles]
    .reverse() // último agregado primero
    .filter((article) => config.kinds.includes(article.kind));

  // Orden prioritario solo para la categoría FICCIÓN
  if (slug === "ficcion") {
    const prioritySlugs = ["azul", "canela"];

    const prioritized = prioritySlugs
      .map((s) => filteredArticles.find((a) => a.slug === s))
      .filter((a): a is (typeof articles)[number] => a !== undefined);

    const rest = filteredArticles.filter(
      (a) => !prioritySlugs.includes(a.slug),
    );

    filteredArticles = [...prioritized, ...rest];
  }

  const PAGE_SIZE = 10;

  // Según tu pedido: paginar solo categorías que no sean CRÓNICAS ni HAYLA.
  const shouldPaginate = slug !== "cronicas" && slug !== "hayla";

  const totalPages = shouldPaginate
    ? Math.max(1, Math.ceil(filteredArticles.length / PAGE_SIZE))
    : 1;

  const requestedPageRaw = searchParams?.page;
  const requestedPageStr = Array.isArray(requestedPageRaw)
    ? requestedPageRaw[0]
    : requestedPageRaw;

  const requestedPage = requestedPageStr
    ? Number.parseInt(requestedPageStr, 10)
    : 1;

  const currentPage =
    shouldPaginate && totalPages > 1
      ? Math.min(Math.max(1, Number.isFinite(requestedPage) ? requestedPage : 1), totalPages)
      : 1;

  const pagedArticles =
    shouldPaginate && totalPages > 1
      ? filteredArticles.slice(
          (currentPage - 1) * PAGE_SIZE,
          currentPage * PAGE_SIZE,
        )
      : filteredArticles;

  return (
    <div className="font-sans bg-white text-black selection:bg-black selection:text-white">
      <SiteHeader />

      <main className="px-6 md:px-12 lg:px-24 pb-32">
        <header className="mb-12">
          <p className="text-[10px] uppercase tracking-[0.3em] mb-4">
            Categoría
          </p>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-normal tracking-tight">
            {config.label}
          </h1>
        </header>

        <ThinDivider />

        {filteredArticles.length === 0 ? (
          <p className="mt-16 text-sm text-black/60 max-w-md">
            Aún no hay textos publicados en esta categoría.
          </p>
        ) : (
          <section className="mt-16 grid grid-cols-1 gap-y-16 lg:gap-y-24">
            {pagedArticles.map((article) => (
              <article
                key={article.id}
                className="group"
                data-purpose="archive-entry"
              >
                <Link
                  className="block transition-opacity archive-link"
                  href={`/archivo/${article.slug}`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <span className="text-[10px] uppercase tracking-tighter w-12 pt-4">
                      {article.indexNumber}
                    </span>
                    <div className="flex-grow max-w-4xl">
                      <h2 className="text-3xl md:text-5xl lg:text-6xl font-normal tracking-tight leading-tight mb-6">
                        {article.title}
                      </h2>
                      <p className="text-sm md:text-base text-black/60 font-light leading-relaxed max-w-2xl">
                        {article.summary}
                      </p>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-right pt-4 whitespace-nowrap">
                      {article.year} — {article.kind}
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </section>
        )}

        {filteredArticles.length > PAGE_SIZE && shouldPaginate && totalPages > 1 && (
          <CategoryPagination
            baseHref={`/categoria/${slug}`}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

