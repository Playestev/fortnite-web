"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import {
  Check,
  CheckCheck,
  MessageCircle,
  Send,
  UserRound,
  X,
} from "lucide-react";

function formatDateTime(value) {
  if (!value) return "";

  try {
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function getProfileName(profile = {}) {
  return profile?.ganker_user || profile?.display_name || profile?.fortnite_user || "Usuario GKG";
}

function getInitials(name = "GKG") {
  return String(name)
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getMessageStatusLabel(message = {}, viewerId = "") {
  if (message.sender_id !== viewerId) return "";
  if (message.read_at) return `Leído ${formatDateTime(message.read_at)}`;
  if (message.delivered_at) return "Recibido";
  return "Enviado";
}

export default function GkgMessagesButton({ className = "" }) {
  const supabase = useMemo(() => createClient(), []);
  const panelRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewerId, setViewerId] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activePeerId, setActivePeerId] = useState("");
  const [text, setText] = useState("");
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!open || typeof document === "undefined") return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const activeConversation = useMemo(() => {
    return conversations.find((conversation) => conversation.peer_id === activePeerId) || null;
  }, [conversations, activePeerId]);

  const activeMessages = useMemo(() => {
    if (!activePeerId) return [];

    return messages
      .filter((message) => {
        const peerId = message.sender_id === viewerId ? message.receiver_id : message.sender_id;
        return peerId === activePeerId;
      })
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [messages, activePeerId, viewerId]);

  const acceptedActiveMessages = useMemo(() => {
    return activeMessages.filter((message) => message.status === "accepted");
  }, [activeMessages]);

  const pendingReceived = useMemo(() => {
    return activeMessages.filter(
      (message) => message.status === "pending" && message.receiver_id === viewerId
    );
  }, [activeMessages, viewerId]);

  const pendingSent = useMemo(() => {
    return activeMessages.filter(
      (message) => message.status === "pending" && message.sender_id === viewerId
    );
  }, [activeMessages, viewerId]);

  const hasAcceptedChat = Boolean(activeConversation?.accepted || acceptedActiveMessages.length);

  const fetchWithAuth = useCallback(
    async (url, options = {}) => {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;

      if (!token) throw new Error("Inicia sesión nuevamente.");

      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
      });

      const payload = await response.json();

      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || "No se pudo procesar la solicitud.");
      }

      return payload;
    },
    [supabase]
  );

  const applyPayload = useCallback((payload = {}) => {
    const nextMessages = payload.messages || [];
    const nextConversations = payload.conversations || [];

    setViewerId(payload.viewer_id || "");
    setMessages(nextMessages);
    setConversations(nextConversations);
    setUnreadCount(payload.unread_count || 0);

    setActivePeerId((current) => {
      if (current && nextConversations.some((conversation) => conversation.peer_id === current)) {
        return current;
      }

      return nextConversations[0]?.peer_id || "";
    });
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const payload = await fetchWithAuth("/api/gkg-messages");
      applyPayload(payload);
    } catch (error) {
      setNotice(error.message || "No se pudieron cargar los mensajes.");
    }
  }, [applyPayload, fetchWithAuth]);

  useEffect(() => {
    loadMessages();
    const interval = window.setInterval(loadMessages, 30000);
    return () => window.clearInterval(interval);
  }, [loadMessages]);

  async function runAction(payload) {
    setSending(true);
    setNotice("");

    try {
      const response = await fetchWithAuth("/api/gkg-messages", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      applyPayload(response);
      return response;
    } catch (error) {
      setNotice(error.message || "No se pudo actualizar el chat.");
      return null;
    } finally {
      setSending(false);
    }
  }

  async function markConversationRead(peerId) {
    if (!peerId) return;

    try {
      const response = await fetchWithAuth("/api/gkg-messages", {
        method: "POST",
        body: JSON.stringify({ action: "mark_read", peer_id: peerId }),
      });
      applyPayload(response);
    } catch {
      // No mostramos error para no interrumpir el chat.
    }
  }

  useEffect(() => {
    if (!open || !activePeerId || !activeConversation?.unread) return;
    markConversationRead(activePeerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activePeerId, activeConversation?.unread]);

  async function acceptMessage(messageId) {
    const response = await runAction({ action: "accept_message", message_id: messageId });
    if (response) setNotice("Mensaje aceptado. Ya pueden chatear en privado.");
  }

  async function rejectMessage(messageId) {
    const response = await runAction({ action: "reject_message", message_id: messageId });
    if (response) setNotice("Mensaje eliminado.");
  }

  async function sendMessage(event) {
    event.preventDefault();

    if (!activePeerId || !text.trim()) return;

    const response = await runAction({
      action: "send_message",
      receiver_profile_id: activePeerId,
      message: text.trim(),
    });

    if (response) setText("");
  }

  const modal = mounted && open ? createPortal(
    <div
      className="fixed inset-0 flex justify-center bg-black/58 px-3 py-3 backdrop-blur-[2px] sm:justify-end sm:px-5 sm:py-4"
      style={{ zIndex: 2147483647 }}
      role="dialog"
      aria-modal="true"
      aria-label="Mensajes privados Ganker Games"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={() => setOpen(false)}
        aria-label="Cerrar mensajes privados"
      />

      <section
        ref={panelRef}
        className="relative mt-[58px] flex h-[calc(100vh-82px)] w-full max-w-[760px] overflow-hidden rounded-[28px] border border-white/80 bg-[#001b0c] text-white shadow-[0_0_55px_rgba(30,255,122,.28)] sm:mt-[64px] lg:max-w-[860px]"
        onClick={(event) => event.stopPropagation()}
      >
        <aside className="hidden w-[285px] shrink-0 border-r border-[#1eff7a]/18 bg-[#020804]/92 md:block">
          <div className="border-b border-[#1eff7a]/18 p-4">
            <h2 className="text-2xl font-black italic tracking-tight">Mensajes</h2>
            <p className="text-xs text-zinc-400">Chats privados de Ganker Games.</p>
          </div>

          <div className="h-[calc(100%-77px)] overflow-y-auto p-3">
            {conversations.length === 0 ? (
              <p className="rounded-2xl border border-white/15 bg-black/30 p-4 text-sm text-zinc-400">
                Aún no tienes mensajes privados.
              </p>
            ) : (
              conversations.map((conversation) => {
                const name = getProfileName(conversation.peer);
                const active = conversation.peer_id === activePeerId;
                const lastMessage = conversation.last_message;
                const badgeCount = Number(conversation.unread || 0) + Number(conversation.pending_received || 0);

                return (
                  <button
                    type="button"
                    key={conversation.peer_id}
                    onClick={() => setActivePeerId(conversation.peer_id)}
                    className={`mb-2 flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                      active
                        ? "border-[#1eff7a]/70 bg-[#1eff7a]/16 shadow-[0_0_18px_rgba(30,255,122,.13)]"
                        : "border-white/12 bg-black/25 hover:border-[#1eff7a]/45 hover:bg-[#062614]"
                    }`}
                  >
                    {conversation.peer?.avatar_url ? (
                      <img
                        src={conversation.peer.avatar_url}
                        alt={name}
                        className="h-11 w-11 rounded-full border border-[#1eff7a]/30 object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1eff7a] text-sm font-black text-black">
                        {getInitials(name)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-black text-white">{name}</p>
                        {badgeCount > 0 ? (
                          <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white">
                            {badgeCount}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-zinc-400">
                        {lastMessage?.status === "pending"
                          ? lastMessage.sender_id === viewerId
                            ? "Esperando aceptación"
                            : "Solicitud pendiente"
                          : lastMessage?.message || "Chat privado"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-[#020804]/96">
          <header className="flex items-center justify-between gap-3 border-b border-white/80 bg-[#00220f] p-4">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#63ff9b]">Chat privado</p>
              <h3 className="truncate text-xl font-black italic">
                {activeConversation ? getProfileName(activeConversation.peer) : "Mensajes GKG"}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-2xl border border-white/80 bg-[#021509] p-3 text-white transition hover:border-[#1eff7a] hover:text-[#63ff9b]"
              aria-label="Cerrar mensajes"
            >
              <X size={20} />
            </button>
          </header>

          <div className="border-b border-[#1eff7a]/18 bg-black/35 p-3 md:hidden">
            <select
              value={activePeerId}
              onChange={(event) => setActivePeerId(event.target.value)}
              className="w-full rounded-2xl border border-white/20 bg-zinc-950 px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#1eff7a]"
            >
              {conversations.length === 0 ? (
                <option value="">Sin conversaciones</option>
              ) : (
                conversations.map((conversation) => (
                  <option key={conversation.peer_id} value={conversation.peer_id}>
                    {getProfileName(conversation.peer)}
                  </option>
                ))
              )}
            </select>
          </div>

          {notice ? (
            <div className="mx-4 mt-3 rounded-2xl border border-[#1eff7a]/28 bg-[#1eff7a]/12 px-4 py-3 text-sm font-semibold text-emerald-100">
              {notice}
            </div>
          ) : null}

          <div className="flex-1 overflow-y-auto p-4">
            {!activeConversation ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-zinc-400">
                <MessageCircle className="mb-3 text-[#63ff9b]" size={42} />
                <p className="text-lg font-black text-white">Sin conversación seleccionada</p>
                <p className="mt-1 max-w-sm text-sm">
                  Cuando alguien te escriba por Espíritus GKG, podrás aceptar o eliminar el mensaje desde aquí.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingReceived.map((message) => (
                  <div
                    key={message.id}
                    className="rounded-[24px] border border-yellow-300/35 bg-yellow-300/10 p-4"
                  >
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-100">
                      Solicitud de mensaje
                    </p>
                    {message.spirit?.name ? (
                      <p className="mt-1 text-xs font-bold text-[#63ff9b]">Espíritu: {message.spirit.name}</p>
                    ) : null}
                    <p className="mt-3 text-sm text-zinc-100">{message.message}</p>
                    <p className="mt-2 text-xs text-zinc-400">{formatDateTime(message.created_at)}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => acceptMessage(message.id)}
                        disabled={sending}
                        className="rounded-2xl bg-[#1eff7a] px-4 py-2 text-xs font-black text-black transition hover:bg-[#63ff9b] disabled:opacity-60"
                      >
                        Aceptar mensaje
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectMessage(message.id)}
                        disabled={sending}
                        className="rounded-2xl border border-red-400/40 bg-red-400/10 px-4 py-2 text-xs font-black text-red-100 transition hover:bg-red-400/20 disabled:opacity-60"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}

                {pendingSent.length > 0 && !hasAcceptedChat ? (
                  <div className="rounded-[24px] border border-white/15 bg-white/[0.04] p-4 text-sm text-zinc-300">
                    <p className="font-black text-white">Solicitud enviada</p>
                    <p className="mt-1">La otra persona debe aceptar tu mensaje para abrir el chat privado.</p>
                  </div>
                ) : null}

                {acceptedActiveMessages.map((message) => {
                  const isMine = message.sender_id === viewerId;
                  const statusLabel = getMessageStatusLabel(message, viewerId);

                  return (
                    <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[84%] rounded-[22px] border px-4 py-3 text-sm shadow-lg ${
                          isMine
                            ? "border-[#1eff7a]/35 bg-[#1eff7a]/16 text-emerald-50"
                            : "border-white/15 bg-white/[0.06] text-zinc-100"
                        }`}
                      >
                        {message.spirit?.name ? (
                          <p className="mb-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#63ff9b]">
                            {message.spirit.name}
                          </p>
                        ) : null}
                        <p className="whitespace-pre-wrap break-words">{message.message}</p>
                        <div className="mt-2 flex items-center justify-end gap-1 text-[11px] text-zinc-400">
                          <span>{formatDateTime(message.created_at)}</span>
                          {isMine ? (
                            <>
                              {message.read_at ? (
                                <CheckCheck size={15} className="text-[#63ff9b]" />
                              ) : (
                                <Check size={15} className="text-zinc-400" />
                              )}
                              <span>{statusLabel}</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="border-t border-white/80 bg-[#00220f] p-4">
            {hasAcceptedChat ? (
              <div className="flex items-end gap-2">
                <textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  maxLength={800}
                  rows={1}
                  placeholder="Escribe un mensaje privado..."
                  className="max-h-32 min-h-[48px] flex-1 resize-none rounded-2xl border border-white/20 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#1eff7a]"
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#1eff7a] px-4 text-sm font-black text-black transition hover:bg-[#63ff9b] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={18} />
                  <span className="hidden sm:inline">Enviar</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.04] p-3 text-sm text-zinc-400">
                <UserRound size={18} />
                <p>Para escribir, primero debe aceptarse la solicitud de mensaje.</p>
              </div>
            )}
          </form>
        </div>
      </section>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          loadMessages();
        }}
        className={`relative inline-flex h-11 w-11 items-center justify-center gap-2 rounded-2xl border border-[#1eff7a]/40 bg-[#021509] text-[#63ff9b] shadow-[0_0_20px_rgba(30,255,122,.14)] transition hover:border-[#63ff9b] hover:bg-[#063115] sm:h-12 sm:w-auto sm:px-4 ${className}`}
        title="Mensajes privados"
        aria-label="Mensajes privados"
      >
        <MessageCircle size={20} />
        <span className="hidden sm:inline">Mensaje</span>
        {unreadCount > 0 ? (
          <span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-black text-white ring-2 ring-black">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {modal}
    </>
  );
}
