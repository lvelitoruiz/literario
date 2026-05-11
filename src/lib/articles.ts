import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export type ArticleKind =
  | "ENSAYO"
  | "FICCIÓN"
  | "TEORÍA"
  | "RELATO"
  | "CRÓNICA"
  | "HAYLA"
  | "PODCAST";

export const ARTICLE_KINDS: readonly ArticleKind[] = [
  "ENSAYO",
  "FICCIÓN",
  "TEORÍA",
  "RELATO",
  "CRÓNICA",
  "HAYLA",
  "PODCAST",
] as const;

export interface Article {
  id: string;
  slug: string;
  indexNumber: string;
  year: string;
  kind: ArticleKind;
  title: string;
  summary: string;
  author: string;
  publishedAt: string;
  draft: boolean;
  body: string;
  audioUrl?: string;
  episodeNumber?: number;
  audioDurationSec?: number;
}

export interface ArticleQueryOptions {
  /**
   * Si es true, incluye también los posts marcados como borrador en el
   * frontmatter (`draft: true`). Por defecto los excluye.
   * Solo usar en rutas internas / de preview.
   */
  includeDrafts?: boolean;
}

const CONTENT_DIR = path.join(process.cwd(), "content");

let cache: Article[] | null = null;

function isArticleKind(value: unknown): value is ArticleKind {
  return typeof value === "string" && (ARTICLE_KINDS as readonly string[]).includes(value);
}

async function loadAll(): Promise<Article[]> {
  if (cache && process.env.NODE_ENV === "production") {
    return cache;
  }

  const files = await fs.readdir(CONTENT_DIR);
  const articles: Article[] = [];

  for (const file of files) {
    if (!file.endsWith(".md")) continue;

    const raw = await fs.readFile(path.join(CONTENT_DIR, file), "utf8");
    const { data, content } = matter(raw);

    // descarta archivos sin frontmatter (huérfanos / borradores)
    if (!data || Object.keys(data).length === 0) continue;
    if (typeof data.slug !== "string" || typeof data.title !== "string") continue;
    if (!isArticleKind(data.kind)) continue;

    const article: Article = {
      id: String(data.id ?? data.slug),
      slug: data.slug,
      indexNumber: String(data.indexNumber ?? ""),
      year: String(data.year ?? ""),
      kind: data.kind,
      title: data.title,
      summary: typeof data.summary === "string" ? data.summary : "",
      author: typeof data.author === "string" ? data.author : "Luis",
      publishedAt: typeof data.publishedAt === "string" ? data.publishedAt : "",
      draft: data.draft === true,
      body: content,
      audioUrl: typeof data.audioUrl === "string" ? data.audioUrl : undefined,
      episodeNumber:
        typeof data.episodeNumber === "number" ? data.episodeNumber : undefined,
      audioDurationSec:
        typeof data.audioDurationSec === "number" ? data.audioDurationSec : undefined,
    };

    articles.push(article);
  }

  // orden estable por indexNumber ascendente; el consumidor decide si invertir
  articles.sort((a, b) => {
    const ai = Number.parseInt(a.indexNumber, 10);
    const bi = Number.parseInt(b.indexNumber, 10);
    if (Number.isFinite(ai) && Number.isFinite(bi)) return ai - bi;
    return a.slug.localeCompare(b.slug);
  });

  cache = articles;
  return articles;
}

function applyVisibility<T extends { draft: boolean }>(
  list: T[],
  options?: ArticleQueryOptions,
): T[] {
  if (options?.includeDrafts) return list;
  return list.filter((a) => !a.draft);
}

export async function getAllArticles(
  options?: ArticleQueryOptions,
): Promise<Article[]> {
  const all = await loadAll();
  return applyVisibility(all, options);
}

export async function getArticleSummaries(
  options?: ArticleQueryOptions,
): Promise<Omit<Article, "body">[]> {
  const all = await loadAll();
  return applyVisibility(all, options).map(({ body: _body, ...rest }) => rest);
}

export async function getArticleBySlug(
  slug: string,
  options?: ArticleQueryOptions,
): Promise<Article | null> {
  const all = await loadAll();
  const article = all.find((a) => a.slug === slug);
  if (!article) return null;
  if (article.draft && !options?.includeDrafts) return null;
  return article;
}

export async function getArticlesByKind(
  kinds: ArticleKind[],
  options?: ArticleQueryOptions,
): Promise<Article[]> {
  const all = await loadAll();
  return applyVisibility(all, options).filter((a) => kinds.includes(a.kind));
}

/**
 * Devuelve los slugs de artículos publicados (no borradores). Se usa para
 * generateStaticParams: los borradores no deben tener URL prerenderizada.
 */
export async function getAllSlugs(): Promise<string[]> {
  const all = await loadAll();
  return all.filter((a) => !a.draft).map((a) => a.slug);
}
