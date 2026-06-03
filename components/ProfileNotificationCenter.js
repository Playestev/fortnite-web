"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  BadgeCheck,
  Bell,
  CheckCheck,
  ChevronRight,
  Clock3,
  Crown,
  Gift,
  Ticket,
  Trash2,
  Trophy,
  UserPlus,
  X,
  Zap,
} from "lucide-react";

const DELETE_REVEAL_WIDTH = 86;
const DESKTOP_BREAKPOINT = 768;

function isSameLocalDay(dateValue, compareDate = new Date()) {
  const date = new Date(dateValue);

  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === compareDate.getFullYear() &&
    date.getMonth() === compareDate.getMonth() &&
    date.getDate() === compareDate.getDate()
  );
}

function formatNotificationDate(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "Fecha no disponible";

  if (isSameLocalDay(date)) {
    return new Intl.DateTimeFormat("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getNotificationVisual(type) {
  const visuals = {
    follower_new: {
      icon: UserPlus,
      bubble: "bg-cyan-950 text-cyan-100 border-cyan-300/55",
    },
    reward_new: {
      icon: Gift,
      bubble: "bg-fuchsia-950 text-fuchsia-100 border-fuchsia-300/55",
    },
    reward_status: {
      icon: BadgeCheck,
      bubble: "bg-sky-950 text-sky-100 border-sky-300/55",
    },
    giveaway_winner: {
      icon: Trophy,
      bubble: "bg-yellow-950 text-yellow-100 border-yellow-300/55",
    },
    giveaway_entry: {
      icon: Ticket,
      bubble: "bg-violet-950 text-violet-100 border-violet-300/55",
    },
    vip_active: {
      icon: Crown,
      bubble: "bg-emerald-950 text-emerald-100 border-emerald-300/55",
    },
    vip_extended: {
      icon: Crown,
      bubble: "bg-emerald-950 text-emerald-100 border-emerald-300/55",
    },
    vip_expiring: {
      icon: Clock3,
      bubble: "bg-orange-950 text-orange-100 border-orange-300/55",
    },
    vip_expired: {
      icon: Clock3,
      bubble: "bg-red-950 text-red-100 border-red-300/55",
    },
    vip_milestone: {
      icon: Crown,
      bubble: "bg-yellow-950 text-yellow-100 border-yellow-300/55",
    },
    vip_reward: {
      icon: Gift,
      bubble: "bg-emerald-950 text-emerald-100 border-emerald-300/55",
    },
    important_update: {
      icon: Zap,
      bubble: "bg-[#063b1b] text-[#8cffad] border-[#1eff7a]/55",
    },
  };

  return (
    visuals[type] || {
      icon: Bell,
      bubble: "bg-[#063b1b] text-[#8cffad] border-[#1eff7a]/55",
    }
  );
}

function getNotificationDestination(item) {
  const metadata = item?.metadata || {};
  const type = String(item?.notification_type || "");

  if (type === "follower_new") {
    const slug =
      metadata.actor_slug ||
      metadata.public_profile_number ||
      metadata.ganker_user ||
      item.actor_profile_id ||
      "";

    if (slug) {
      return {
        href: `/perfil/publico/${encodeURIComponent(String(slug))}`,
      };
    }

    return { tab: "Comunidad" };
  }

  if (
    type === "vip_active" ||
    type === "vip_extended" ||
    type === "vip_expiring" ||
    type === "vip_expired" ||
    type === "vip_milestone"
  ) {
    return { tab: "VIP" };
  }

  if (type === "vip_reward" || type === "reward_new" || type === "reward_status") {
    return { tab: "Premios" };
  }

  if (type === "giveaway_winner" || type === "giveaway_entry") {
    return { tab: "Sorteos" };
  }

  if (type === "important_update") {
    return { tab: "Perfil" };
  }

  if (item?.action_tab) {
    return { tab: item.action_tab };
  }

  return null;
}

async function tryRpcOrFallback({ rpcRequest, fallbackRequest }) {
  const rpcResult = await rpcRequest();

  if (!rpcResult?.error) return rpcResult;

  console.warn("Notification RPC fallback:", rpcResult.error.message);

  const fallbackResult = await fallbackRequest();

  if (fallbackResult?.error) throw fallbackResult.error;

  return fallbackResult;
}

function NotificationCard({ item, onOpen, onDelete, deleting }) {
  const visual = getNotificationVisual(item.notification_type);
  const Icon = visual.icon;
  const [dragOffset, setDragOffset] = useState(0);
  const gestureRef = useRef(null);
  const suppressClickRef = useRef(false);

  function closeDeleteAction() {
    setDragOffset(0);
  }

  function handlePointerDown(event) {
    if (event.pointerType === "mouse") return;

    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      initialOffset: dragOffset,
      currentOffset: dragOffset,
      mode: null,
    };

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Algunos navegadores móviles no requieren captura explícita.
    }
  }

  function handlePointerMove(event) {
    const gesture = gestureRef.current;

    if (!gesture || gesture.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;

    if (!gesture.mode && (Math.abs(deltaX) > 7 || Math.abs(deltaY) > 7)) {
      gesture.mode = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
    }

    if (gesture.mode !== "horizontal") return;

    const nextOffset = Math.max(
      -DELETE_REVEAL_WIDTH,
      Math.min(0, gesture.initialOffset + deltaX)
    );

    gesture.currentOffset = nextOffset;
    setDragOffset(nextOffset);
  }

  function finishPointerGesture(event) {
    const gesture = gestureRef.current;

    if (!gesture || gesture.pointerId !== event.pointerId) return;

    if (gesture.mode === "horizontal") {
      const shouldReveal = gesture.currentOffset <= -38;
      setDragOffset(shouldReveal ? -DELETE_REVEAL_WIDTH : 0);
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 220);
    }

    gestureRef.current = null;
  }

  function handleCardClick() {
    if (suppressClickRef.current) return;

    if (dragOffset < 0) {
      closeDeleteAction();
      return;
    }

    onOpen(item);
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#4a1010] md:rounded-2xl">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDelete(item.id);
        }}
        disabled={deleting}
        className="absolute inset-y-0 right-0 flex w-[86px] items-center justify-center gap-1 bg-[#a61b1b] px-2 text-xs font-black text-red-50 transition hover:bg-[#c82727] disabled:opacity-60 md:hidden"
        aria-label={`Borrar notificación: ${item.title}`}
      >
        <Trash2 size={16} />
        Borrar
      </button>

      <article
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleCardClick();
          }
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointerGesture}
        onPointerCancel={finishPointerGesture}
        className={`relative cursor-pointer select-none rounded-3xl border px-3 py-3 text-left transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out md:rounded-2xl md:px-3 md:py-2.5 ${
          item.is_read
            ? "border-[#0b5f35] bg-[#001309] hover:bg-[#001a0e]"
            : "border-[#16c96a] bg-[#002313] shadow-[0_0_16px_rgba(22,201,106,.12)] hover:bg-[#002b18]"
        }`}
        style={{
          transform: `translateX(${dragOffset}px)`,
          touchAction: "pan-y",
          backgroundColor: item.is_read ? "#001309" : "#002313",
        }}
      >
        <div className="flex items-start gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border md:h-9 md:w-9 ${visual.bubble}`}
          >
            <Icon size={17} />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <strong className="min-w-0 flex-1 text-[13px] font-black leading-4 text-white">
                {item.title}
              </strong>

              {!item.is_read && (
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,.85)]" />
              )}
            </div>

            <p className="mt-1 line-clamp-2 text-xs leading-4 text-zinc-300">
              {item.message}
            </p>

            <p className="mt-1.5 text-[11px] font-bold text-[#67ff9a]">
              {formatNotificationDate(item.created_at)}
            </p>
          </div>

          <div className="hidden shrink-0 items-center gap-1 md:flex">
            <ChevronRight size={15} className="text-[#67ff9a]/70" />
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(item.id);
              }}
              disabled={deleting}
              className="rounded-lg border border-red-400/30 bg-[#310808] p-1.5 text-red-200 transition hover:bg-[#501010] disabled:opacity-60"
              aria-label={`Borrar notificación: ${item.title}`}
              title="Borrar notificación"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

