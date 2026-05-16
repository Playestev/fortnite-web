"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthButton() {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user || null);
      setLoading(false);
    }

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  if (loading) {
    return (
      <div className="hidden h-11 rounded-2xl border border-[#1eff7a]/25 bg-[#07140f]/80 px-4 py-3 text-xs font-black text-[#67ff9a] md:flex md:items-center">
        ...
      </div>
    );
  }

  return (
    <Link
      href={user ? "/perfil" : "/login"}
      className="hidden h-11 items-center justify-center rounded-2xl border border-[#1eff7a]/35 bg-[#07140f] px-4 text-xs font-black uppercase tracking-wide text-[#67ff9a] shadow-[0_0_18px_rgba(21,216,99,0.10)] transition hover:border-[#67ff9a] hover:bg-[#0b1f15] hover:text-white md:flex md:h-12"
    >
      {user ? "Mi perfil" : "Iniciar sesión"}
    </Link>
  );
}