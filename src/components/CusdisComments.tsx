"use client";

import Script from "next/script";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

declare global {
  interface Window {
    renderCusdis?: (el: HTMLElement | null) => void;
  }
}

/**
 * Cusdis ya manda postMessage `resize`, pero a veces la altura queda corta y el iframe muestra scroll.
 * El iframe usa `srcdoc` (mismo origen que la página), así que podemos medir el documento interno
 * y fijar altura + overflow para que crezca con el contenido.
 */
function useCusdisIframeAutoHeight(
  containerRef: RefObject<HTMLDivElement | null>,
  appId: string,
  hostTrim: string,
  pageId: string,
  pageTitle: string,
  pageUrl: string,
  lang: string,
) {
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    let dispose: (() => void) | undefined;
    /** Cusdis reutiliza un iframe global; solo enlazamos listeners una vez por elemento. */
    const bound = new WeakSet<HTMLIFrameElement>();

    function bindIframe(iframe: HTMLIFrameElement) {
      if (bound.has(iframe)) return;
      bound.add(iframe);

      dispose?.();

      let cancelled = false;
      let ro: ResizeObserver | null = null;
      const timeouts: number[] = [];

      const sync = () => {
        if (cancelled) return;
        try {
          const doc = iframe.contentDocument;
          if (!doc?.documentElement) return;
          const h = Math.max(
            doc.documentElement.scrollHeight,
            doc.body?.scrollHeight ?? 0,
            doc.documentElement.offsetHeight,
          );
          if (h < 1) return;
          iframe.style.height = `${Math.ceil(h)}px`;
          iframe.style.overflow = "hidden";
          iframe.setAttribute("scrolling", "no");
        } catch {
          /* src distinto u otro origen: no medimos */
        }
      };

      const onLoad = () => {
        if (cancelled) return;
        ro?.disconnect();
        sync();
        try {
          const doc = iframe.contentDocument;
          if (!doc?.documentElement) return;
          ro = new ResizeObserver(() => sync());
          ro.observe(doc.documentElement);
          if (doc.body) ro.observe(doc.body);
        } catch {
          /* ignore */
        }
        [0, 50, 150, 300, 800].forEach((ms) => {
          timeouts.push(window.setTimeout(() => sync(), ms));
        });
      };

      iframe.addEventListener("load", onLoad);
      if (iframe.contentDocument?.readyState === "complete") {
        queueMicrotask(onLoad);
      }

      dispose = () => {
        cancelled = true;
        iframe.removeEventListener("load", onLoad);
        ro?.disconnect();
        timeouts.forEach((id) => window.clearTimeout(id));
      };
    }

    const mo = new MutationObserver(() => {
      const iframe = root.querySelector("iframe");
      if (iframe) bindIframe(iframe as HTMLIFrameElement);
    });
    mo.observe(root, { childList: true, subtree: true });

    const first = root.querySelector("iframe");
    if (first) bindIframe(first as HTMLIFrameElement);

    return () => {
      mo.disconnect();
      dispose?.();
    };
  }, [appId, hostTrim, pageId, pageTitle, pageUrl, lang, containerRef]);
}

type CusdisCommentsProps = {
  appId: string;
  /** Instancia Cusdis (hosted por defecto). Auto-hospedado: ej. https://cusdis.tudominio.com */
  host?: string;
  pageId: string;
  pageTitle: string;
  /**
   * URL del post para formar la "página/hilo" en Cusdis.
   * Si se omite, se usará `window.location.href` (útil con multi-dominio).
   */
  pageUrl?: string;
  /** Código de idioma del widget (ej. es). Ver https://cusdis.com/js/widget/lang/ */
  lang?: string;
};

function runRender(el: HTMLElement | null) {
  window.renderCusdis?.(el);
}

function ensureLangScript(hostTrim: string, code: string): Promise<void> {
  const src = `${hostTrim}/js/widget/lang/${code}.js`;
  if (document.querySelector(`script[src="${src}"]`)) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Cusdis lang script failed: ${src}`));
    document.body.appendChild(s);
  });
}

export function CusdisComments({
  appId,
  host = "https://cusdis.com",
  pageId,
  pageTitle,
  pageUrl,
  lang = "es",
}: CusdisCommentsProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const hostTrim = host.replace(/\/$/, "");
  const mainSrc = `${hostTrim}/js/cusdis.es.js`;

  const [resolvedPageUrl] = useState<string>(
    () => {
      if (pageUrl) return pageUrl;
      if (typeof window !== "undefined") return window.location.href;
      return "";
    },
  );

  useCusdisIframeAutoHeight(
    divRef,
    appId,
    hostTrim,
    pageId,
    pageTitle,
    resolvedPageUrl,
    lang,
  );

  useLayoutEffect(() => {
    if (!resolvedPageUrl) return;
    runRender(divRef.current);
  }, [appId, hostTrim, pageId, pageTitle, resolvedPageUrl, lang]);

  const onMainReady = () => {
    if (!lang) {
      if (resolvedPageUrl) runRender(divRef.current);
      return;
    }
    void ensureLangScript(hostTrim, lang)
      .then(() => {
        if (resolvedPageUrl) runRender(divRef.current);
      })
      .catch(() => {
        if (resolvedPageUrl) runRender(divRef.current);
      });
  };

  return (
    <>
      <div
        ref={divRef}
        id="cusdis_thread"
        className="[&_iframe]:block [&_iframe]:w-full [&_iframe]:max-w-none"
        data-host={hostTrim}
        data-app-id={appId}
        data-page-id={pageId}
        data-page-title={pageTitle}
        data-page-url={resolvedPageUrl}
      />
      <Script src={mainSrc} strategy="lazyOnload" onReady={onMainReady} />
    </>
  );
}
