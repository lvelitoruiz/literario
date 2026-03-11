export function SiteFooter() {
  return (
    <footer
      className="px-6 md:px-12 lg:px-24 py-12 border-t border-black/10"
      data-purpose="site-info"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
        <div className="max-w-sm">
          <p className="text-[10px] uppercase tracking-widest leading-relaxed">
            Una colección de escritos centrados en el minimalismo, la literatura
            y la intersección de la forma física y digital.
          </p>
        </div>
        <div className="flex flex-col gap-4 items-start md:items-end">
          <div className="flex gap-6 text-[10px] uppercase tracking-widest">
            {/* <a className="hover:underline" href="#">
              Instagram
            </a>
            <a className="hover:underline" href="#">
              Newsletter
            </a>
            <a className="hover:underline" href="#">
              RSS
            </a> */}
          </div>
          <p className="text-[10px] opacity-40">
            © {new Date().getFullYear()} Archivo. Ningún derecho reservado.
          </p>
        </div>
      </div>
    </footer>
  );
}

