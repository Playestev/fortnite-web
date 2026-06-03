import Link from "next/link";

export default function LegalFooter({ compact = false }) {
  return (
    <footer
      className={`${compact ? "mt-5" : "mt-10"} border-t border-[#1eff7a]/15 pt-4 text-center text-xs leading-6 text-slate-400`}
    >
      <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <Link className="transition hover:text-[#67ff9a]" href="/aviso-de-privacidad">
          Aviso de privacidad
        </Link>
        <span aria-hidden="true">•</span>
        <Link className="transition hover:text-[#67ff9a]" href="/terminos-de-uso">
          Términos de uso
        </Link>
        <span aria-hidden="true">•</span>
        <Link className="transition hover:text-[#67ff9a]" href="/politica-de-cookies">
          Política de cookies
        </Link>
        <span aria-hidden="true">•</span>
        <Link className="transition hover:text-[#67ff9a]" href="/aviso-legal">
          Aviso legal
        </Link>
      </nav>

      <p className="mt-2">© {new Date().getFullYear()} Ganker Games. Todos los derechos reservados.</p>
    </footer>
  );
}
