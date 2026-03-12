import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ThinDivider } from "@/components/ThinDivider";

interface HaylaAccessPageProps {
  searchParams?: {
    error?: string;
    from?: string;
  };
}

export default function HaylaAccessPage({ searchParams }: HaylaAccessPageProps) {
  const hasError = searchParams?.error === "1";
  const from = searchParams?.from || "/categoria/hayla";

  return (
    <div className="font-sans bg-white text-black min-h-screen selection:bg-black selection:text-white">
      <SiteHeader />

      <main className="px-6 md:px-12 lg:px-24 pb-32">
        <header className="mb-12">
          <p className="text-[10px] uppercase tracking-[0.3em] mb-4">
            Acceso restringido
          </p>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-normal tracking-tight max-w-3xl">
            Para leer esta categoría necesitas una clave.
          </h1>
        </header>

        <ThinDivider />

        <section className="mt-16 max-w-md space-y-6">
          <p className="text-sm text-black/70 leading-relaxed">
            Ingresa la clave para acceder a los textos de la categoría{" "}
            <span className="uppercase tracking-[0.3em] text-xs">HAYLA</span>.
          </p>

          {hasError && (
            <p className="text-xs text-red-600 uppercase tracking-[0.2em]">
              Clave incorrecta. Inténtalo de nuevo.
            </p>
          )}

          <form
            method="POST"
            action="/api/hayla-auth"
            className="space-y-4"
          >
            <input type="hidden" name="from" value={from} />
            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-[10px] uppercase tracking-[0.3em]"
              >
                Clave
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full border border-black/20 px-3 py-2 text-sm tracking-wide focus:outline-none focus:border-black"
              />
            </div>

            <button
              type="submit"
              className="text-[10px] uppercase tracking-[0.3em] border border-black px-5 py-2 hover:bg-black hover:text-white transition-colors"
            >
              Entrar
            </button>
          </form>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