function NotificationSection({ title, items, onOpen, onDelete, deletingId }) {
  if (!items.length) return null;

  return (
    <section className="mt-4 first:mt-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#67ff9a]">
          {title}
        </h3>
        <span className="text-[10px] font-black text-zinc-500">{items.length}</span>
      </div>

      <div className="grid gap-2 md:gap-1.5">
        {items.map((item) => (
          <NotificationCard
            key={item.id}
            item={item}
            onOpen={onOpen}
            onDelete={onDelete}
            deleting={deletingId === item.id}
          />
        ))}
      </div>
    </section>
  );
}

export default function ProfileNotificationCenter({
  supabase,
  userId,
  onNavigateTab,
}) {
  const triggerRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [deletingRead, setDeletingRead] = useState(false);
  const [desktopPosition, setDesktopPosition] = useState({ top: 72, right: 12 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateDesktopPosition = useCallback(() => {
    if (typeof window === "undefined" || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();

    setDesktopPosition({
      top: Math.max(68, Math.round(rect.bottom + 8)),
      right: Math.max(12, Math.round(window.innerWidth - rect.right)),
    });
  }, []);

  const closePanel = useCallback(() => {
    if (closing) return;

    setClosing(true);
    window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 190);
  }, [closing]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") closePanel();
    }

    function handleResize() {
      updateDesktopPosition();
    }

    const isMobile = window.innerWidth < DESKTOP_BREAKPOINT;
    const previousOverflow = document.body.style.overflow;

    if (isMobile) {
      document.body.style.overflow = "hidden";
    }

    updateDesktopPosition();
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [closePanel, open, updateDesktopPosition]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications]
  );

  const readCount = useMemo(
    () => notifications.filter((item) => item.is_read).length,
    [notifications]
  );

  const visibleNotifications = useMemo(
    () =>
      filter === "unread"
        ? notifications.filter((item) => !item.is_read)
        : notifications,
    [filter, notifications]
  );

  const groups = useMemo(() => {
    const today = new Date();

    return {
      newItems: visibleNotifications.filter((item) => !item.is_read),
      todayItems: visibleNotifications.filter(
        (item) => item.is_read && isSameLocalDay(item.created_at, today)
      ),
      olderItems: visibleNotifications.filter(
        (item) => item.is_read && !isSameLocalDay(item.created_at, today)
      ),
    };
  }, [visibleNotifications]);

  const loadNotifications = useCallback(async () => {
    if (!supabase || !userId) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { error: syncError } = await supabase.rpc(
        "sync_my_profile_notifications"
      );

      if (syncError) {
        console.warn("Notification sync warning:", syncError.message);
      }

      const { data, error } = await supabase
        .from("profile_notifications")
        .select(
          "id, profile_id, actor_profile_id, notification_type, title, message, action_tab, metadata, is_read, read_at, created_at"
        )
        .eq("profile_id", userId)
        .order("created_at", { ascending: false })
        .limit(150);

      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error("Notification load error:", error);
      setMessage(error.message || "No se pudieron cargar las notificaciones.");
    } finally {
      setLoading(false);
    }
  }, [supabase, userId]);

  useEffect(() => {
    if (!supabase || !userId) return undefined;

    loadNotifications();

    const channel = supabase
      .channel(`profile-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profile_notifications",
          filter: `profile_id=eq.${userId}`,
        },
        () => loadNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadNotifications, supabase, userId]);

  async function markOneAsRead(notificationId) {
    const readAt = new Date().toISOString();

    await tryRpcOrFallback({
      rpcRequest: () =>
        supabase.rpc("mark_profile_notification_read", {
          notification_id_input: notificationId,
        }),
      fallbackRequest: () =>
        supabase
          .from("profile_notifications")
          .update({ is_read: true, read_at: readAt })
          .eq("id", notificationId)
          .eq("profile_id", userId),
    });

    setNotifications((current) =>
      current.map((item) =>
        item.id === notificationId
          ? { ...item, is_read: true, read_at: item.read_at || readAt }
          : item
      )
    );
  }

  async function markAllAsRead() {
    if (!unreadCount) return;

    setMessage("");

    try {
      const readAt = new Date().toISOString();

      await tryRpcOrFallback({
        rpcRequest: () => supabase.rpc("mark_all_profile_notifications_read"),
        fallbackRequest: () =>
          supabase
            .from("profile_notifications")
            .update({ is_read: true, read_at: readAt })
            .eq("profile_id", userId)
            .eq("is_read", false),
      });

      setNotifications((current) =>
        current.map((item) => ({ ...item, is_read: true, read_at: item.read_at || readAt }))
      );
    } catch (error) {
      setMessage(error.message || "No se pudieron marcar como leídas.");
    }
  }

  async function deleteOneNotification(notificationId) {
    if (!notificationId || deletingId) return;

    setDeletingId(notificationId);
    setMessage("");

    try {
      await tryRpcOrFallback({
        rpcRequest: () =>
          supabase.rpc("delete_profile_notification", {
            notification_id_input: notificationId,
          }),
        fallbackRequest: () =>
          supabase
            .from("profile_notifications")
            .delete()
            .eq("id", notificationId)
            .eq("profile_id", userId),
      });

      setNotifications((current) =>
        current.filter((item) => item.id !== notificationId)
      );
    } catch (error) {
      setMessage(error.message || "No se pudo borrar la notificación.");
    } finally {
      setDeletingId(null);
    }
  }

  async function deleteReadNotifications() {
    if (!readCount || deletingRead) return;

    const confirmed =
      typeof window === "undefined"
        ? true
        : window.confirm("¿Quieres borrar todas las notificaciones que ya leíste?");

    if (!confirmed) return;

    setDeletingRead(true);
    setMessage("");

    try {
      await tryRpcOrFallback({
        rpcRequest: () => supabase.rpc("delete_read_profile_notifications"),
        fallbackRequest: () =>
          supabase
            .from("profile_notifications")
            .delete()
            .eq("profile_id", userId)
            .eq("is_read", true),
      });

      setNotifications((current) => current.filter((item) => !item.is_read));
    } catch (error) {
      setMessage(error.message || "No se pudieron borrar las notificaciones leídas.");
    } finally {
      setDeletingRead(false);
    }
  }

  async function openNotification(item) {
    try {
      if (!item.is_read) {
        await markOneAsRead(item.id);
      }
    } catch (error) {
      setMessage(error.message || "No se pudo marcar la notificación como leída.");
    }

    const destination = getNotificationDestination(item);

    if (!destination) return;

    closePanel();

    window.setTimeout(() => {
      if (destination.href) {
        window.location.assign(destination.href);
        return;
      }

      if (destination.tab && typeof onNavigateTab === "function") {
        onNavigateTab(destination.tab);
      }
    }, 210);
  }

  function openPanel() {
    updateDesktopPosition();
    setClosing(false);
    setOpen(true);
  }

  if (!userId) return null;

  const hasVisibleNotifications = visibleNotifications.length > 0;
  const shouldRenderPanel = open || closing;

  const notificationPanel = shouldRenderPanel ? (
    <div className="fixed inset-0 z-[2147483646]" role="presentation">
      <style>{`
        @keyframes gkgDesktopNotificationOpen {
          from { opacity: 0; transform: translateY(-10px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes gkgDesktopNotificationClose {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(-8px) scale(.985); }
        }
        @keyframes gkgMobileNotificationOpen {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes gkgMobileNotificationClose {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(100%); }
        }
        .gkg-notification-panel {
          animation: ${closing ? "gkgMobileNotificationClose" : "gkgMobileNotificationOpen"} 190ms ease-out forwards;
        }
        @media (min-width: 768px) {
          .gkg-notification-panel {
            animation: ${closing ? "gkgDesktopNotificationClose" : "gkgDesktopNotificationOpen"} 190ms ease-out forwards;
          }
        }
      `}</style>

      <button
        type="button"
        aria-label="Cerrar notificaciones"
        onClick={closePanel}
        className="absolute inset-0 bg-black/65 md:bg-black/25"
      />

      <section
        className="gkg-notification-panel absolute inset-x-3 bottom-3 top-3 z-[1] flex flex-col overflow-hidden rounded-[28px] border border-[#0b6b3a] bg-[#001208] text-white shadow-[0_0_34px_rgba(0,174,89,.18)] md:inset-auto md:w-[390px] md:rounded-[24px]"
        style={{
          background: "linear-gradient(180deg, #00180c 0%, #001208 100%)",
          ...(typeof window !== "undefined" && window.innerWidth >= DESKTOP_BREAKPOINT
            ? {
                top: `${desktopPosition.top}px`,
                right: `${desktopPosition.right}px`,
                height: "min(610px, calc(100vh - 96px))",
                maxHeight: "calc(100vh - 96px)",
              }
            : {}),
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Centro de notificaciones"
        onClick={(event) => event.stopPropagation()}
      >
        <header
          className="shrink-0 border-b border-[#0b6b3a] px-4 py-3"
          style={{
            background: "linear-gradient(180deg, #002713 0%, #001b0e 100%)",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-black leading-none">Notificaciones</h2>
              <p className="mt-1.5 text-xs text-zinc-300">
                {unreadCount
                  ? `${unreadCount} aviso(s) sin leer`
                  : "Estás al día con tus avisos."}
              </p>
            </div>

            <button
              type="button"
              onClick={closePanel}
              className="rounded-xl border border-[#0b6b3a] bg-[#001208] p-2 text-[#8cffad] transition hover:border-[#1eff7a] hover:bg-[#002713] hover:text-white"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
                filter === "all"
                  ? "bg-[#1eff7a] text-[#03200d]"
                  : "border border-[#0b6b3a] bg-[#001208] text-[#b7d7c1] hover:border-[#1eff7a] hover:bg-[#002713]"
              }`}
            >
              Todas
            </button>

            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
                filter === "unread"
                  ? "bg-[#1eff7a] text-[#03200d]"
                  : "border border-[#0b6b3a] bg-[#001208] text-[#b7d7c1] hover:border-[#1eff7a] hover:bg-[#002713]"
              }`}
            >
              No leídas
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={!unreadCount}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#0b6b3a] bg-[#002713] px-2.5 py-1.5 text-[11px] font-black text-[#8cffad] transition hover:border-[#1eff7a] hover:bg-[#00391d] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <CheckCheck size={14} />
              Marcar leídas
            </button>

            <button
              type="button"
              onClick={deleteReadNotifications}
              disabled={!readCount || deletingRead}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#7a2d2d] bg-[#260909] px-2.5 py-1.5 text-[11px] font-black text-red-100 transition hover:border-red-400 hover:bg-[#3a0d0d] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Trash2 size={13} />
              {deletingRead ? "Borrando..." : "Borrar leídas"}
            </button>

            <button
              type="button"
              onClick={loadNotifications}
              disabled={loading}
              className="rounded-xl border border-[#0b6b3a] bg-[#001208] px-2.5 py-1.5 text-[11px] font-black text-[#d7f5df] transition hover:border-[#1eff7a] hover:bg-[#002713] disabled:opacity-55"
            >
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>

          <p className="mt-2 text-[10px] leading-4 text-zinc-400 md:hidden">
            Desliza una notificación hacia la izquierda para mostrar Borrar.
          </p>
        </header>

        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 pb-6"
          style={{
            background: "linear-gradient(180deg, #001208 0%, #001108 100%)",
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
          }}
        >
          {message && (
            <div className="mb-3 rounded-xl border border-red-400/40 bg-[#2b0909] p-3 text-xs text-red-100">
              {message}
            </div>
          )}

          {loading && !notifications.length ? (
            <div className="flex min-h-40 items-center justify-center text-sm font-bold text-[#67ff9a]">
              Cargando notificaciones...
            </div>
          ) : !hasVisibleNotifications ? (
            <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-[#0b6b3a] bg-[#001208] px-6 text-center">
              <Bell className="text-[#67ff9a]" size={30} />
              <p className="mt-3 text-sm font-black">
                {filter === "unread" ? "No tienes avisos sin leer" : "Sin notificaciones"}
              </p>
              <p className="mt-2 text-xs leading-5 text-zinc-400">
                Aquí aparecerán tus premios, sorteos, seguidores y avisos VIP.
              </p>
            </div>
          ) : (
            <>
              <NotificationSection
                title="Nuevas"
                items={groups.newItems}
                onOpen={openNotification}
                onDelete={deleteOneNotification}
                deletingId={deletingId}
              />
              <NotificationSection
                title="Hoy"
                items={groups.todayItems}
                onOpen={openNotification}
                onDelete={deleteOneNotification}
                deletingId={deletingId}
              />
              <NotificationSection
                title="Anteriores"
                items={groups.olderItems}
                onOpen={openNotification}
                onDelete={deleteOneNotification}
                deletingId={deletingId}
              />
            </>
          )}
        </div>
      </section>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openPanel}
        aria-label="Abrir notificaciones"
        title="Notificaciones"
        className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#0b6b3a] bg-[#001208] text-[#63ff9b] shadow-[0_0_18px_rgba(22,201,106,.12)] transition hover:border-[#1eff7a] hover:bg-[#002713] sm:h-12 sm:w-12"
      >
        <Bell size={21} />

        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#240000] bg-red-500 px-1 text-[9px] font-black leading-none text-white shadow-[0_0_12px_rgba(239,68,68,.85)]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {mounted && typeof document !== "undefined" && notificationPanel
        ? createPortal(notificationPanel, document.body)
        : null}
    </>
  );
}
