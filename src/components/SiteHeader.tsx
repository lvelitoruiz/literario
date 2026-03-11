import Link from "next/link";

export function SiteHeader() {
  return (
    <header
      className="pt-12 pb-24 px-6 md:px-12 lg:px-24"
      data-purpose="site-navigation"
    >
      <nav className="flex justify-between items-baseline">
        <h1 className="text-xs font-bold uppercase tracking-[0.2em]">
          <Link className="hover:opacity-60 transition-opacity" href="/">
            ZAHUMERIO / MANUSCRITO DIGITAL
          </Link>
        </h1>
        <ul className="flex gap-8 text-[10px] font-medium uppercase tracking-widest">
          <li>
            <Link className="hover:line-through" href="/categoria/ensayos">
              ENSAYOS
            </Link>
          </li>
          <li>
            <Link className="hover:line-through" href="/categoria/ficcion">
              RELATOS
            </Link>
          </li>
          <li>
            <Link className="hover:line-through" href="/categoria/cronicas">
              CRÓNICAS
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

