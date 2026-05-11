import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ThinDivider } from "@/components/ThinDivider";
import { CategoryPagination } from "@/components/CategoryPagination";
import { SoundCloudEmbed } from "@/components/SoundCloudEmbed";
import { getAllArticles } from "@/lib/articles";

interface HomeProps {
  searchParams?: Promise<{
    page?: string | string[];
  }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home({ searchParams }: HomeProps) {
  const resolvedSearchParams = await searchParams;
  const all = await getAllArticles();
  const ordered = [...all].reverse();

  const narrativeArticles = ordered.filter(
    (article) =>
      article.kind !== "CRÓNICA" &&
      article.kind !== "HAYLA" &&
      article.kind !== "PODCAST",
  );
  const chronicleArticles = ordered.filter(
    (article) => article.kind === "CRÓNICA",
  );
  const podcastArticles = ordered.filter(
    (article) => article.kind === "PODCAST",
  );

  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(narrativeArticles.length / PAGE_SIZE));

  const requestedPageRaw = resolvedSearchParams?.page;
  const requestedPageStr = Array.isArray(requestedPageRaw)
    ? requestedPageRaw[0]
    : requestedPageRaw;

  const requestedPage = requestedPageStr
    ? Number.parseInt(requestedPageStr, 10)
    : 1;

  const currentPage = Math.min(
    Math.max(1, Number.isFinite(requestedPage) ? requestedPage : 1),
    totalPages,
  );

  const pagedNarratives =
    narrativeArticles.length > PAGE_SIZE
      ? narrativeArticles.slice(
          (currentPage - 1) * PAGE_SIZE,
          currentPage * PAGE_SIZE,
        )
      : narrativeArticles;

  return (
    <div className="font-sans bg-white text-black selection:bg-black selection:text-white">
      <SiteHeader />

      <main
        className="px-6 md:px-12 lg:px-24 pb-32"
        data-purpose="essay-list"
      >
        <section id="selected-works">
          <div className="mb-0">
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-semibold mb-4">
              NARRATIVAS DESTACADAS
            </h2>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-normal tracking-tight mb-12">
              ENTRADAS
            </h1>
            <ThinDivider />
          </div>

          <div className="grid grid-cols-1 gap-y-16 lg:gap-y-0">
            {pagedNarratives.map((article) => (
              <article
                key={article.id}
                className="group pb-24 pt-24 border-b border-black/10 relative overflow-hidden transition-colors duration-200 ease-out hover:bg-[#7AA5BF]/[0.04]"
              >
                <Link
                  className="block transition-opacity duration-200 ease-out archive-link"
                  href={`/archivo/${article.slug}`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <span className="flex-shrink-0 w-12 md:w-20 pt-4">
                      <span
                        className="block text-[120px] leading-none font-[700] tracking-tighter absolute left-1 -bottom-[28px] text-black transition-colors duration-200 ease-out group-hover:text-[#7AA5BF]"
                        style={{ fontFamily: "var(--font-jakarta)" }}
                      >
                        {article.indexNumber}
                      </span>
                    </span>

                    <div className="flex-grow max-w-4xl">
                      <h3 className="text-3xl md:text-5xl lg:text-6xl font-normal tracking-tight leading-tight mb-6 transition-colors duration-200 ease-out text-black group-hover:text-[#7AA5BF]">
                        {article.title}
                      </h3>
                      <p className="text-sm md:text-base text-black/60 font-light leading-relaxed max-w-2xl">
                        {article.summary}
                      </p>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-right pt-4 whitespace-nowrap pr-4">
                      {article.year} — {article.kind}
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {narrativeArticles.length > PAGE_SIZE && totalPages > 1 && (
            <CategoryPagination
              baseHref="/"
              currentPage={currentPage}
              totalPages={totalPages}
            />
          )}
        </section>

        {podcastArticles.length > 0 && (
          <section
            id="podcast"
            className="mt-48"
            data-purpose="podcast-list"
          >
            <div className="mb-0">
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-semibold mb-4">
                AUDIO
              </h2>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-normal tracking-tight mb-12">
                EPISODIOS
              </h1>
              <ThinDivider />
            </div>

            <div className="grid grid-cols-1 gap-y-16">
              {podcastArticles.map((article) => (
                <article
                  key={article.id}
                  className="group pb-12 pt-12 border-b border-black/10"
                  data-purpose="podcast-entry"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-8">
                    <div className="md:w-24 flex-shrink-0 pt-1">
                      <span className="text-[10px] uppercase tracking-[0.3em] text-black/50">
                        {article.episodeNumber
                          ? `EP. ${String(article.episodeNumber).padStart(2, "0")}`
                          : article.indexNumber}
                      </span>
                    </div>
                    <div className="flex-grow max-w-3xl space-y-4">
                      <Link
                        href={`/archivo/${article.slug}`}
                        className="block group-hover:text-[#7AA5BF] transition-colors"
                      >
                        <h3 className="text-2xl md:text-3xl font-normal tracking-tight leading-tight">
                          {article.title}
                        </h3>
                      </Link>
                      {article.summary && (
                        <p className="text-sm md:text-base text-black/60 font-light leading-relaxed">
                          {article.summary}
                        </p>
                      )}
                      {article.audioUrl && (
                        <SoundCloudEmbed url={article.audioUrl} compact />
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

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
