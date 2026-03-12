import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ThinDivider } from "@/components/ThinDivider";
import { articles } from "@/data/archive";

export default function Home() {
  // último agregado primero
  const ordered = [...articles].reverse();

  const narrativeArticles = ordered.filter(
    (article) => article.kind !== "CRÓNICA" && article.kind !== "HAYLA",
  );
  const chronicleArticles = ordered.filter(
    (article) => article.kind === "CRÓNICA",
  );

  return (
    <div className="font-sans bg-white text-black selection:bg-black selection:text-white">
      <SiteHeader />

      <main
        className="px-6 md:px-12 lg:px-24 pb-32"
        data-purpose="essay-list"
      >
        <section id="selected-works">
          <div className="mb-12">
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-semibold mb-4">
              NARRATIVAS DESTACADAS
            </h2>
            <ThinDivider />
          </div>

          <div className="grid grid-cols-1 gap-y-16 lg:gap-y-24">
            {narrativeArticles.map((article) => (
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
                      <h3 className="text-3xl md:text-5xl lg:text-6xl font-normal tracking-tight leading-tight mb-6">
                        {article.title}
                      </h3>
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
          </div>
        </section>

        <section
          id="journal"
          className="mt-48 grid grid-cols-1 md:grid-cols-12 gap-8"
        >
          <aside className="md:col-span-3">
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-semibold sticky top-12">
              CRÓNICAS
            </h2>
          </aside>

          <div className="md:col-span-9 space-y-12">
            {chronicleArticles.map((article) => (
              <div
                key={article.id}
                className="group"
                data-purpose="journal-link"
              >
                <p className="text-[10px] mb-2">{article.publishedAt}</p>
                <Link
                  className="text-xl hover:line-through decoration-1"
                  href={`/archivo/${article.slug}`}
                >
                  {article.title}
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

