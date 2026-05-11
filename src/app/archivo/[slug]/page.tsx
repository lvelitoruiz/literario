import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getAllSlugs, getArticleBySlug } from "@/lib/articles";
import { MarkdownBody } from "@/components/MarkdownBody";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { CusdisComments } from "@/components/CusdisComments";
import { SoundCloudEmbed } from "@/components/SoundCloudEmbed";

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    preview?: string | string[];
  }>;
}

export default async function ArticlePage({
  params,
  searchParams,
}: ArticlePageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  // Preview de borradores: solo si el token de la URL coincide con la env var.
  // Si PREVIEW_TOKEN no está configurado, el preview queda inhabilitado.
  const previewToken = process.env.PREVIEW_TOKEN;
  const requestedPreviewRaw = resolvedSearchParams?.preview;
  const requestedPreview = Array.isArray(requestedPreviewRaw)
    ? requestedPreviewRaw[0]
    : requestedPreviewRaw;
  const isPreview = Boolean(
    previewToken && requestedPreview && requestedPreview === previewToken,
  );

  const article = await getArticleBySlug(slug, { includeDrafts: isPreview });

  if (!article) {
    notFound();
  }

  const cusdisAppId = process.env.NEXT_PUBLIC_CUSDIS_APP_ID;
  const c_host = process.env.NEXT_PUBLIC_CUSDIS_HOST;
  const cusdisHost =
    c_host && c_host.length > 0 ? c_host.replace(/\/$/, "") : undefined;

  return (
    <div className="font-sans bg-white text-black selection:bg-black selection:text-white">
      <SiteHeader />

      <main
        className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 pb-32"
        data-purpose="article-container"
      >
        {article.draft && isPreview && (
          <div
            className="mb-12 border border-yellow-400 bg-yellow-50 px-4 py-3 text-[10px] uppercase tracking-[0.3em] text-yellow-900"
            data-purpose="draft-preview-banner"
          >
            Vista previa · Este post es un BORRADOR y no está publicado.
          </div>
        )}
        <header
          className="mb-24 max-w-5xl"
          data-purpose="article-header"
        >
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] mb-8">
            <span>{article.year}</span>
            <span className="opacity-20">—</span>
            <span>{article.kind}</span>
            {article.kind === "PODCAST" && article.episodeNumber && (
              <>
                <span className="opacity-20">—</span>
                <span>EP. {String(article.episodeNumber).padStart(2, "0")}</span>
              </>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-normal tracking-[-0.05em] leading-[1.1] mb-12">
            {article.title}
          </h1>
          <div className="flex flex-col md:flex-row md:items-center gap-6 text-[10px] uppercase tracking-widest text-black/50">
            <span
              className="text-black font-semibold"
              data-purpose="author-name"
            >
              Escrito por {article.author}
            </span>
            <span className="hidden md:block opacity-20">/</span>
            <time
              data-purpose="publish-date"
              dateTime={article.publishedAt}
            >
              {article.publishedAt}
            </time>
          </div>
        </header>

        {article.kind === "PODCAST" && article.audioUrl && (
          <section
            className="max-w-3xl mb-16"
            data-purpose="article-audio"
            aria-label="Reproductor de audio"
          >
            <SoundCloudEmbed url={article.audioUrl} />
          </section>
        )}

        <article data-purpose="reading-area">
          <MarkdownBody source={article.body} />
        </article>

        {cusdisAppId ? (
          <section
            className="mt-24 max-w-3xl"
            data-purpose="article-comments"
            aria-labelledby="cusdis-heading"
          >
            <h2
              id="cusdis-heading"
              className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8"
            >
              Comentarios
            </h2>
            <CusdisComments
              appId={cusdisAppId}
              {...(cusdisHost ? { host: cusdisHost } : {})}
              pageId={slug}
              pageTitle={article.title}
              lang="es"
            />
          </section>
        ) : process.env.NODE_ENV === "development" ? (
          <p className="mt-24 max-w-3xl text-sm text-black/40">
            Cusdis: añade{" "}
            <code className="text-black/60">NEXT_PUBLIC_CUSDIS_APP_ID</code> en{" "}
            <code className="text-black/60">.env.local</code> (opcional:{" "}
            <code className="text-black/60">NEXT_PUBLIC_CUSDIS_HOST</code>,{" "}
            <code className="text-black/60">NEXT_PUBLIC_SITE_URL</code>).
          </p>
        ) : null}

        <footer
          className="mt-48 pt-12 border-t border-black/10 flex flex-col md:flex-row justify-between items-start gap-12"
          data-purpose="article-footer"
        >
          <div className="max-w-sm">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
              Sobre el autor
            </h2>
            <p className="text-sm leading-relaxed text-black/60">
              Luis escribe historias breves, ideas torcidas y pensamientos que probablemente deberían haberse quedado en su cabeza.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2">
              Compartir
            </h2>
            <div className="flex flex-col gap-2 items-start">
              <CopyLinkButton />
            </div>
          </div>
        </footer>
      </main>

      <SiteFooter />
    </div>
  );
}
