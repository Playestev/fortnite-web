import Link from "next/link";
import LegalFooter from "@/components/LegalFooter";

export default function LegalDocumentLayout({ eyebrow, title, description, updatedAt, children }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(0,255,102,0.14),_transparent_26%),linear-gradient(180deg,#000_0%,#021106_100%)] px-4 py-8 text-white sm:py-12">
      <article className="mx-auto max-w-4xl rounded-[28px] border border-[#1eff7a]/25 bg-[#04120d]/92 p-5 shadow-[0_0_40px_rgba(21,216,99,0.12)] sm:p-8">
        <Link
          href="/login"
          className="inline-flex rounded-xl border border-[#1eff7a]/25 bg-[#08140f] px-4 py-2 text-sm font-black text-[#67ff9a] transition hover:border-[#67ff9a] hover:text-white"
        >
          ← Volver al inicio
        </Link>

        <header className="mt-7 border-b border-[#1eff7a]/15 pb-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#67ff9a]">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-black italic sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{description}</p>
          <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-slate-400">
            Última actualización: {updatedAt}
          </p>
        </header>

        <div className="legal-content mt-7 space-y-7 text-sm leading-7 text-slate-200">
          {children}
        </div>

        <LegalFooter />
      </article>
    </main>
  );
}

export function LegalSection({ title, children }) {
  return (
    <section>
      <h2 className="text-xl font-black text-white">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function LegalList({ children }) {
  return <ul className="ml-5 list-disc space-y-2 text-slate-300">{children}</ul>;
}
