import Link from "next/link";

export function CategoryPagination({
  baseHref,
  currentPage,
  totalPages,
}: {
  baseHref: string;
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const lastPage = totalPages;

  function hrefForPage(page: number) {
    // Para la página 1 preferimos el href “limpio” (sin ?page=1).
    if (page === 1) return baseHref;
    return `${baseHref}?page=${page}`;
  }

  return (
    <nav className="mt-14 flex justify-end" aria-label="Paginación">
      <div className="flex items-center gap-2">
        <Link
          href={hrefForPage(1)}
          className="text-[10px] uppercase tracking-[0.3em] border border-black px-4 py-2 hover:border-[#7AA5BF] hover:text-[#7AA5BF] transition-colors duration-200 ease-out"
        >
          Inicio
        </Link>

        <div className="flex flex-wrap justify-center gap-2 items-center">
          {pages.map((p) => {
            const isActive = p === currentPage;

            return isActive ? (
              <span
                key={p}
                className="text-[10px] uppercase tracking-[0.3em] border border-black px-4 py-2 bg-black text-white"
                aria-current="page"
              >
                {p}
              </span>
            ) : (
              <Link
                key={p}
                href={hrefForPage(p)}
                className="text-[10px] uppercase tracking-[0.3em] border border-black px-4 py-2 hover:border-[#7AA5BF] hover:text-[#7AA5BF] transition-colors duration-200 ease-out"
              >
                {p}
              </Link>
            );
          })}
        </div>

        <Link
          href={hrefForPage(lastPage)}
          className="text-[10px] uppercase tracking-[0.3em] border border-black px-4 py-2 hover:border-[#7AA5BF] hover:text-[#7AA5BF] transition-colors duration-200 ease-out"
        >
          Final
        </Link>
      </div>
    </nav>
  );
}

