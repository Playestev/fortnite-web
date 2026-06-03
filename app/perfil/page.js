"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  BadgeCheck,
  CalendarDays,
  Camera,
  ChevronDown,
  ChevronRight,
  Clock,
  Coins,
  Crown,
  Gift,
  Gamepad2,
  Globe2,
  KeyRound,
  Tag,
  LockKeyhole,
  Mail,
  MapPin,
  MessageCircle,
  Settings,
  Search,
  ShieldCheck,
  Star,
  Ticket,
  Trash2,
  AlertTriangle,
  Bell,
  Ban,
  History,
  Heart,
  LogOut,
  RotateCcw,
  Send,
  Trophy,
  User,
  UserCheck,
  UserPlus,
  UsersRound,
  Zap,
  X,
} from "lucide-react";

const LANG_STORAGE_KEY = "gkg-lang";
const GKG_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_GKG_WHATSAPP_NUMBER || "526568558434";

const translations = {
  es: {
    profileLabel: "PERFIL",
    myProfile: "Mi perfil",
    logout: "Cerrar sesión",
    online: "En línea",
    loading: "Cargando perfil...",
    noFortniteUser: "Sin usuario de Ganker Games",
    statusOnline: "En línea",
    statusAway: "Ausente",
    statusOffline: "No en línea",
    changeStatus: "Cambiar estado",
    uploadAvatar: "Cambiar foto de perfil",
    uploadingAvatar: "Subiendo foto...",
    avatarUploadSuccess: "Foto de perfil actualizada correctamente.",
    avatarUploadError: "No se pudo subir la foto de perfil.",
    tabs: {
      profile: "Perfil",
      community: "Comunidad",
      prizes: "Premios",
      giveaways: "Sorteos",
      settings: "Configuración",
    },
    stats: {
      prizes: "Premios",
      giveawaysWon: "Sorteos ganados",
      entries: "Participaciones",
    },
    playerInfo: "Información usuario",
    account: "Cuenta",
    country: "País",
    noCountry: "Sin país",
    status: "Estado",
    active: "Activo",
    birthday: "Cumpleaños",
    contact: "Redes y contacto",
    collection: "Colección GKG",
    total: "Total",
    pending: "Pendientes",
    canceled: "Cancelados",
    currentActivity: "Actividad actual",
    activeProfile: "Perfil activo",
    communityTitle: "Comunidad Ganker Games",
    communityDesc: "Participa en dinámicas, gana beneficios y entra a sorteos.",
    viewCommunity: "Ver comunidad",
    interests: "Intereses del jugador",
    viewAll: "Ver todos",
    recentActivity: "Actividad reciente",
    redGkg: "Seguidores",
    followers: "Seguidores",
    following: "Siguiendo",
    followAction: "Seguir",
    followingAction: "Siguiendo",
    followPlayers: "Seguir jugadores",
    ownProfile: "Tu perfil",
    communitySectionTitle: "Comunidad GKG",
    communitySectionDesc: "Perfiles de la comunidad con foto, nombre, usuario Ganker Games y estado actual.",
    communitySearchPlaceholder: "Buscar usuario de Ganker Games...",
    communitySearchEmpty: "No encontramos usuarios con ese nombre.",
    activityFollowers: "Actividad seguidores",
    noFollowedActivity: "Sigue a jugadores para ver su actividad aquí.",
    communityEmpty: "Aún no hay perfiles visibles en la comunidad.",
    socialLoading: "Actualizando comunidad...",
    followerActiveNow: "está activo en su perfil.",
    followerAwayNow: "está ausente en este momento.",
    followerOfflineNow: "no está en línea ahora.",
    membership: "Membresía",
    vipActive: "Miembro activo",
    memberGkg: "Miembro GKG",
    noVip: "Sin membresía VIP",
    vipDesc: "Acceso a dinámicas, sorteos y beneficios de comunidad.",
    prizeTabTitle: "Premios GKG",
    prizeTabDesc: "Aquí aparecerán los premios ganados, premios pendientes y recompensas entregadas.",
    giveawayTabTitle: "Sorteos GKG",
    giveawayTabDesc: "Aquí aparecerán los sorteos activos, tus participaciones y el historial de ganadores.",
    settingsTitle: "Configuración",
    profileSettings: "Configuración de perfil",
    password: "Contraseña",
    forgotPassword: "¿Olvidaste contraseña?",
    privacySettings: "Privacidad",
    notificationSettings: "Notificaciones",
    blockedUsers: "Usuarios bloqueados",
    changeHistory: "Historial de cambios",
    profileLabels: "Etiquetas",
    securitySettings: "Seguridad",
    privacyTitle: "Privacidad del perfil",
    privacyDesc: "Controla qué datos opcionales aparecen en tu perfil principal.",
    showCountry: "Mostrar país en mi perfil",
    showBirthday: "Mostrar cumpleaños en mi perfil",
    allowProfileSearch: "Permitir que mi perfil aparezca en la comunidad",
    privacySaved: "Privacidad actualizada correctamente.",
    notificationsTitle: "Notificaciones",
    notificationsDesc: "Elige cómo quieres recibir avisos de Ganker Games.",
    notifyEmail: "Recibir notificaciones por correo",
    notifyWhatsapp: "Recibir notificaciones por WhatsApp",
    notificationsSaved: "Notificaciones actualizadas correctamente.",
    blockedTitle: "Usuarios bloqueados",
    blockedDesc: "Bloquea usuarios para evitar interacción dentro de la comunidad.",
    noBlockedUsers: "No tienes usuarios bloqueados.",
    blockUser: "Bloquear",
    unblockUser: "Desbloquear",
    blockedLabel: "Bloqueado",
    blockSaved: "Lista de bloqueados actualizada.",
    tagsTitle: "Etiquetas del perfil",
    tagsDesc: "Agrega etiquetas cortas para mostrar tus gustos en tu perfil privado y público.",
    tagsLimitNormal: "Los perfiles normales pueden agregar hasta 3 etiquetas. Los VIP pueden agregar hasta 6.",
    tagPlaceholder: "Ej. Fortnite, Juegos, Leer libros...",
    tagSaved: "Etiqueta guardada correctamente.",
    tagDeleted: "Etiqueta eliminada correctamente.",
    tagLimitReached: "Llegaste al límite de etiquetas de tu perfil.",
    historyTitle: "Historial de cambios",
    historyDesc: "Aquí aparecen los cambios importantes realizados en tu cuenta.",
    noHistory: "Aún no hay cambios registrados.",
    securityTitle: "Seguridad",
    securityDesc: "Administra sesiones y protección de tu cuenta.",
    logoutAllDevices: "Cerrar sesión en todos los dispositivos",
    logoutAllDevicesDesc: "Esto cerrará tu cuenta en este navegador y en otros dispositivos donde esté abierta.",
    settingsProfileTitle: "Configuración del perfil",
    settingsProfileDesc: "Actualiza tus datos visibles dentro de Ganker Games.",
    firstName: "Nombre",
    firstNamePlaceholder: "Nombre obligatorio",
    middleName: "Segundo nombre",
    middleNamePlaceholder: "Segundo nombre opcional",
    lastName: "Apellido o apellidos",
    lastNamePlaceholder: "Apellido o apellidos obligatorio",
    email: "Correo",
    emailPlaceholder: "Correo de acceso (opcional cambiar)",
    fortniteName: "Usuario de Ganker Games",
    fortniteNamePlaceholder: "Usuario de Ganker Games obligatorio",
    selectCountry: "Selecciona tu país",
    phone: "Número",
    phonePlaceholder: "Número o WhatsApp opcional",
    birthdayPlaceholder: "Cumpleaños opcional",
    fortniteNotice: "El usuario de Ganker Games es obligatorio y solo se puede cambiar cada 20 días.",
    emailNotice: "El correo de acceso solo se cambia si escribes uno nuevo. Solo se puede cambiar cada 20 días.",
    canChangeIn: "Podrás cambiarlo en",
    days: "día(s)",
    saveProfile: "Guardar perfil",
    saving: "Guardando...",
    passwordTitle: "Contraseña",
    passwordDesc: "Cambia tu contraseña escribiendo primero la contraseña anterior.",
    oldPassword: "Contraseña anterior",
    oldPasswordPlaceholder: "Escribe tu contraseña actual",
    newPassword: "Contraseña nueva",
    newPasswordPlaceholder: "Mínimo 8 caracteres",
    repeatPassword: "Repetir contraseña nueva",
    repeatPasswordPlaceholder: "Confirma tu contraseña",
    savePassword: "Guardar contraseña",
    resetTitle: "¿Olvidaste contraseña?",
    resetDesc: "Escribe tu correo y te enviaremos un enlace para restaurar tu contraseña.",
    resetEmailPlaceholder: "correo@ejemplo.com",
    sendReset: "Enviar correo de recuperación",
    sending: "Enviando...",
    requiredFirstName: "El nombre es obligatorio.",
    requiredLastName: "El apellido o apellidos son obligatorios.",
    requiredEmail: "El correo es obligatorio.",
    invalidEmail: "Escribe un correo válido.",
    fortniteLocked: "El usuario de Ganker Games solo se puede cambiar cada 20 días.",
    emailLocked: "El correo solo se puede cambiar cada 20 días.",
    profileUpdated: "Perfil actualizado correctamente.",
    profileUpdatedEmail: "Perfil actualizado. Revisa tu correo nuevo para confirmar el cambio de email.",
    passwordMissing: "Completa todos los campos de contraseña.",
    passwordMin: "La contraseña nueva debe tener mínimo 8 caracteres.",
    passwordMismatch: "La contraseña nueva y la confirmación no coinciden.",
    passwordWrong: "La contraseña anterior no es correcta.",
    passwordUpdated: "Contraseña actualizada correctamente.",
    noAccountEmail: "No se encontró el correo de tu cuenta.",
    writeEmail: "Escribe tu correo.",
    resetSent: "Te enviamos un correo para restaurar tu contraseña. Revisa también spam o correo no deseado.",
    deleteProfile: "Borrar perfil",
    deleteProfileTitle: "Borrar perfil",
    deleteProfileDesc: "Al borrar tu perfil, se desactivará dentro de Ganker Games y ya no se mostrará como perfil activo.",
    deleteProfileWarning: "Esto implica que podrías perder el acceso a recompensas, premios, participaciones o configuraciones visibles. Tendrás 30 días para restaurarlo con todo lo que tenía; después de ese tiempo deberás crear un perfil nuevo.",
    deleteProfileConfirmLabel: "Para confirmar, escribe BORRAR PERFIL",
    deleteProfileConfirmPlaceholder: "BORRAR PERFIL",
    deleteProfileButton: "Borrar mi perfil",
    deleteProfileTypeToConfirm: "Escribe BORRAR PERFIL para continuar.",
    deleteProfileSuccess: "Tu perfil fue marcado para borrarse. Puedes restaurarlo durante los próximos 30 días.",
    deleteProfileError: "No se pudo borrar el perfil.",
    restoreProfileTitle: "Perfil marcado para borrarse",
    restoreProfileDesc: "Tu perfil está dentro del periodo de restauración de 30 días. Puedes recuperarlo con sus recompensas, premios y configuraciones.",
    restoreProfileButton: "Restaurar perfil",
    restoreProfileSuccess: "Perfil restaurado correctamente.",
    restoring: "Restaurando...",
    deleting: "Borrando...",
    saveConfirmTitle: "Confirmar cambios del perfil",
    saveConfirmDesc: "¿Estás seguro de guardar estos cambios?",
    saveConfirmWarning: "Todos los datos anteriores del perfil se reemplazarán por los nuevos cambios guardados.",
    confirmSave: "Sí, guardar cambios",
    cancelSave: "No quiero hacer los cambios",
    feed1: "participó en el sorteo “Skin del mes GKG”",
    feed2: "ganó una recompensa por dinámica de comunidad",
    feed3: "actualizó su perfil dentro de Ganker Games",
    ago2h: "Hace 2 horas",
    yesterday: "Ayer",
    ago3d: "Hace 3 días",
  },
  en: {
    profileLabel: "PROFILE",
    myProfile: "My profile",
    logout: "Log out",
    online: "Online",
    loading: "Loading profile...",
    noFortniteUser: "No Ganker Games username",
    statusOnline: "Online",
    statusAway: "Away",
    statusOffline: "Offline",
    changeStatus: "Change status",
    uploadAvatar: "Change profile photo",
    uploadingAvatar: "Uploading photo...",
    avatarUploadSuccess: "Profile photo updated successfully.",
    avatarUploadError: "Could not upload profile photo.",
    tabs: {
      profile: "Profile",
      community: "Community",
      prizes: "Prizes",
      giveaways: "Giveaways",
      settings: "Settings",
    },
    stats: {
      prizes: "Prizes",
      giveawaysWon: "Giveaways won",
      entries: "Entries",
    },
    playerInfo: "Username information",
    account: "Account",
    country: "Country",
    noCountry: "No country",
    status: "Status",
    active: "Active",
    birthday: "Birthday",
    contact: "Social and contact",
    collection: "GKG Collection",
    total: "Total",
    pending: "Pending",
    canceled: "Canceled",
    currentActivity: "Current activity",
    activeProfile: "Active profile",
    communityTitle: "Ganker Games Community",
    communityDesc: "Join activities, earn benefits, and enter giveaways.",
    viewCommunity: "View community",
    interests: "Player interests",
    viewAll: "View all",
    recentActivity: "Recent activity",
    redGkg: "Followers",
    followers: "Followers",
    following: "Following",
    followAction: "Follow",
    followingAction: "Following",
    followPlayers: "Follow players",
    ownProfile: "Your profile",
    communitySectionTitle: "GKG Community",
    communitySectionDesc: "Community profiles with photo, name, Ganker Games username and current status.",
    communitySearchPlaceholder: "Search Ganker Games username...",
    communitySearchEmpty: "We could not find users with that name.",
    activityFollowers: "Followers activity",
    noFollowedActivity: "Follow players to see their activity here.",
    communityEmpty: "There are no visible community profiles yet.",
    socialLoading: "Refreshing community...",
    followerActiveNow: "is active on their profile.",
    followerAwayNow: "is away right now.",
    followerOfflineNow: "is offline right now.",
    membership: "Membership",
    vipActive: "Active member",
    memberGkg: "GKG Member",
    noVip: "No VIP membership",
    vipDesc: "Access to activities, giveaways, and community benefits.",
    prizeTabTitle: "GKG Prizes",
    prizeTabDesc: "Won prizes, pending prizes, and delivered rewards will appear here.",
    giveawayTabTitle: "GKG Giveaways",
    giveawayTabDesc: "Active giveaways, your entries, and winner history will appear here.",
    settingsTitle: "Settings",
    profileSettings: "Profile settings",
    password: "Password",
    forgotPassword: "Forgot password?",
    privacySettings: "Privacy",
    notificationSettings: "Notifications",
    blockedUsers: "Blocked users",
    changeHistory: "Change history",
    profileLabels: "Tags",
    securitySettings: "Security",
    privacyTitle: "Profile privacy",
    privacyDesc: "Control which optional details appear on your main profile.",
    showCountry: "Show country on my profile",
    showBirthday: "Show birthday on my profile",
    allowProfileSearch: "Allow my profile to appear in the community",
    privacySaved: "Privacy updated successfully.",
    notificationsTitle: "Notifications",
    notificationsDesc: "Choose how you want to receive Ganker Games alerts.",
    notifyEmail: "Receive email notifications",
    notifyWhatsapp: "Receive WhatsApp notifications",
    notificationsSaved: "Notifications updated successfully.",
    blockedTitle: "Blocked users",
    blockedDesc: "Block users to prevent interaction inside the community.",
    noBlockedUsers: "You have no blocked users.",
    blockUser: "Block",
    unblockUser: "Unblock",
    blockedLabel: "Blocked",
    blockSaved: "Blocked users updated.",
    tagsTitle: "Profile tags",
    tagsDesc: "Add short tags to show your interests on your private and public profile.",
    tagsLimitNormal: "Normal profiles can add up to 3 tags. VIP users can add up to 6.",
    tagPlaceholder: "Ex. Fortnite, Gaming, Reading books...",
    tagSaved: "Tag saved successfully.",
    tagDeleted: "Tag deleted successfully.",
    tagLimitReached: "You reached your profile tag limit.",
    historyTitle: "Change history",
    historyDesc: "Important account changes will appear here.",
    noHistory: "No changes have been registered yet.",
    securityTitle: "Security",
    securityDesc: "Manage sessions and account protection.",
    logoutAllDevices: "Log out of all devices",
    logoutAllDevicesDesc: "This will sign you out on this browser and other devices where your account is open.",
    settingsProfileTitle: "Profile settings",
    settingsProfileDesc: "Update your visible information inside Ganker Games.",
    firstName: "First name",
    firstNamePlaceholder: "Required first name",
    middleName: "Middle name",
    middleNamePlaceholder: "Optional middle name",
    lastName: "Last name",
    lastNamePlaceholder: "Required last name",
    email: "Email",
    emailPlaceholder: "Access email (optional change)",
    fortniteName: "Ganker Games username",
    fortniteNamePlaceholder: "Required Ganker Games username",
    selectCountry: "Select your country",
    phone: "Phone",
    phonePlaceholder: "Optional phone or WhatsApp",
    birthdayPlaceholder: "Optional birthday",
    fortniteNotice: "The Ganker Games username is required and can only be changed every 20 days.",
    emailNotice: "Access email changes only if you enter a new one. Email can only be changed every 20 days.",
    canChangeIn: "You can change it in",
    days: "day(s)",
    saveProfile: "Save profile",
    saving: "Saving...",
    passwordTitle: "Password",
    passwordDesc: "Change your password by entering your current password first.",
    oldPassword: "Current password",
    oldPasswordPlaceholder: "Enter your current password",
    newPassword: "New password",
    newPasswordPlaceholder: "Minimum 8 characters",
    repeatPassword: "Repeat new password",
    repeatPasswordPlaceholder: "Confirm your password",
    savePassword: "Save password",
    resetTitle: "Forgot password?",
    resetDesc: "Enter your email and we will send you a link to reset your password.",
    resetEmailPlaceholder: "email@example.com",
    sendReset: "Send recovery email",
    sending: "Sending...",
    requiredFirstName: "First name is required.",
    requiredLastName: "Last name is required.",
    requiredEmail: "Email is required.",
    invalidEmail: "Enter a valid email.",
    fortniteLocked: "The Ganker Games username can only be changed every 20 days.",
    emailLocked: "Email can only be changed every 20 days.",
    profileUpdated: "Profile updated successfully.",
    profileUpdatedEmail: "Profile updated. Check your new email to confirm the email change.",
    passwordMissing: "Complete all password fields.",
    passwordMin: "The new password must be at least 8 characters.",
    passwordMismatch: "The new password and confirmation do not match.",
    passwordWrong: "The current password is incorrect.",
    passwordUpdated: "Password updated successfully.",
    noAccountEmail: "Your account email was not found.",
    writeEmail: "Enter your email.",
    resetSent: "We sent you a password reset email. Also check spam or junk mail.",
    deleteProfile: "Delete profile",
    deleteProfileTitle: "Delete profile",
    deleteProfileDesc: "Deleting your profile will deactivate it inside Ganker Games and it will no longer appear as an active profile.",
    deleteProfileWarning: "This means you could lose access to visible rewards, prizes, entries, or settings. You will have 30 days to restore it with everything it had; after that time you must create a new profile.",
    deleteProfileConfirmLabel: "To confirm, type DELETE PROFILE",
    deleteProfileConfirmPlaceholder: "DELETE PROFILE",
    deleteProfileButton: "Delete my profile",
    deleteProfileTypeToConfirm: "Type DELETE PROFILE to continue.",
    deleteProfileSuccess: "Your profile was marked for deletion. You can restore it during the next 30 days.",
    deleteProfileError: "Could not delete the profile.",
    restoreProfileTitle: "Profile marked for deletion",
    restoreProfileDesc: "Your profile is within the 30-day restoration period. You can recover it with its rewards, prizes, and settings.",
    restoreProfileButton: "Restore profile",
    restoreProfileSuccess: "Profile restored successfully.",
    restoring: "Restoring...",
    deleting: "Deleting...",
    saveConfirmTitle: "Confirm profile changes",
    saveConfirmDesc: "Are you sure you want to save these changes?",
    saveConfirmWarning: "All previous profile data will be replaced by the new saved changes.",
    confirmSave: "Yes, save changes",
    cancelSave: "I do not want to make changes",
    feed1: "entered the “GKG monthly skin” giveaway",
    feed2: "earned a reward from a community activity",
    feed3: "updated their Ganker Games profile",
    ago2h: "2 hours ago",
    yesterday: "Yesterday",
    ago3d: "3 days ago",
  },
};

const countries = [
  "Afganistán",
  "Albania",
  "Alemania",
  "Andorra",
  "Angola",
  "Antigua y Barbuda",
  "Arabia Saudita",
  "Argelia",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaiyán",
  "Bahamas",
  "Bangladés",
  "Barbados",
  "Baréin",
  "Bélgica",
  "Belice",
  "Benín",
  "Bielorrusia",
  "Bolivia",
  "Bosnia y Herzegovina",
  "Botsuana",
  "Brasil",
  "Brunéi",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Bután",
  "Cabo Verde",
  "Camboya",
  "Camerún",
  "Canadá",
  "Catar",
  "Chad",
  "Chile",
  "China",
  "Chipre",
  "Colombia",
  "Comoras",
  "Corea del Norte",
  "Corea del Sur",
  "Costa de Marfil",
  "Costa Rica",
  "Croacia",
  "Cuba",
  "Dinamarca",
  "Dominica",
  "Ecuador",
  "Egipto",
  "El Salvador",
  "Emiratos Árabes Unidos",
  "Eritrea",
  "Eslovaquia",
  "Eslovenia",
  "España",
  "Estados Unidos",
  "Estonia",
  "Esuatini",
  "Etiopía",
  "Filipinas",
  "Finlandia",
  "Fiyi",
  "Francia",
  "Gabón",
  "Gambia",
  "Georgia",
  "Ghana",
  "Granada",
  "Grecia",
  "Guatemala",
  "Guinea",
  "Guinea-Bisáu",
  "Guinea Ecuatorial",
  "Guyana",
  "Haití",
  "Honduras",
  "Hungría",
  "India",
  "Indonesia",
  "Irak",
  "Irán",
  "Irlanda",
  "Islandia",
  "Islas Marshall",
  "Islas Salomón",
  "Israel",
  "Italia",
  "Jamaica",
  "Japón",
  "Jordania",
  "Kazajistán",
  "Kenia",
  "Kirguistán",
  "Kiribati",
  "Kuwait",
  "Laos",
  "Lesoto",
  "Letonia",
  "Líbano",
  "Liberia",
  "Libia",
  "Liechtenstein",
  "Lituania",
  "Luxemburgo",
  "Madagascar",
  "Malasia",
  "Malaui",
  "Maldivas",
  "Malí",
  "Malta",
  "Marruecos",
  "Mauricio",
  "Mauritania",
  "México",
  "Micronesia",
  "Moldavia",
  "Mónaco",
  "Mongolia",
  "Montenegro",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Nicaragua",
  "Níger",
  "Nigeria",
  "Noruega",
  "Nueva Zelanda",
  "Omán",
  "Países Bajos",
  "Pakistán",
  "Palaos",
  "Palestina",
  "Panamá",
  "Papúa Nueva Guinea",
  "Paraguay",
  "Perú",
  "Polonia",
  "Portugal",
  "Reino Unido",
  "República Centroafricana",
  "República Checa",
  "República del Congo",
  "República Democrática del Congo",
  "República Dominicana",
  "Ruanda",
  "Rumania",
  "Rusia",
  "Samoa",
  "San Cristóbal y Nieves",
  "San Marino",
  "San Vicente y las Granadinas",
  "Santa Lucía",
  "Santo Tomé y Príncipe",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leona",
  "Singapur",
  "Siria",
  "Somalia",
  "Sri Lanka",
  "Sudáfrica",
  "Sudán",
  "Sudán del Sur",
  "Suecia",
  "Suiza",
  "Surinam",
  "Tailandia",
  "Tanzania",
  "Tayikistán",
  "Timor Oriental",
  "Togo",
  "Tonga",
  "Trinidad y Tobago",
  "Túnez",
  "Turkmenistán",
  "Turquía",
  "Tuvalu",
  "Ucrania",
  "Uganda",
  "Uruguay",
  "Uzbekistán",
  "Vanuatu",
  "Vaticano",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Yibuti",
  "Zambia",
  "Zimbabue"
];

function getTabs(t) {
  return [
    { name: t.tabs.profile, key: "Perfil", icon: User },
    { name: t.tabs.community, key: "Comunidad", icon: UsersRound },
    { name: "VIP", key: "VIP", icon: Crown },
    { name: t.tabs.prizes, key: "Premios", icon: Trophy },
    { name: t.tabs.giveaways, key: "Sorteos", icon: Gift },
    { name: t.tabs.settings, key: "Configuración", icon: Settings },
  ];
}

function getConfigMenu(t) {
  return [
    { name: t.profileSettings, key: "perfil", icon: User },
    { name: t.password, key: "password", icon: LockKeyhole },
    { name: t.forgotPassword, key: "reset", icon: KeyRound },
    { name: t.privacySettings, key: "privacy", icon: ShieldCheck },
    { name: t.profileLabels, key: "tags", icon: Tag },
    { name: t.notificationSettings, key: "notifications", icon: Bell },
    { name: t.blockedUsers, key: "blocked", icon: Ban },
    { name: t.changeHistory, key: "history", icon: History },
    { name: t.securitySettings, key: "security", icon: ShieldCheck },
    { name: t.deleteProfile, key: "delete", icon: Trash2 },
  ];
}

const games = [
  {
    default_key: "fortnite",
    title: "Fortnite",
    url: "https://www.fortnite.com/",
    image_url: "/interests/fortnite.png",
    gradient: "from-[#1eff7a] via-emerald-600 to-zinc-950",
  },
  {
    default_key: "comunidad-fortnite",
    title: "Comunidad Fortnite",
    url: "https://communities.epicgames.com/",
    image_url: "/interests/comunidad-fortnite.png",
    gradient: "from-cyan-500 via-blue-700 to-zinc-950",
  },
  {
    default_key: "tienda-fortnite",
    title: "Tienda Fortnite",
    url: "https://fortnite-web-eosin.vercel.app/",
    image_url: "/interests/tienda-fortnite.png",
    gradient: "from-purple-600 via-fuchsia-600 to-zinc-950",
  },
  {
    default_key: "noticias-fortnite",
    title: "Noticias Fortnite",
    url: "https://www.fortnite.com/news",
    image_url: "/interests/noticias-fortnite.png",
    gradient: "from-orange-500 via-red-600 to-zinc-950",
  },
  {
    default_key: "ganker-games-facebook",
    title: "Ganker Games Facebook",
    url: "https://www.facebook.com/gankergames",
    image_url: "/interests/ganker-games-facebook.png",
    gradient: "from-slate-400 via-zinc-700 to-black",
  },
];

function daysLeftFromDate(dateValue, limitDays = 20) {
  if (!dateValue) return 0;

  const lastDate = new Date(dateValue);
  const now = new Date();
  const diffMs = now.getTime() - lastDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return Math.max(0, Math.ceil(limitDays - diffDays));
}

function formatDateForVip(dateValue) {
  if (!dateValue) return "Sin fecha registrada";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Sin fecha registrada";

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}


function formatAgeFromBirthday(dateString) {
  if (!dateString) return "No visible";

  const birthDate = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(birthDate.getTime())) return "No visible";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  if (age < 0 || age > 120) return "No visible";

  return `${age} años`;
}

function getVipStartDate(profile) {
  return (
    profile?.vip_started_at ||
    profile?.vip_since ||
    profile?.vip_start_date ||
    profile?.vip_activated_at ||
    profile?.vip_created_at ||
    null
  );
}

function getVipMonths(profile) {
  if (!profile?.is_vip) return 0;

  const startDateValue = getVipStartDate(profile);
  if (!startDateValue) return 0;

  const startDate = new Date(startDateValue);
  const now = new Date();

  if (Number.isNaN(startDate.getTime())) return 0;

  let months =
    (now.getFullYear() - startDate.getFullYear()) * 12 +
    (now.getMonth() - startDate.getMonth());

  if (now.getDate() >= startDate.getDate()) {
    months += 1;
  }

  return Math.max(1, months);
}

function getVipTotalMonthsSinceStart(profile) {
  if (!profile?.is_vip) return 0;

  const startDateValue = getVipStartDate(profile);
  const storedMonths = Number(profile?.vip_streak_months || profile?.vip_total_months || 0);

  if (!startDateValue) return Math.max(0, storedMonths);

  const startDate = new Date(startDateValue);
  const now = new Date();

  if (Number.isNaN(startDate.getTime())) {
    return Math.max(0, storedMonths);
  }

  let months =
    (now.getFullYear() - startDate.getFullYear()) * 12 +
    (now.getMonth() - startDate.getMonth());

  if (now.getDate() >= startDate.getDate()) {
    months += 1;
  }

  return Math.max(1, months, storedMonths);
}

function getVipLevelFromMonths(months) {
  const cleanMonths = Math.max(0, Number(months || 0));

  if (cleanMonths <= 12) return 1;

  return Math.ceil(cleanMonths / 12);
}

function getVipBadgeLabelFromMonths(months) {
  const level = getVipLevelFromMonths(months);

  return level > 1 ? `GKG VIP ${level}` : "GKG VIP";
}

const TAG_COLOR_CLASSES = [
  "border-[#1eff7a]/45 bg-[#1eff7a]/12 text-[#63ff9b] shadow-[0_0_12px_rgba(30,255,122,.14)]",
  "border-cyan-300/45 bg-cyan-300/12 text-cyan-100 shadow-[0_0_12px_rgba(103,232,249,.14)]",
  "border-fuchsia-300/45 bg-fuchsia-400/12 text-fuchsia-100 shadow-[0_0_12px_rgba(217,70,239,.14)]",
  "border-yellow-300/45 bg-yellow-300/12 text-yellow-100 shadow-[0_0_12px_rgba(253,224,71,.14)]",
  "border-orange-300/45 bg-orange-400/12 text-orange-100 shadow-[0_0_12px_rgba(251,146,60,.14)]",
  "border-sky-300/45 bg-sky-400/12 text-sky-100 shadow-[0_0_12px_rgba(56,189,248,.14)]",
  "border-rose-300/45 bg-rose-400/12 text-rose-100 shadow-[0_0_12px_rgba(251,113,133,.14)]",
  "border-violet-300/45 bg-violet-400/12 text-violet-100 shadow-[0_0_12px_rgba(167,139,250,.14)]",
];

function getStableTagColorIndex(tag, index = 0) {
  const value = String(tag?.tag_text || tag || "");
  let hash = index;

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 9973;
  }

  return Math.abs(hash) % TAG_COLOR_CLASSES.length;
}

function getTagColorClasses(tag, index = 0) {
  return TAG_COLOR_CLASSES[getStableTagColorIndex(tag, index)];
}

function isCreatorAccount(role) {
  return ["admin", "creator", "creador"].includes(String(role || "").toLowerCase());
}

function CreatorBadge({ className = "", size = "sm" }) {
  const textSize = size === "xs" ? "text-[10px]" : "text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border border-zinc-300/45 bg-zinc-300/10 px-3 py-1 font-black uppercase tracking-wide text-zinc-100 shadow-[0_0_16px_rgba(212,212,216,.18)] ${textSize} ${className}`}
      title="GKG Creador"
    >
      <ShieldCheck size={size === "xs" ? 13 : 15} />
      GKG Creador
    </span>
  );
}

function getVipCycleNumberFromMonths(months) {
  const cleanMonths = Math.max(0, Number(months || 0));

  if (cleanMonths <= 0) return 1;

  return Math.ceil(cleanMonths / 12);
}

function getVipDisplayMilestoneMonth(baseMonth, cycleNumber) {
  const cleanCycle = Math.max(1, Number(cycleNumber || 1));

  if (cleanCycle === 1) {
    return baseMonth;
  }

  const cycleStart = (cleanCycle - 1) * 12 + 1;

  if (baseMonth === 1) return cycleStart;
  if (baseMonth === 3) return cycleStart + 3;
  if (baseMonth === 6) return cycleStart + 6;
  if (baseMonth === 12) return cycleStart + 11;

  return cycleStart + Math.max(0, baseMonth - 1);
}

function getVipRewardDisplayMonth(reward, fallbackCycleNumber = 1) {
  return getVipDisplayMilestoneMonth(
    Number(reward?.milestone_months || 0),
    Number(reward?.cycle_number || fallbackCycleNumber || 1)
  );
}

function isVipRewardEarned(reward, totalVipMonths, fallbackCycleNumber = 1) {
  if (!reward?.milestone_months) return true;

  const displayMonth = getVipRewardDisplayMonth(reward, fallbackCycleNumber);

  return Number(totalVipMonths || 0) >= displayMonth;
}

function calculateVipMonthsFromDate(dateValue) {
  if (!dateValue) return "";

  const startDate = new Date(`${dateValue}T12:00:00`);
  const now = new Date();

  if (Number.isNaN(startDate.getTime())) return "";

  let months =
    (now.getFullYear() - startDate.getFullYear()) * 12 +
    (now.getMonth() - startDate.getMonth());

  if (now.getDate() >= startDate.getDate()) {
    months += 1;
  }

  return String(Math.max(1, months));
}

function getVipDaysRemaining(profile) {
  if (!profile?.is_vip || !profile?.vip_until) return null;

  const endDate = new Date(profile.vip_until);
  if (Number.isNaN(endDate.getTime())) return null;

  const diffMs = endDate.getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function idsMatch(a, b) {
  return String(a || "") === String(b || "");
}

function getProfileDisplayName(profile) {
  if (!profile) return "Jugador GKG";

  const fullName = `${profile.first_name || ""} ${profile.middle_name || ""} ${profile.last_name || ""}`
    .replace(/\s+/g, " ")
    .trim();

  return fullName || profile.display_name || profile.ganker_user || profile.fortnite_user || "Jugador GKG";
}

function getPublicProfileHref(profile, currentUserId = null) {
  if (currentUserId && idsMatch(profile?.id, currentUserId)) {
    return "/perfil";
  }

  const slug =
    profile?.public_profile_number ||
    profile?.ganker_user ||
    profile?.fortnite_user ||
    profile?.id ||
    "";

  return `/perfil/publico/${encodeURIComponent(String(slug))}`;
}

function isProtectedRole(profile) {
  return ["admin", "creator"].includes(String(profile?.account_role || "user"));
}

function getStatusLabel(status, t) {
  if (status === "away") return t.statusAway;
  if (status === "offline") return t.statusOffline;
  return t.statusOnline;
}

function getFollowerActivityText(profile, t) {
  if (!profile) return t.noFollowedActivity;
  const name = getProfileDisplayName(profile);

  if (profile.presence_status === "away") {
    return `${name} ${t.followerAwayNow}`;
  }

  if (profile.presence_status === "offline") {
    return `${name} ${t.followerOfflineNow}`;
  }

  return `${name} ${t.followerActiveNow}`;
}

function MobileProfileTabsDrawer({ open, tabs, activeTab, onSelect, onClose }) {
  const [shouldRender, setShouldRender] = useState(open);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    let timeoutId;

    if (open) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      timeoutId = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 220);
    }

    return () => clearTimeout(timeoutId);
  }, [open, shouldRender]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-[140] md:hidden">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={onClose} />

      <div
        className={`absolute right-0 top-0 h-full w-[86%] max-w-sm border-l border-[#1eff7a]/30 bg-[rgba(3,16,9,0.92)] p-5 shadow-[0_0_45px_rgba(21,216,99,0.16)] backdrop-blur-xl ${
          isClosing ? "animate-[slideOutRight_220ms_ease-in]" : "animate-[slideInRight_220ms_ease-out]"
        }`}
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/gankergames-header-logo.png"
              alt="Logo de Ganker Games"
              className="h-12 w-auto max-w-[180px] object-contain drop-shadow-[0_0_12px_rgba(30,255,122,.40)]"
            />

            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#67ff9a]">
              Perfil
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[#1eff7a]/35 bg-[#07140f]/86 px-4 py-3 text-sm font-black text-white shadow-[0_0_18px_rgba(21,216,99,0.10)] transition hover:border-[#67ff9a] hover:text-[#67ff9a]"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  onSelect(tab.key);
                  onClose();
                  if (typeof window !== "undefined") {
                    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 60);
                  }
                }}
                className={`flex items-center justify-between rounded-2xl px-4 py-4 text-left text-base font-black transition ${
                  active
                    ? "border border-[#1eff7a] bg-[#1eff7a] text-black shadow-[0_0_22px_rgba(21,216,99,0.22)]"
                    : "border border-[#1eff7a]/20 bg-[#07140f]/88 text-white hover:border-[#67ff9a] hover:text-[#67ff9a]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={20} />
                  {tab.name}
                </span>

                <ChevronRight size={18} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PerfilPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [lang, setLang] = useState("es");
  const [languageChanging, setLanguageChanging] = useState(false);
  const [nextLanguage, setNextLanguage] = useState(null);
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState("Perfil");
  const [configSection, setConfigSection] = useState("perfil");
  const [mobileTabsOpen, setMobileTabsOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [user, setUser] = useState(null);

  const [profile, setProfile] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    display_name: "",
    fortnite_user: "",
    ganker_user: "",
    phone: "",
    birthday: "",
    country: "",
    avatar_url: "",
    facebook: "",
    premios_count: 0,
    sorteos_ganados_count: 0,
    participaciones_count: 0,
    is_vip: false,
    vip_started_at: null,
    vip_until: null,
    vip_months: 0,
    account_role: "user",
    public_profile_number: null,
    presence_status: "offline",
    last_seen: null,
    fortnite_user_updated_at: null,
    email_updated_at: null,
    deleted_at: null,
    restore_until: null,
    show_country: true,
    show_birthday: true,
    allow_profile_search: true,
    notify_email: true,
    notify_whatsapp: false,
    vip_started_at: null,
    vip_until: null,
    vip_last_paid_at: null,
    vip_grace_until: null,
    vip_streak_months: 0,
    vip_cycle_months: 0,
    vip_total_months: 0,
  });

  const [profileEmail, setProfileEmail] = useState("");
  const [draftProfile, setDraftProfile] = useState(null);
  const [draftProfileEmail, setDraftProfileEmail] = useState("");
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deletingProfile, setDeletingProfile] = useState(false);
  const [restoringProfile, setRestoringProfile] = useState(false);
  const [privacyForm, setPrivacyForm] = useState({
    show_country: true,
    show_birthday: true,
    allow_profile_search: true,
  });
  const [notificationForm, setNotificationForm] = useState({
    notify_email: true,
    notify_whatsapp: false,
  });
  const [settingsMessage, setSettingsMessage] = useState("");
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [blockedProfiles, setBlockedProfiles] = useState([]);
  const [profileHistory, setProfileHistory] = useState([]);

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [resetEmail, setResetEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [presenceStatus, setPresenceStatus] = useState("offline");
  const [manualPresence, setManualPresence] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [communityProfiles, setCommunityProfiles] = useState([]);
  const [communitySearch, setCommunitySearch] = useState("");
  const [followingIds, setFollowingIds] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialMessage, setSocialMessage] = useState("");
  const [liveCounts, setLiveCounts] = useState({
    premios: null,
    sorteos: null,
    participaciones: null,
  });
  const [customInterests, setCustomInterests] = useState([]);
  const [profileTags, setProfileTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [tagMessage, setTagMessage] = useState("");
  const [tagSaving, setTagSaving] = useState(false);
  const [gkgUpdates, setGkgUpdates] = useState([]);
  const [selectedGkgUpdate, setSelectedGkgUpdate] = useState(null);
  const [gkgUpdateComments, setGkgUpdateComments] = useState([]);
  const [gkgUpdateCommentText, setGkgUpdateCommentText] = useState("");
  const [editingGkgUpdateComment, setEditingGkgUpdateComment] = useState(null);
  const [gkgUpdateActionMessage, setGkgUpdateActionMessage] = useState("");
  const [gkgUpdateActionLoading, setGkgUpdateActionLoading] = useState(false);
  const [showAllGkgUpdatesMobile, setShowAllGkgUpdatesMobile] = useState(false);
  const [showAllInterestsMobile, setShowAllInterestsMobile] = useState(false);
  const [interestModalOpen, setInterestModalOpen] = useState(false);
  const [editingInterest, setEditingInterest] = useState(null);
  const [interestImageFile, setInterestImageFile] = useState(null);
  const [interestSaving, setInterestSaving] = useState(false);
  const [interestForm, setInterestForm] = useState({
    title: "",
    url: "",
    image_url: "",
  });
  const fileInputRef = useRef(null);
  const interestFileInputRef = useRef(null);

  const displayName =
    `${profile.first_name || ""} ${profile.middle_name || ""} ${profile.last_name || ""}`
      .replace(/\s+/g, " ")
      .trim() ||
    profile.display_name ||
    user?.email?.split("@")[0] ||
    "Jugador GKG";

  const fortniteUser = profile.ganker_user || profile.fortnite_user || t.noFortniteUser;
  const avatarSrc = profile.avatar_url || "";
  const emailDaysLeft = daysLeftFromDate(profile.email_updated_at, 20);
  const fortniteDaysLeft = daysLeftFromDate(profile.fortnite_user_updated_at, 20);
  const currentPresence = user ? presenceStatus : "offline";
  const profileVipMonths = getVipTotalMonthsSinceStart(profile);
  const profileVipBadgeLabel = getVipBadgeLabelFromMonths(profileVipMonths);

  const accountRole = profile.account_role || "user";
  const isCreatorProfile = isCreatorAccount(accountRole);
  const canManageGiveaways = accountRole === "admin" || accountRole === "creator";
  const tabs = canManageGiveaways
    ? [
        ...getTabs(t),
        {
          name: lang === "es" ? "Creador" : "Creator",
          key: "Creador",
          icon: ShieldCheck,
        },
      ]
    : getTabs(t);
  const configMenu = getConfigMenu(t);
  const activeDraftProfile = draftProfile || profile;
  const isProfileDeleted = Boolean(profile.deleted_at);
  const maxProfileTags = profile.is_vip ? 6 : 3;
  const suggestedTags = [
    "Fortnite",
    "Juegos",
    "Comunidad",
    "Tienda Fortnite",
    "Noticias",
    "Leer libros",
    "Anime",
    "Música",
    "Competitivo",
    "Coleccionables",
    "Creativo",
    "Amigos",
  ];

  const stats = [
    {
      label: t.stats.prizes,
      value: String(liveCounts.premios ?? profile.premios_count ?? 0),
      icon: Trophy,
    },
    {
      label: t.stats.giveawaysWon,
      value: String(liveCounts.sorteos ?? profile.sorteos_ganados_count ?? 0),
      icon: Gift,
    },
    {
      label: t.stats.entries,
      value: String(liveCounts.participaciones ?? profile.participaciones_count ?? 0),
      icon: Ticket,
    },
  ];

  const customInterestCount = useMemo(
    () => (customInterests || []).filter((item) => !item.default_key && !item.is_hidden).length,
    [customInterests]
  );

  const hiddenDefaultInterestCount = useMemo(
    () => (customInterests || []).filter((item) => item.default_key && item.is_hidden).length,
    [customInterests]
  );

  const combinedInterests = useMemo(() => {
    const overrideByKey = new Map(
      (customInterests || [])
        .filter((item) => item.default_key)
        .map((item) => [item.default_key, item])
    );

    const defaults = games
      .map((game) => {
        const override = overrideByKey.get(game.default_key);

        if (override?.is_hidden) return null;

        return {
          ...game,
          id: override?.id || game.default_key,
          title: override?.title || game.title,
          url: override?.url || game.url || "#",
          image_url: override?.image_url || game.image_url || "",
          default_key: game.default_key,
          defaultInterest: true,
          override_id: override?.id || null,
        };
      })
      .filter(Boolean);

    const extras = (customInterests || [])
      .filter((item) => !item.default_key && !item.is_hidden)
      .map((item) => ({
        title: item.title,
        url: item.url || "#",
        image_url: item.image_url || "",
        gradient: "from-cyan-400 via-blue-700 to-zinc-950",
        custom: true,
        id: item.id,
      }));

    return [...defaults, ...extras];
  }, [customInterests]);

  const liveActivityFeed = useMemo(
    () => [
      {
        title:
          (liveCounts.participaciones ?? profile.participaciones_count ?? 0) > 0
            ? `tiene ${liveCounts.participaciones ?? profile.participaciones_count ?? 0} participación(es) registradas en sorteos`
            : "aún no tiene participaciones registradas en sorteos",
        time: "Actualizado en tiempo real",
        icon: Gift,
      },
      {
        title:
          profile.is_vip
            ? `tiene insignia ${profileVipBadgeLabel} activa`
            : "es Miembro GKG sin VIP activo",
        time: profile.is_vip ? "VIP activo" : "Estado actual",
        icon: BadgeCheck,
      },
      {
        title: `aparece con estado ${getStatusLabel(currentPresence, t)}`,
        time: "Estado de perfil",
        icon: Zap,
      },
      {
        title:
          (liveCounts.premios ?? profile.premios_count ?? 0) > 0
            ? `tiene ${liveCounts.premios ?? profile.premios_count ?? 0} premio(s) disponibles o en proceso`
            : "todavía no tiene premios registrados",
        time: "Premios GKG",
        icon: Trophy,
      },
    ],
    [
      currentPresence,
      liveCounts.participaciones,
      liveCounts.premios,
      profile.is_vip,
      profile.participaciones_count,
      profile.premios_count,
      profileVipBadgeLabel,
      t,
    ]
  );

  const communityProfilesSorted = useMemo(() => {
    const statusOrder = { online: 0, away: 1, offline: 2 };
    const blockedIds = new Set(blockedProfiles.map((item) => String(item.id)));

    return [...communityProfiles]
      .filter((item) => {
        if (blockedIds.has(String(item.id))) return false;
        if (item.deleted_at) return false;
        if (item.allow_profile_search === false) return false;
        return true;
      })
      .sort((a, b) => {
      const aSelf = idsMatch(a.id, user?.id) ? -1 : 0;
      const bSelf = idsMatch(b.id, user?.id) ? -1 : 0;

      if (aSelf !== bSelf) return aSelf - bSelf;

      const aFollowed = followingIds.some((id) => idsMatch(id, a.id)) ? 0 : 1;
      const bFollowed = followingIds.some((id) => idsMatch(id, b.id)) ? 0 : 1;

      if (aFollowed !== bFollowed) return aFollowed - bFollowed;

      const aStatus = statusOrder[a.presence_status || "offline"] ?? 3;
      const bStatus = statusOrder[b.presence_status || "offline"] ?? 3;

      if (aStatus !== bStatus) return aStatus - bStatus;

      return getProfileDisplayName(a).localeCompare(getProfileDisplayName(b));
    });
  }, [blockedProfiles, communityProfiles, followingIds, user]);

  const filteredCommunityProfiles = useMemo(() => {
    const cleanSearch = String(communitySearch || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();

    if (!cleanSearch) return communityProfilesSorted;

    return communityProfilesSorted.filter((item) => {
      const searchableText = [
        item.ganker_user,
        item.fortnite_user,
        item.display_name,
        item.first_name,
        item.middle_name,
        item.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      return searchableText.includes(cleanSearch);
    });
  }, [communityProfilesSorted, communitySearch]);

  const followedProfiles = useMemo(
    () =>
      communityProfilesSorted.filter((item) =>
        followingIds.some((id) => idsMatch(id, item.id))
      ),
    [communityProfilesSorted, followingIds]
  );

  const featuredFollowedProfile =
    followedProfiles[0] || communityProfilesSorted.find((item) => !idsMatch(item.id, user?.id)) || null;

  useEffect(() => {
    async function loadLiveCounts() {
      if (!user?.id) {
        setLiveCounts({ premios: null, sorteos: null, participaciones: null });
        return;
      }

      try {
        const { data, error } = await supabase.rpc("get_profile_stats_by_id", {
          target_profile_id: user.id,
        });

        if (error) throw error;

        const stats = Array.isArray(data) ? data[0] : data;

        setLiveCounts({
          premios: Number(stats?.premios || 0),
          sorteos: Number(stats?.sorteos || 0),
          participaciones: Number(stats?.participaciones || 0),
        });
      } catch (error) {
        console.warn("Live count load error:", error);
      }
    }

    loadLiveCounts();

    const channel = supabase
      .channel(`gkg-live-counts-${user?.id || "guest"}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "vip_rewards" }, loadLiveCounts)
      .on("postgres_changes", { event: "*", schema: "public", table: "giveaway_entries" }, loadLiveCounts)
      .on("postgres_changes", { event: "*", schema: "public", table: "giveaway_winners" }, loadLiveCounts)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile.ganker_user, profile.fortnite_user, supabase, user?.id]);

  async function loadGkgUpdates() {
    try {
      const { data, error } = await supabase.rpc("get_gkg_page_updates_feed");

      if (error) throw error;

      setGkgUpdates(data || []);
    } catch (error) {
      console.warn("GKG updates RPC load error:", error);

      try {
        const { data, error: tableError } = await supabase
          .from("gkg_page_updates")
          .select("*")
          .eq("is_visible", true)
          .order("created_at", { ascending: false })
          .limit(5);

        if (tableError) throw tableError;

        setGkgUpdates(data || []);
      } catch (tableError) {
        console.warn("GKG updates load error:", tableError);
        setGkgUpdates([
          {
            id: "default-tags",
            title: "Etiquetas de perfil disponibles",
            description: "Ahora puedes agregar etiquetas de gustos en tu perfil para que aparezcan en tu perfil privado y público.",
            likes_count: 0,
            comments_count: 0,
            is_liked: false,
            created_at: new Date().toISOString(),
          },
          {
            id: "default-updates",
            title: "Actualizaciones interactivas",
            description: "Las actualizaciones de la página ahora se pueden abrir para leer la descripción completa, reaccionar y comentar brevemente.",
            likes_count: 0,
            comments_count: 0,
            is_liked: false,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    }
  }

  useEffect(() => {
    loadGkgUpdates();

    const channel = supabase
      .channel("gkg-page-updates-profile")
      .on("postgres_changes", { event: "*", schema: "public", table: "gkg_page_updates" }, loadGkgUpdates)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function loadGkgUpdateComments(updateId) {
    if (!updateId || String(updateId).startsWith("default-")) {
      setGkgUpdateComments([]);
      return;
    }

    try {
      const { data, error } = await supabase.rpc("get_gkg_update_comments", {
        update_id_input: updateId,
      });

      if (error) throw error;

      setGkgUpdateComments(data || []);
    } catch (error) {
      console.warn("GKG update comments error:", error);
      setGkgUpdateComments([]);
    }
  }

  async function openGkgUpdateModal(update) {
    setSelectedGkgUpdate(update);
    setGkgUpdateActionMessage("");
    setGkgUpdateCommentText("");
    setEditingGkgUpdateComment(null);
    await loadGkgUpdateComments(update.id);
  }

  async function toggleGkgUpdateLike() {
    if (!selectedGkgUpdate?.id || String(selectedGkgUpdate.id).startsWith("default-")) return;

    if (!user?.id) {
      router.push("/login");
      return;
    }

    setGkgUpdateActionLoading(true);
    setGkgUpdateActionMessage("");

    try {
      const { data, error } = await supabase.rpc("toggle_gkg_update_like", {
        update_id_input: selectedGkgUpdate.id,
      });

      if (error) throw error;

      const result = Array.isArray(data) ? data[0] : data;
      const nextLiked = Boolean(result?.liked);
      const nextLikes = Number(result?.likes_count ?? selectedGkgUpdate.likes_count ?? 0);

      setSelectedGkgUpdate((current) =>
        current
          ? {
              ...current,
              is_liked: nextLiked,
              likes_count: nextLikes,
            }
          : current
      );

      setGkgUpdates((current) =>
        current.map((item) =>
          item.id === selectedGkgUpdate.id
            ? { ...item, is_liked: nextLiked, likes_count: nextLikes }
            : item
        )
      );
    } catch (error) {
      setGkgUpdateActionMessage(error.message || "No se pudo guardar tu reacción.");
    } finally {
      setGkgUpdateActionLoading(false);
    }
  }

  async function sendGkgUpdateComment() {
    if (!selectedGkgUpdate?.id || String(selectedGkgUpdate.id).startsWith("default-")) return;

    if (!user?.id) {
      router.push("/login");
      return;
    }

    const text = gkgUpdateCommentText.trim();

    if (!text) {
      setGkgUpdateActionMessage("Escribe un comentario breve.");
      return;
    }

    if (text.length > 140) {
      setGkgUpdateActionMessage("El comentario debe tener máximo 140 caracteres.");
      return;
    }

    setGkgUpdateActionLoading(true);
    setGkgUpdateActionMessage("");

    try {
      if (editingGkgUpdateComment?.id) {
        const { error } = await supabase.rpc("update_gkg_update_comment", {
          comment_id_input: editingGkgUpdateComment.id,
          comment_text_input: text,
        });

        if (error) throw error;
      } else {
        const { error } = await supabase.rpc("add_gkg_update_comment", {
          update_id_input: selectedGkgUpdate.id,
          comment_text_input: text,
        });

        if (error) throw error;
      }

      setGkgUpdateCommentText("");
      setEditingGkgUpdateComment(null);
      await loadGkgUpdateComments(selectedGkgUpdate.id);
      await loadGkgUpdates();

      if (!editingGkgUpdateComment?.id) {
        setSelectedGkgUpdate((current) =>
          current
            ? {
                ...current,
                comments_count: Number(current.comments_count || 0) + 1,
              }
            : current
        );
      }
    } catch (error) {
      setGkgUpdateActionMessage(
        error.message ||
          (editingGkgUpdateComment?.id
            ? "No se pudo actualizar tu comentario."
            : "No se pudo publicar tu comentario.")
      );
    } finally {
      setGkgUpdateActionLoading(false);
    }
  }

  function startEditGkgUpdateComment(comment) {
    if (!comment?.id || comment.profile_id !== user?.id) return;

    setEditingGkgUpdateComment(comment);
    setGkgUpdateCommentText(comment.comment_text || "");
    setGkgUpdateActionMessage("");
  }

  function cancelEditGkgUpdateComment() {
    setEditingGkgUpdateComment(null);
    setGkgUpdateCommentText("");
    setGkgUpdateActionMessage("");
  }

  async function deleteGkgUpdateComment(comment) {
    if (!selectedGkgUpdate?.id || !comment?.id || comment.profile_id !== user?.id) return;

    const confirmed =
      typeof window === "undefined"
        ? true
        : window.confirm("¿Seguro que quieres borrar este comentario?");

    if (!confirmed) return;

    setGkgUpdateActionLoading(true);
    setGkgUpdateActionMessage("");

    try {
      const { error } = await supabase.rpc("delete_gkg_update_comment", {
        comment_id_input: comment.id,
      });

      if (error) throw error;

      if (editingGkgUpdateComment?.id === comment.id) {
        cancelEditGkgUpdateComment();
      }

      await loadGkgUpdateComments(selectedGkgUpdate.id);
      await loadGkgUpdates();

      setSelectedGkgUpdate((current) =>
        current
          ? {
              ...current,
              comments_count: Math.max(0, Number(current.comments_count || 0) - 1),
            }
          : current
      );
    } catch (error) {
      setGkgUpdateActionMessage(error.message || "No se pudo borrar tu comentario.");
    } finally {
      setGkgUpdateActionLoading(false);
    }
  }

  async function loadProfileTags() {
    if (!user?.id) {
      setProfileTags([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profile_tags")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setProfileTags(data || []);
    } catch (error) {
      console.warn("Profile tags load error:", error);
      setProfileTags([]);
    }
  }

  useEffect(() => {
    loadProfileTags();
  }, [user?.id, supabase]);

  async function addProfileTag(value = tagInput) {
    if (!user?.id || tagSaving) return;

    const cleanTag = String(value || "")
      .replace(/#/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 24);

    if (!cleanTag) {
      setTagMessage("Escribe una etiqueta.");
      return;
    }

    if (profileTags.some((tag) => tag.tag_text.toLowerCase() === cleanTag.toLowerCase())) {
      setTagMessage("Esa etiqueta ya está agregada.");
      return;
    }

    if (profileTags.length >= maxProfileTags) {
      setTagMessage(t.tagLimitReached);
      return;
    }

    setTagSaving(true);
    setTagMessage("");

    try {
      const { error } = await supabase.from("profile_tags").insert({
        profile_id: user.id,
        tag_text: cleanTag,
      });

      if (error) throw error;

      setTagInput("");
      await loadProfileTags();
      await addChangeHistory("profile_tag_add", `Agregó etiqueta: ${cleanTag}`);
      setTagMessage(t.tagSaved);
    } catch (error) {
      setTagMessage(error.message || "No se pudo guardar la etiqueta.");
    } finally {
      setTagSaving(false);
    }
  }

  async function deleteProfileTag(tagId) {
    if (!user?.id || !tagId) return;

    setTagSaving(true);
    setTagMessage("");

    try {
      const { error } = await supabase
        .from("profile_tags")
        .delete()
        .eq("id", tagId)
        .eq("profile_id", user.id);

      if (error) throw error;

      await loadProfileTags();
      await addChangeHistory("profile_tag_delete", "Eliminó una etiqueta del perfil");
      setTagMessage(t.tagDeleted);
    } catch (error) {
      setTagMessage(error.message || "No se pudo borrar la etiqueta.");
    } finally {
      setTagSaving(false);
    }
  }

  async function loadCustomInterests() {
    if (!user?.id) {
      setCustomInterests([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profile_interests")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setCustomInterests(data || []);
    } catch (error) {
      console.warn("Custom interests load error:", error);
      setCustomInterests([]);
    }
  }

  useEffect(() => {
    loadCustomInterests();
  }, [user?.id, supabase]);

  function openInterestModal(item = null) {
    if (!profile.is_vip) return;

    setEditingInterest(item);
    setInterestImageFile(null);
    setInterestForm({
      title: item?.title || "",
      url: item?.url || "",
      image_url: item?.image_url || "",
      default_key: item?.default_key || "",
    });

    if (interestFileInputRef.current) {
      interestFileInputRef.current.value = "";
    }

    setInterestModalOpen(true);
  }

  function normalizeInterestUrl(value) {
    const cleanValue = String(value || "").trim();

    if (!cleanValue) return "";

    if (cleanValue.startsWith("http://") || cleanValue.startsWith("https://")) {
      return cleanValue;
    }

    return `https://${cleanValue}`;
  }

  function containsForbiddenInterestContent(values = []) {
    const forbiddenWords = [
      "porno",
      "porn",
      "xxx",
      "sex",
      "nude",
      "desnudo",
      "desnuda",
      "onlyfans",
      "gore",
      "sangre",
      "muerte",
      "asesinato",
      "violencia",
      "weapon",
      "arma",
      "drugs",
      "droga",
      "narco",
      "casino",
      "apuestas",
    ];

    const haystack = values
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return forbiddenWords.some((word) => haystack.includes(word));
  }

  async function uploadInterestImage(file) {
    if (!file) return "";

    if (!file.type?.startsWith("image/")) {
      throw new Error("La foto del interés debe ser una imagen.");
    }

    if (file.size > 4 * 1024 * 1024) {
      throw new Error("La imagen no puede pesar más de 4 MB.");
    }

    if (containsForbiddenInterestContent([file.name])) {
      throw new Error("El nombre del archivo contiene contenido no permitido.");
    }

    const extension = file.name.split(".").pop() || "jpg";
    const safeName = `${Date.now()}-${Math.random().toString(16).slice(2)}.${extension}`;
    const filePath = `${user.id}/${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-interests")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("profile-interests").getPublicUrl(filePath);

    return data?.publicUrl || "";
  }

  async function saveInterest() {
    if (!user?.id || !profile.is_vip || interestSaving) return;

    const title = interestForm.title.trim();
    const url = normalizeInterestUrl(interestForm.url);
    let imageUrl = interestForm.image_url.trim();

    if (!title || !url || (!imageUrl && !interestImageFile)) {
      setProfileMessage("Completa nombre, enlace y foto del interés para publicarlo.");
      return;
    }

    try {
      new URL(url);
    } catch (error) {
      setProfileMessage("El enlace del interés no es válido.");
      return;
    }

    if (containsForbiddenInterestContent([title, url, imageUrl, interestImageFile?.name])) {
      setProfileMessage("No se permite publicar intereses con contenido adulto, violento o riesgoso.");
      return;
    }

    const isDefaultInterest = Boolean(editingInterest?.default_key);

    if (!isDefaultInterest && !editingInterest && customInterestCount >= 5) {
      setProfileMessage("Los usuarios VIP solo pueden agregar 5 intereses adicionales.");
      return;
    }

    setInterestSaving(true);
    setProfileMessage("");

    try {
      if (interestImageFile) {
        imageUrl = await uploadInterestImage(interestImageFile);
      }

      if (!imageUrl) {
        throw new Error("Agrega o sube una imagen para el interés.");
      }

      const payload = {
        title,
        url,
        image_url: imageUrl,
        is_hidden: false,
        updated_at: new Date().toISOString(),
      };

      if (editingInterest?.default_key) {
        const overrideId = editingInterest.override_id || editingInterest.id;

        if (overrideId && !String(overrideId).startsWith(editingInterest.default_key)) {
          const { error } = await supabase
            .from("profile_interests")
            .update(payload)
            .eq("id", overrideId)
            .eq("profile_id", user.id);

          if (error) throw error;
        } else {
          const { error } = await supabase.from("profile_interests").insert({
            profile_id: user.id,
            default_key: editingInterest.default_key,
            ...payload,
          });

          if (error) throw error;
        }
      } else if (editingInterest?.id) {
        const { error } = await supabase
          .from("profile_interests")
          .update(payload)
          .eq("id", editingInterest.id)
          .eq("profile_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("profile_interests").insert({
          profile_id: user.id,
          default_key: null,
          ...payload,
        });

        if (error) throw error;
      }

      setInterestModalOpen(false);
      setEditingInterest(null);
      setInterestImageFile(null);
      setInterestForm({ title: "", url: "", image_url: "", default_key: "" });

      if (interestFileInputRef.current) {
        interestFileInputRef.current.value = "";
      }

      await loadCustomInterests();
      await addChangeHistory("interest_update", "Actualizó intereses de jugador");
      setProfileMessage("Interés publicado correctamente. También aparecerá en tu perfil público.");
    } catch (error) {
      setProfileMessage(error.message || "No se pudo guardar el interés.");
    } finally {
      setInterestSaving(false);
    }
  }

  async function deleteInterest(item) {
    if (!user?.id || !item) return;

    const confirmed =
      typeof window === "undefined"
        ? true
        : window.confirm(
            item.defaultInterest
              ? "¿Quieres ocultar este interés base de tu perfil?"
              : "¿Quieres borrar este interés adicional?"
          );

    if (!confirmed) return;

    try {
      if (item.defaultInterest) {
        const overrideId = item.override_id || item.id;
        const payload = {
          profile_id: user.id,
          default_key: item.default_key,
          title: item.title,
          url: item.url || "#",
          image_url: item.image_url || "",
          is_hidden: true,
          updated_at: new Date().toISOString(),
        };

        if (overrideId && !String(overrideId).startsWith(item.default_key)) {
          const { error } = await supabase
            .from("profile_interests")
            .update(payload)
            .eq("id", overrideId)
            .eq("profile_id", user.id);

          if (error) throw error;
        } else {
          const { error } = await supabase.from("profile_interests").insert(payload);

          if (error) throw error;
        }
      } else {
        const { error } = await supabase
          .from("profile_interests")
          .delete()
          .eq("id", item.id)
          .eq("profile_id", user.id);

        if (error) throw error;
      }

      await loadCustomInterests();
      await addChangeHistory("interest_delete", "Eliminó u ocultó un interés de jugador");
      setProfileMessage("Interés eliminado correctamente.");
    } catch (error) {
      setProfileMessage(error.message || "No se pudo borrar el interés.");
    }
  }

  async function restoreDefaultInterests() {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from("profile_interests")
        .update({
          is_hidden: false,
          updated_at: new Date().toISOString(),
        })
        .eq("profile_id", user.id)
        .not("default_key", "is", null);

      if (error) throw error;

      await loadCustomInterests();
      setProfileMessage("Intereses base restaurados correctamente.");
    } catch (error) {
      setProfileMessage(error.message || "No se pudieron restaurar los intereses base.");
    }
  }

  useEffect(() => {
    const savedLang =
      typeof window !== "undefined"
        ? localStorage.getItem(LANG_STORAGE_KEY)
        : null;

    if (savedLang === "es" || savedLang === "en") {
      setLang(savedLang);
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "Sorteos") {
        setActiveTab("Sorteos");
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 260);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function toggleLang() {
    if (languageChanging) return;

    const nextLang = lang === "es" ? "en" : "es";
    setNextLanguage(nextLang);
    setLanguageChanging(true);

    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        setLang(nextLang);
        localStorage.setItem(LANG_STORAGE_KEY, nextLang);
      }, 420);

      window.setTimeout(() => {
        setLanguageChanging(false);
        setNextLanguage(null);
      }, 1100);
    }
  }

  useEffect(() => {
    let active = true;

    const loadingSafetyTimeout = window.setTimeout(() => {
      if (!active) return;

      setLoading(false);
      setProfileMessage((current) =>
        current || "La carga del perfil está tardando más de lo esperado. Puedes continuar y volver a intentar."
      );
    }, 12000);

    async function loadProfile() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        setUser(null);
        setProfileEmail("");
        setLoading(false);
        return;
      }

      const currentUser = sessionData.session.user;
      setUser(currentUser);
      setProfileEmail(currentUser.email || "");
      setResetEmail(currentUser.email || "");

      const { data, error: profileLoadError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (profileLoadError) {
        console.error("Profile load error:", profileLoadError);
      }

      let profileData = data;

      if (!profileData) {
        const fallbackName =
          currentUser.user_metadata?.display_name ||
          currentUser.email?.split("@")[0] ||
          "Jugador GKG";

        const nowIso = new Date().toISOString();

        const { data: createdProfile, error: createProfileError } =
          await supabase
            .from("profiles")
            .upsert(
              {
                id: currentUser.id,
                display_name: fallbackName,
                premios_count: 0,
                sorteos_ganados_count: 0,
                participaciones_count: 0,
                is_vip: false,
                presence_status: "online",
                last_seen: nowIso,
                deleted_at: null,
                restore_until: null,
                show_country: true,
                show_birthday: true,
                allow_profile_search: true,
                notify_email: true,
                notify_whatsapp: false,
                created_at: nowIso,
                updated_at: nowIso,
              },
              { onConflict: "id" }
            )
            .select("*")
            .single();

        if (createProfileError) {
          console.error("Create profile error:", createProfileError);
        } else {
          profileData = createdProfile;
        }
      }

      if (profileData) {
        setPresenceStatus(profileData.presence_status || "online");

        const normalizedProfile = {
          first_name: profileData.first_name || "",
          middle_name: profileData.middle_name || "",
          last_name: profileData.last_name || "",
          display_name: profileData.display_name || "",
          fortnite_user: profileData.ganker_user || profileData.fortnite_user || "",
          ganker_user: profileData.ganker_user || profileData.fortnite_user || "",
          phone: profileData.phone || "",
          birthday: profileData.birthday || "",
          country: profileData.country || "",
          avatar_url: profileData.avatar_url || "",
          facebook: profileData.facebook || "",
          premios_count: Number(profileData.premios_count ?? 0),
          sorteos_ganados_count: Number(profileData.sorteos_ganados_count ?? 0),
          participaciones_count: Number(profileData.participaciones_count ?? 0),
          is_vip: Boolean(profileData.is_vip ?? false),
          account_role: profileData.account_role || "user",
          public_profile_number: profileData.public_profile_number || null,
          presence_status: profileData.presence_status || "offline",
          last_seen: profileData.last_seen || null,
          fortnite_user_updated_at:
            profileData.fortnite_user_updated_at || null,
          email_updated_at: profileData.email_updated_at || null,
          deleted_at: profileData.deleted_at || null,
          restore_until: profileData.restore_until || null,
          show_country: profileData.show_country !== false,
          show_birthday: profileData.show_birthday !== false,
          allow_profile_search: profileData.allow_profile_search !== false,
          notify_email: profileData.notify_email !== false,
          notify_whatsapp: Boolean(profileData.notify_whatsapp),
          vip_started_at: profileData.vip_started_at || null,
          vip_until: profileData.vip_until || null,
          vip_last_paid_at: profileData.vip_last_paid_at || null,
          vip_grace_until: profileData.vip_grace_until || null,
          vip_streak_months: Number(profileData.vip_streak_months ?? 0),
          vip_cycle_months: Number(profileData.vip_cycle_months ?? 0),
          vip_total_months: Number(profileData.vip_total_months ?? 0),
        };

        setProfile(normalizedProfile);
        setDraftProfile(normalizedProfile);
        setDraftProfileEmail(currentUser.email || "");
        setPrivacyForm({
          show_country: normalizedProfile.show_country !== false,
          show_birthday: normalizedProfile.show_birthday !== false,
          allow_profile_search: normalizedProfile.allow_profile_search !== false,
        });
        setNotificationForm({
          notify_email: normalizedProfile.notify_email !== false,
          notify_whatsapp: Boolean(normalizedProfile.notify_whatsapp),
        });

        if (normalizedProfile.deleted_at) {
          setConfigSection("delete");
          setActiveTab("Configuración");
        }
      } else {
        setPresenceStatus("online");
      }

        // El perfil básico ya está listo. No detenemos toda la pantalla
        // mientras cargan comunidad, historial o presencia.
        setLoading(false);

        void Promise.allSettled([
          updatePresenceStatus("online", currentUser.id),
          loadSocialData(currentUser.id),
          loadSettingsData(currentUser.id),
        ]);
      } catch (error) {
        console.error("Profile initialization error:", error);
        setProfileMessage(
          "No se pudo terminar de cargar el perfil. Revisa tu conexión y actualiza la página."
        );
      } finally {
        window.clearTimeout(loadingSafetyTimeout);

        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
      window.clearTimeout(loadingSafetyTimeout);
    };
  }, [router, supabase]);

  async function updatePresenceStatus(status, targetUserId = user?.id) {
    setPresenceStatus(status);

    if (!targetUserId) return;

    try {
      await supabase
        .from("profiles")
        .update({
          presence_status: status,
          last_seen: new Date().toISOString(),
        })
        .eq("id", targetUserId);
    } catch (error) {
      console.error("Presence update error:", error);
    }
  }

  async function handlePresenceChange(status) {
    setManualPresence(true);
    await updatePresenceStatus(status);
  }

  async function handleAvatarFileChange(event) {
    const file = event.target.files?.[0];

    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      setProfileMessage("Selecciona un archivo de imagen válido.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setProfileMessage("La imagen no debe pesar más de 5 MB.");
      return;
    }

    setAvatarUploading(true);
    setProfileMessage("");

    try {
      const extension = file.name.split(".").pop() || "jpg";
      const filePath = `${user.id}/avatar-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = publicData.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      setProfile((current) => ({
        ...current,
        avatar_url: publicUrl,
      }));

      setProfileMessage(t.avatarUploadSuccess);
      await loadSocialData(user.id);
    } catch (error) {
      setProfileMessage(`${t.avatarUploadError} ${error.message || ""}`);
    } finally {
      setAvatarUploading(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  }

  useEffect(() => {
    if (!user) return;

    let awayTimer;
    let logoutTimer;

    const resetTimers = () => {
      clearTimeout(awayTimer);
      clearTimeout(logoutTimer);

      if (!manualPresence && presenceStatus !== "online") {
        updatePresenceStatus("online");
      }

      awayTimer = setTimeout(() => {
        if (!manualPresence) {
          updatePresenceStatus("away");
        }
      }, 5 * 60 * 1000);

      logoutTimer = setTimeout(async () => {
        await updatePresenceStatus("offline");
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
      }, 30 * 60 * 1000);
    };

    const activityEvents = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    activityEvents.forEach((eventName) =>
      window.addEventListener(eventName, resetTimers, { passive: true })
    );

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresenceStatus("offline");
      } else if (!manualPresence) {
        updatePresenceStatus("online");
        resetTimers();
      }
    };

    const handleBeforeUnload = () => {
      updatePresenceStatus("offline");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    resetTimers();

    return () => {
      clearTimeout(awayTimer);
      clearTimeout(logoutTimer);

      activityEvents.forEach((eventName) =>
        window.removeEventListener(eventName, resetTimers)
      );

      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [manualPresence, presenceStatus, router, supabase, user]);

  async function loadSocialData(currentUserId = user?.id) {
    if (!currentUserId) return;

    setSocialLoading(true);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;

      if (!token) {
        setSocialLoading(false);
        return;
      }

      const response = await fetch("/api/community/social", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(result.error || "No se pudo cargar la comunidad.");
      }

      setCommunityProfiles(result.communityProfiles || []);
      setFollowingIds((result.followingIds || []).map((id) => String(id)));
      setFollowersCount(result.followersCount || 0);
      setFollowingCount(result.followingCount || 0);
    } catch (error) {
      const readableError =
        error?.message ||
        "No se pudo cargar la comunidad. Revisa la ruta /api/community/social.";

      setSocialMessage(readableError);
      console.error("Community data error:", readableError, error);
    } finally {
      setSocialLoading(false);
    }
  }

  function scrollToCommunity() {
    setActiveTab("Comunidad");

    if (typeof window === "undefined") return;

    window.setTimeout(() => {
      document.getElementById("community-directory")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  }

  function scrollToTop() {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function scrollToBottom() {
    if (typeof window === "undefined") return;
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  }

  async function toggleFollow(targetProfileId) {
    const targetId = String(targetProfileId || "");
    const currentUserId = String(user?.id || "");

    if (!currentUserId || !targetId || idsMatch(targetId, currentUserId)) return;

    setSocialMessage("");

    const wasFollowing = followingIds.some((id) => idsMatch(id, targetId));

    // Cambio visual inmediato para que el botón pase a "Siguiendo" al instante.
    setFollowingIds((current) => {
      const alreadyFollowing = current.some((id) => idsMatch(id, targetId));

      if (wasFollowing) {
        return current.filter((id) => !idsMatch(id, targetId));
      }

      return alreadyFollowing ? current : [...current, targetId];
    });

    setFollowingCount((count) =>
      wasFollowing ? Math.max(0, count - 1) : count + 1
    );

    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;

      if (!token) {
        throw new Error("Inicia sesión para seguir a otros jugadores.");
      }

      const response = await fetch("/api/community/follow", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target_profile_id: targetId,
          action: wasFollowing ? "unfollow" : "follow",
        }),
      });

      const result = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(result.error || "No se pudo actualizar el seguimiento.");
      }

      const returnedFollowingIds = (result.followingIds || []).map((id) =>
        String(id)
      );

      setCommunityProfiles(result.communityProfiles || []);
      setFollowingIds(() => {
        if (wasFollowing) {
          return returnedFollowingIds.filter((id) => !idsMatch(id, targetId));
        }

        return returnedFollowingIds.some((id) => idsMatch(id, targetId))
          ? returnedFollowingIds
          : [...returnedFollowingIds, targetId];
      });

      setFollowersCount(result.followersCount || 0);
      setFollowingCount(
        wasFollowing
          ? Math.max(0, Number(result.followingCount || 0))
          : Math.max(1, Number(result.followingCount || 0))
      );

      await addChangeHistory(
        wasFollowing ? "unfollow_user" : "follow_user",
        wasFollowing ? "Dejó de seguir a un usuario" : "Siguió a un usuario"
      );
    } catch (error) {
      await loadSocialData(currentUserId);

      const readableError =
        error?.message ||
        error?.details ||
        error?.hint ||
        "No se pudo actualizar el seguimiento.";

      setSocialMessage(readableError);
      console.error("Follow toggle error:", readableError, error);
    }
  }

  function requestSaveProfile(event) {
    event.preventDefault();
    setProfileMessage("");
    setShowSaveConfirm(true);
  }

  async function confirmSaveProfile() {
    if (!user || !draftProfile) return;

    setSaving(true);
    setProfileMessage("");
    setShowSaveConfirm(false);

    const firstName = draftProfile.first_name.trim();
    const middleName = draftProfile.middle_name.trim();
    const lastName = draftProfile.last_name.trim();
    const newFortniteUser = draftProfile.fortnite_user.trim();
    const phone = draftProfile.phone.trim();
    const requestedEmail = draftProfileEmail.trim().toLowerCase();
    const currentEmail = (user.email || "").trim().toLowerCase();
    const newEmail = requestedEmail || currentEmail;

    if (!firstName) {
      setProfileMessage(t.requiredFirstName);
      setSaving(false);
      return;
    }

    if (!lastName) {
      setProfileMessage(t.requiredLastName);
      setSaving(false);
      return;
    }

    if (!newFortniteUser) {
      setProfileMessage(
        lang === "es"
          ? "El usuario de Ganker Games es obligatorio."
          : "Ganker Games username is required."
      );
      setSaving(false);
      return;
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(newFortniteUser)) {
      setProfileMessage(
        lang === "es"
          ? "El usuario de Ganker Games solo puede tener letras, números, punto, guion o guion bajo."
          : "Ganker Games username can only contain letters, numbers, dots, hyphens, or underscores."
      );
      setSaving(false);
      return;
    }

    if (!newEmail) {
      setProfileMessage(t.requiredEmail);
      setSaving(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setProfileMessage(t.invalidEmail);
      setSaving(false);
      return;
    }

    const { data: currentProfile, error: currentProfileError } = await supabase
      .from("profiles")
      .select("ganker_user, fortnite_user, fortnite_user_updated_at, email_updated_at")
      .eq("id", user.id)
      .maybeSingle();

    if (currentProfileError) {
      setProfileMessage(currentProfileError.message);
      setSaving(false);
      return;
    }

    const previousFortniteUser = currentProfile?.ganker_user || currentProfile?.fortnite_user || "";
    const previousFortniteUpdate = currentProfile?.fortnite_user_updated_at || null;
    const previousEmailUpdate = currentProfile?.email_updated_at || null;

    const fortniteChanged = previousFortniteUser !== newFortniteUser;
    const emailChanged = currentEmail !== newEmail;

    if (fortniteChanged && previousFortniteUpdate) {
      const daysLeft = daysLeftFromDate(previousFortniteUpdate, 20);

      if (daysLeft > 0) {
        setProfileMessage(`${t.fortniteLocked} ${t.canChangeIn} ${daysLeft} ${t.days}.`);
        setSaving(false);
        return;
      }
    }

    if (emailChanged && previousEmailUpdate) {
      const daysLeft = daysLeftFromDate(previousEmailUpdate, 20);

      if (daysLeft > 0) {
        setProfileMessage(`${t.emailLocked} ${t.canChangeIn} ${daysLeft} ${t.days}.`);
        setSaving(false);
        return;
      }
    }

    if (fortniteChanged) {
      const { data: available, error: userCheckError } = await supabase.rpc(
        "is_ganker_user_available",
        { username_input: newFortniteUser }
      );

      if (userCheckError) {
        setProfileMessage(
          lang === "es"
            ? "No se pudo validar si el usuario de Ganker Games está disponible."
            : "Could not validate if the Ganker Games username is available."
        );
        setSaving(false);
        return;
      }

      if (!available) {
        setProfileMessage(
          lang === "es"
            ? "Ese usuario de Ganker Games ya está registrado."
            : "That Ganker Games username is already taken."
        );
        setSaving(false);
        return;
      }
    }

    const fullName = `${firstName} ${middleName} ${lastName}`
      .replace(/\s+/g, " ")
      .trim();

    const nowIso = new Date().toISOString();

    const payload = {
      id: user.id,
      first_name: firstName,
      middle_name: middleName || null,
      last_name: lastName,
      display_name: fullName,
      fortnite_user: newFortniteUser,
      ganker_user: newFortniteUser,
      phone: phone || null,
      birthday: draftProfile.birthday || null,
      country: draftProfile.country || null,
      premios_count: Number(profile.premios_count ?? 0),
      sorteos_ganados_count: Number(profile.sorteos_ganados_count ?? 0),
      participaciones_count: Number(profile.participaciones_count ?? 0),
      is_vip: Boolean(profile.is_vip ?? false),
      deleted_at: profile.deleted_at || null,
      restore_until: profile.restore_until || null,
      show_country: profile.show_country !== false,
      show_birthday: profile.show_birthday !== false,
      allow_profile_search: profile.allow_profile_search !== false,
      notify_email: profile.notify_email !== false,
      notify_whatsapp: Boolean(profile.notify_whatsapp),
      updated_at: nowIso,
    };

    if (fortniteChanged) {
      payload.fortnite_user_updated_at = nowIso;
    }

    if (emailChanged) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (emailError) {
        setProfileMessage(emailError.message);
        setSaving(false);
        return;
      }

      payload.email_updated_at = nowIso;
    }

    const { error } = await supabase.from("profiles").upsert(payload);

    if (error) {
      setProfileMessage(error.message);
    } else {
      const updatedProfile = {
        ...profile,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        display_name: fullName,
        fortnite_user: newFortniteUser,
        ganker_user: newFortniteUser,
        phone,
        birthday: draftProfile.birthday,
        country: draftProfile.country,
        show_country: profile.show_country !== false,
        show_birthday: profile.show_birthday !== false,
        allow_profile_search: profile.allow_profile_search !== false,
        notify_email: profile.notify_email !== false,
        notify_whatsapp: Boolean(profile.notify_whatsapp),
        fortnite_user_updated_at: fortniteChanged
          ? payload.fortnite_user_updated_at
          : profile.fortnite_user_updated_at,
        email_updated_at: emailChanged
          ? payload.email_updated_at
          : profile.email_updated_at,
      };

      setProfile(updatedProfile);
      setDraftProfile(updatedProfile);
      setProfileEmail(emailChanged ? newEmail : (requestedEmail || currentEmail));
      setDraftProfileEmail(emailChanged ? newEmail : (requestedEmail || currentEmail));

      setProfileMessage(emailChanged ? t.profileUpdatedEmail : t.profileUpdated);
      await addChangeHistory("profile_update", lang === "es" ? "Actualizó datos del perfil" : "Updated profile details");
      await loadSocialData(user.id);
      await loadSettingsData(user.id);
    }

    setSaving(false);
  }

  async function addChangeHistory(changeType, description) {
    if (!user?.id) return;

    try {
      await supabase.from("profile_change_history").insert({
        profile_id: user.id,
        change_type: changeType,
        description,
      });
    } catch (error) {
      console.warn("Change history error:", error);
    }
  }

  async function loadSettingsData(currentUserId = user?.id) {
    if (!currentUserId) return;

    try {
      const { data: blockedUsers, error: blockError } = await supabase.rpc(
        "get_my_blocked_profiles"
      );

      if (blockError) throw blockError;

      setBlockedProfiles(blockedUsers || []);
    } catch (error) {
      console.warn("Blocked users load error:", error);
      setBlockedProfiles([]);
    }

    try {
      const { data: historyRows, error: historyError } = await supabase
        .from("profile_change_history")
        .select("id, change_type, description, created_at")
        .eq("profile_id", currentUserId)
        .order("created_at", { ascending: false })
        .limit(30);

      if (historyError) throw historyError;
      setProfileHistory(historyRows || []);
    } catch (error) {
      console.warn("Change history load error:", error);
      setProfileHistory([]);
    }
  }

  async function savePrivacySettings(event) {
    event.preventDefault();
    if (!user) return;

    setSettingsSaving(true);
    setSettingsMessage("");

    try {
      const payload = {
        show_country: Boolean(privacyForm.show_country),
        show_birthday: Boolean(privacyForm.show_birthday),
        allow_profile_search: Boolean(privacyForm.allow_profile_search),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", user.id);

      if (error) throw error;

      setProfile((current) => ({ ...current, ...payload }));
      setDraftProfile((current) => (current ? { ...current, ...payload } : current));
      setSettingsMessage(t.privacySaved);
      await addChangeHistory("privacy_update", lang === "es" ? "Actualizó privacidad del perfil" : "Updated profile privacy");
      await loadSettingsData(user.id);
    } catch (error) {
      setSettingsMessage(error.message || "No se pudo guardar la privacidad.");
    } finally {
      setSettingsSaving(false);
    }
  }

  async function saveNotificationSettings(event) {
    event.preventDefault();
    if (!user) return;

    setSettingsSaving(true);
    setSettingsMessage("");

    try {
      const payload = {
        notify_email: Boolean(notificationForm.notify_email),
        notify_whatsapp: Boolean(notificationForm.notify_whatsapp),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", user.id);

      if (error) throw error;

      setProfile((current) => ({ ...current, ...payload }));
      setDraftProfile((current) => (current ? { ...current, ...payload } : current));
      setSettingsMessage(t.notificationsSaved);
      await addChangeHistory("notifications_update", lang === "es" ? "Actualizó notificaciones" : "Updated notifications");
      await loadSettingsData(user.id);
    } catch (error) {
      setSettingsMessage(error.message || "No se pudieron guardar las notificaciones.");
    } finally {
      setSettingsSaving(false);
    }
  }

  async function blockUser(targetProfile) {
    if (!user?.id || !targetProfile?.id || idsMatch(targetProfile.id, user.id)) return;

    if (isProtectedRole(targetProfile)) {
      setSettingsMessage(
        lang === "es"
          ? "No puedes bloquear administradores o creadores de Ganker Games."
          : "You cannot block Ganker Games admins or creators."
      );
      return;
    }

    setSettingsSaving(true);
    setSettingsMessage("");

    try {
      const { error } = await supabase.rpc("block_profile", {
        target_profile_id: targetProfile.id,
      });

      if (error) throw error;

      setBlockedProfiles((current) => {
        const alreadyBlocked = current.some((blocked) =>
          idsMatch(blocked.id, targetProfile.id)
        );

        return alreadyBlocked ? current : [targetProfile, ...current];
      });

      setCommunityProfiles((current) =>
        current.filter((item) => !idsMatch(item.id, targetProfile.id))
      );

      setSettingsMessage(t.blockSaved);
      await addChangeHistory(
        "block_user",
        `${lang === "es" ? "Bloqueó a" : "Blocked"} ${getProfileDisplayName(targetProfile)}`
      );
      await loadSettingsData(user.id);
      await loadSocialData(user.id);
    } catch (error) {
      setSettingsMessage(error.message || "No se pudo bloquear el usuario.");
    } finally {
      setSettingsSaving(false);
    }
  }

  async function unblockUser(targetProfile) {
    if (!user?.id || !targetProfile?.id) return;

    setSettingsSaving(true);
    setSettingsMessage("");

    try {
      const { error } = await supabase.rpc("unblock_profile", {
        target_profile_id: targetProfile.id,
      });

      if (error) throw error;

      setBlockedProfiles((current) =>
        current.filter((blocked) => !idsMatch(blocked.id, targetProfile.id))
      );

      setSettingsMessage(t.blockSaved);
      await addChangeHistory(
        "unblock_user",
        `${lang === "es" ? "Desbloqueó a" : "Unblocked"} ${getProfileDisplayName(targetProfile)}`
      );
      await loadSettingsData(user.id);
      await loadSocialData(user.id);
    } catch (error) {
      setSettingsMessage(error.message || "No se pudo desbloquear el usuario.");
    } finally {
      setSettingsSaving(false);
    }
  }

  async function logoutAllDevices() {
    setSettingsSaving(true);
    setSettingsMessage("");

    try {
      await addChangeHistory("security_logout_all", lang === "es" ? "Cerró sesión en todos los dispositivos" : "Logged out of all devices");
      await supabase.auth.signOut({ scope: "global" });
      router.replace("/login");
      router.refresh();
    } catch (error) {
      setSettingsMessage(error.message || "No se pudo cerrar sesión en todos los dispositivos.");
    } finally {
      setSettingsSaving(false);
    }
  }

  async function deleteProfile() {
    if (!user) return;

    const expectedText = lang === "es" ? "BORRAR PERFIL" : "DELETE PROFILE";

    if (deleteConfirmText.trim().toUpperCase() !== expectedText) {
      setDeleteMessage(t.deleteProfileTypeToConfirm);
      return;
    }

    setDeletingProfile(true);
    setDeleteMessage("");

    try {
      const now = new Date();
      const restoreUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const { error } = await supabase
        .from("profiles")
        .update({
          deleted_at: now.toISOString(),
          restore_until: restoreUntil.toISOString(),
          presence_status: "offline",
          updated_at: now.toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile((current) => ({
        ...current,
        deleted_at: now.toISOString(),
        restore_until: restoreUntil.toISOString(),
        presence_status: "offline",
      }));
      setPresenceStatus("offline");
      setDeleteConfirmText("");
      setDeleteMessage(t.deleteProfileSuccess);
      await addChangeHistory("profile_delete", lang === "es" ? "Marcó su perfil para borrarse" : "Marked profile for deletion");

      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
      return;
    } catch (error) {
      setDeleteMessage(`${t.deleteProfileError} ${error.message || ""}`);
    } finally {
      setDeletingProfile(false);
    }
  }

  async function restoreProfile() {
    if (!user) return;

    setRestoringProfile(true);
    setDeleteMessage("");

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          deleted_at: null,
          restore_until: null,
          presence_status: "online",
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile((current) => ({
        ...current,
        deleted_at: null,
        restore_until: null,
        presence_status: "online",
      }));
      setPresenceStatus("online");
      setDeleteMessage(t.restoreProfileSuccess);
      await addChangeHistory("profile_restore", lang === "es" ? "Restauró su perfil" : "Restored profile");
      await loadSocialData(user.id);
      await loadSettingsData(user.id);
    } catch (error) {
      setDeleteMessage(error.message || t.deleteProfileError);
    } finally {
      setRestoringProfile(false);
    }
  }

  async function savePassword(event) {
    event.preventDefault();

    if (!user?.email) {
      setPasswordMessage(t.noAccountEmail);
      return;
    }

    setSaving(true);
    setPasswordMessage("");

    const currentPassword = passwordForm.current_password;
    const newPassword = passwordForm.new_password;
    const confirmPassword = passwordForm.confirm_password;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage(t.passwordMissing);
      setSaving(false);
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage(t.passwordMin);
      setSaving(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage(t.passwordMismatch);
      setSaving(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      setPasswordMessage(t.passwordWrong);
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setPasswordMessage(updateError.message);
    } else {
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setPasswordMessage(t.passwordUpdated);
      await addChangeHistory("password_update", lang === "es" ? "Actualizó su contraseña" : "Updated password");
    }

    setSaving(false);
  }

  async function sendResetPassword(event) {
    event.preventDefault();

    setSaving(true);
    setResetMessage("");

    const email = resetEmail.trim().toLowerCase();

    if (!email) {
      setResetMessage(t.writeEmail);
      setSaving(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setResetMessage(error.message);
    } else {
      setResetMessage(t.resetSent);
    }

    setSaving(false);
  }

  async function logout() {
    await updatePresenceStatus("offline");
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="relative flex min-h-screen w-full max-w-[100vw] items-center justify-center overflow-x-hidden bg-[#001207] text-white">
        <GkgTwinkleBackground />
      <style jsx global>{`@keyframes slideInRight{from{transform:translateX(100%);opacity:.65}to{transform:translateX(0);opacity:1}}@keyframes slideOutRight{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:.65}}`}</style>
        <div className="rounded-3xl border border-[#1eff7a]/30 bg-[#020804] p-6 font-black text-[#1eff7a] shadow-[0_0_30px_rgba(30,255,122,.18)]">
          {t.loading}
        </div>
      </main>
    );
  }

  return (
    <main translate="no" className="gkg-mobile-shell relative isolate min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(0,255,102,0.14),_transparent_24%),linear-gradient(180deg,#001f0b_0%,#001708_45%,#001207_100%)] text-white">
      <GkgTwinkleBackground />
      <style jsx global>{`
        html,
        body {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
        }

        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        @media (max-width: 767px) {
          body {
            position: relative;
          }

          main,
          header,
          section {
            max-width: 100vw;
          }

          img,
          video,
          canvas,
          svg {
            max-width: 100%;
          }

          .gkg-mobile-shell {
            width: 100%;
            max-width: 100vw;
            overflow-x: hidden;
          }

          .gkg-mobile-text-safe {
            overflow-wrap: anywhere;
            word-break: normal;
          }
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0.65; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0.65; }
        }
        @keyframes mobileMenuDrop {
          from { transform: translateY(-14px) scale(0.94); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes gkgTwinkle {
          0%, 100% { opacity: 0.22; transform: scale(0.82); }
          50% { opacity: 1; transform: scale(1.14); }
        }
        @keyframes gkgFloatGlow {
          0%, 100% { opacity: 0.16; transform: translate3d(0, 0, 0); }
          50% { opacity: 0.36; transform: translate3d(0, -12px, 0); }
        }
      `}</style>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarFileChange}
      />
      <header className="sticky top-0 z-[100] w-full max-w-[100vw] overflow-hidden border-b border-[#0f3d22] bg-[#020804]/95 backdrop-blur-xl supports-[backdrop-filter]:bg-[#020804]/90">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-3">
          <a
            href="/"
            aria-label="Ir al inicio de GankerGames"
            className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3"
          >
            <img
              src="/gankergames-header-logo.png"
              alt="Logo de Ganker Games"
              className="h-9 w-auto max-w-[112px] shrink-0 object-contain drop-shadow-[0_0_12px_rgba(30,255,122,.40)] sm:h-11 sm:max-w-[155px]"
            />

            <span className="inline shrink-0 text-[8px] font-black uppercase tracking-[0.18em] text-[#63ff9b] sm:text-xs sm:tracking-[0.35em]">
              {t.profileLabel}
            </span>
          </a>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleLang}
              aria-label="Cambiar idioma"
              className="flex h-11 items-center gap-1 rounded-2xl border border-[#1eff7a]/35 bg-[#021509] px-2 text-xs font-black uppercase tracking-wide text-[#63ff9b] shadow-[0_0_20px_rgba(30,255,122,.12)] transition hover:border-[#63ff9b] sm:h-12 sm:gap-2 sm:px-4 sm:text-sm"
            >
              <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black text-white sm:text-[11px]">
                {lang === "es" ? "ESP" : "ENG"}
              </span>
              <Globe2 size={16} />
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("Perfil");
                setMobileTabsOpen(false);
                router.push("/perfil");

                if (typeof window !== "undefined") {
                  window.setTimeout(
                    () => window.scrollTo({ top: 0, behavior: "smooth" }),
                    60
                  );
                }
              }}
              aria-label={t.myProfile}
              title={t.myProfile}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#1eff7a]/40 bg-[#021509] text-[#63ff9b] shadow-[0_0_20px_rgba(30,255,122,.14)] transition hover:border-[#63ff9b] hover:bg-[#063115] sm:h-12 sm:w-12"
            >
              <img
                src="/gankergames-profile-icon.png"
                alt=""
                aria-hidden="true"
                className="h-8 w-8 object-contain"
              />
            </button>

            <button
              type="button"
              onClick={logout}
              aria-label={t.logout}
              title={t.logout}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-red-500/40 bg-red-500/10 text-sm font-black text-red-300 transition hover:bg-red-500/20 sm:h-12 sm:w-auto sm:gap-2 sm:px-4"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">{t.logout}</span>
            </button>
          </div>
        </div>
      </header>

      {languageChanging && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/72 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[30px] border border-[#1eff7a]/35 bg-[linear-gradient(180deg,rgba(4,18,13,0.95)_0%,rgba(4,14,11,0.92)_100%)] p-6 text-center shadow-[0_0_55px_rgba(21,216,99,0.14)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#8cff9f]/55 bg-[radial-gradient(circle_at_30%_30%,rgba(22,232,61,0.28),rgba(6,30,18,0.95)_70%)] text-[#67ff9a] shadow-[0_0_24px_rgba(21,216,99,0.28)]">
              <Globe2 size={40} />
            </div>
            <p className="mt-5 text-2xl font-black italic text-white">
              {lang === "es" ? "Cambiando idioma" : "Changing language"}
            </p>
            <p className="mt-2 text-sm font-black uppercase tracking-[0.25em] text-[#67ff9a]">
              {lang === "es" ? "Cargando..." : "Loading..."}
            </p>
            <img
              src="/ganker-logo.png"
              alt="GKG"
              className="mx-auto mt-5 h-16 w-16 rounded-full border border-[#19ff72]/45 object-cover shadow-[0_0_18px_rgba(25,255,114,0.25)]"
            />
            <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-[#ff4d4d]">
              {(nextLanguage || lang) === "es" ? "ESP" : "ENG"}
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setMobileTabsOpen(true)}
        aria-label="Abrir menú del perfil"
        className={`fixed right-3 top-[64px] z-[70] flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1eff7a]/35 bg-[#07140f]/95 text-[#67ff9a] shadow-[0_0_18px_rgba(21,216,99,0.16)] transition-all duration-300 hover:border-[#67ff9a] hover:bg-[#0b1f15] md:hidden ${
          showScrollTop ? "translate-y-0 scale-95 shadow-[0_0_26px_rgba(30,255,122,.26)]" : "translate-y-1 scale-100"
        }`}
        style={{ animation: "mobileMenuDrop 260ms ease-out" }}
      >
        <span className="flex flex-col gap-1.5">
          <span className="block h-0.5 w-5 rounded-full bg-current" />
          <span className="block h-0.5 w-5 rounded-full bg-current" />
          <span className="block h-0.5 w-5 rounded-full bg-current" />
        </span>
      </button>

      <section className="relative overflow-hidden border-b border-[#0f3d22]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_25%,rgba(30,255,122,0.22),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(0,255,102,0.12),transparent_25%),linear-gradient(180deg,#06240f_0%,#001808_100%)]" />
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(30,255,122,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(30,255,122,.08)_1px,transparent_1px)] [background-size:42px_42px]" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:py-8">
          <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-end">
            <div className="relative flex items-center gap-3 sm:block">
              <AvatarDisplay
                src={avatarSrc}
                alt="Perfil GKG"
                status={currentPresence}
                size="lg"
                uploading={avatarUploading}
              />

              {(isCreatorProfile || profile.is_vip) && (
                <div className="flex flex-col items-start gap-2 sm:hidden">
                  {isCreatorProfile && <CreatorBadge size="xs" />}

                  {profile.is_vip && (
                    <div className="flex items-center gap-2">
                      <BadgeCheck
                        className="text-cyan-300 drop-shadow-[0_0_12px_rgba(103,232,249,.55)]"
                        size={26}
                      />

                      <span className="whitespace-nowrap rounded-lg border border-cyan-300/45 bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,.18)]">
                        {profileVipBadgeLabel}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="gkg-mobile-text-safe max-w-full text-[2.15rem] font-black italic leading-[1.05] tracking-tight text-white drop-shadow-[4px_4px_0_rgba(0,0,0,.95)] sm:text-4xl md:text-5xl">
                  {displayName}
                </h1>

                {isCreatorProfile && (
                  <CreatorBadge className="hidden sm:inline-flex" />
                )}

                {profile.is_vip && (
                  <>
                    <BadgeCheck className="hidden text-cyan-300 drop-shadow-[0_0_12px_rgba(103,232,249,.55)] sm:block" size={28} />

                    <span className="hidden rounded-lg border border-cyan-300/45 bg-cyan-300/10 px-3 py-1 text-sm font-bold text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,.18)] sm:inline-flex">
                      {profileVipBadgeLabel}
                    </span>
                  </>
                )}
              </div>

              <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2 text-sm text-zinc-300 sm:text-base">
                <StatusSelector
                  status={currentPresence}
                  t={t}
                  disabled={!user}
                  onChange={handlePresenceChange}
                />

                <span className="text-zinc-500">|</span>
                <span className="min-w-0 truncate">{fortniteUser}</span>

                {avatarUploading && (
                  <span className="text-xs font-bold text-[#63ff9b]">
                    {t.uploadingAvatar}
                  </span>
                )}
              </div>

              <div className="mt-6 grid w-full max-w-full grid-cols-[1.15fr_.85fr] gap-3 md:hidden">
                <div className="overflow-hidden rounded-2xl border border-[#1eff7a]/20 bg-[#020804]/55 backdrop-blur">
                  {stats.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="flex items-center gap-3 border-b border-[#1eff7a]/12 p-3 last:border-b-0"
                      >
                        <Icon className="shrink-0 text-[#1eff7a]" size={24} />
                        <div className="min-w-0">
                          <p className="text-lg font-black">{item.value}</p>
                          <p className="text-[11px] leading-tight text-zinc-400">{item.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="overflow-hidden rounded-2xl border border-[#1eff7a]/20 bg-[#020804]/55 backdrop-blur">
                  <div className="border-b border-[#1eff7a]/12 p-3 text-center">
                    <UsersRound className="mx-auto mb-1 text-zinc-400" size={20} />
                    <p className="text-[11px] leading-tight text-zinc-400">{t.followers}</p>
                    <p className="text-lg font-black">{followersCount}</p>
                  </div>

                  <div className="p-3 text-center">
                    <UsersRound className="mx-auto mb-1 text-zinc-400" size={20} />
                    <p className="text-[11px] leading-tight text-zinc-400">{t.following}</p>
                    <p className="text-lg font-black">{followingCount}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 hidden w-full max-w-full grid-cols-3 overflow-hidden rounded-2xl border border-[#1eff7a]/20 bg-[#020804]/55 backdrop-blur md:grid">
                {stats.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 border-r border-[#1eff7a]/12 p-4 last:border-r-0"
                    >
                      <Icon className="text-[#1eff7a]" size={28} />
                      <div>
                        <p className="text-xl font-black">{item.value}</p>
                        <p className="text-xs text-zinc-400">{item.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-[55] hidden w-full max-w-[100vw] overflow-hidden border-b border-[#0f3d22] bg-[#020804]/95 backdrop-blur-xl md:block">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-4">
          <div className="flex gap-4 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex shrink-0 items-center gap-2 border-b-2 px-6 py-4 text-sm font-bold transition ${
                    active
                      ? "border-[#1eff7a] text-[#63ff9b]"
                      : "border-transparent text-zinc-400 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <MobileProfileTabsDrawer
        open={mobileTabsOpen}
        tabs={tabs}
        activeTab={activeTab}
        onSelect={setActiveTab}
        onClose={() => setMobileTabsOpen(false)}
      />

      {!showScrollTop && (
        <button
          type="button"
          onClick={scrollToBottom}
          aria-label="Ir al fondo"
          className="fixed bottom-24 right-5 z-[70] flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#8cff9f] bg-[linear-gradient(135deg,#0d2418_0%,#0a1c12_100%)] text-[#67ff9a] shadow-[0_0_0_2px_rgba(21,255,98,0.14),0_0_24px_rgba(21,255,98,0.32),0_10px_22px_rgba(0,0,0,0.40)] transition hover:scale-105 hover:border-[#b4ffc0] hover:text-white md:bottom-[108px] md:right-7 md:h-14 md:w-14"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v13" />
            <path d="m6 12 6 6 6-6" />
          </svg>
        </button>
      )}

      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Volver arriba"
          className="fixed bottom-24 right-5 z-[70] flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#8cff9f] bg-[linear-gradient(135deg,#0d2418_0%,#0a1c12_100%)] text-[#67ff9a] shadow-[0_0_0_2px_rgba(21,255,98,0.14),0_0_24px_rgba(21,255,98,0.32),0_10px_22px_rgba(0,0,0,0.40)] transition hover:scale-105 hover:border-[#b4ffc0] hover:text-white md:bottom-[108px] md:right-7 md:h-14 md:w-14"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 19V6" />
            <path d="m6 12 6-6 6 6" />
          </svg>
        </button>
      )}

      {activeTab === "Perfil" && (
        <>
          <section className="mx-auto grid max-w-7xl items-stretch gap-4 px-3 py-4 sm:px-4 sm:py-6 lg:grid-cols-3">
            <Card className="h-full">
              <h2 className="mb-5 text-lg font-black drop-shadow-[2px_2px_0_rgba(0,0,0,.9)]">
                {t.playerInfo}
              </h2>

              <div className="rounded-2xl border border-[#1eff7a]/15 bg-[#021509]/70 p-4">
                <h3 className="line-clamp-2 text-xl font-black leading-tight">{displayName}</h3>
                <p className="mt-1 text-sm text-zinc-400">{fortniteUser}</p>

                <ProfileTagPills tags={profileTags} className="mt-3" />

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-xl border border-[#1eff7a]/15 bg-[#1eff7a]/10 px-3 py-2 text-xs font-bold text-[#63ff9b]">
                    {t.ownProfile}
                  </span>

                  <button
                    type="button"
                    onClick={scrollToCommunity}
                    className="rounded-xl border border-[#1eff7a]/35 bg-[#1eff7a]/12 px-3 py-2 text-xs font-bold text-[#63ff9b] transition hover:border-[#1eff7a] hover:bg-[#1eff7a]/20 hover:text-white"
                  >
                    {t.followPlayers}
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-4 border-t border-[#1eff7a]/15 pt-5 text-sm text-zinc-300">
                {profile.country && profile.show_country !== false && (
                  <InfoRow
                    icon={MapPin}
                    label={t.country}
                    value={profile.country}
                  />
                )}
                <InfoRow
                  icon={Clock}
                  label={t.status}
                  value={
                    currentPresence === "online"
                      ? t.statusOnline
                      : currentPresence === "away"
                        ? t.statusAway
                        : t.statusOffline
                  }
                />
                {profile.birthday && profile.show_birthday !== false && (
                  <InfoRow
                    icon={CalendarDays}
                    label={lang === "es" ? "Edad" : "Age"}
                    value={formatAgeFromBirthday(activeDraftProfile.birthday)}
                  />
                )}
              </div>
            </Card>

            <Card className="h-full">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#63ff9b]">
                    Ganker Games
                  </p>
                  <h2 className="mt-1 text-lg font-black">Actualizaciones de la página</h2>
                </div>

                <Bell className="text-[#63ff9b]" size={22} />
              </div>

              <div className="space-y-3">
                {(gkgUpdates.length ? gkgUpdates : []).slice(0, 4).map((update, index) => (
                  <button
                    type="button"
                    key={update.id || update.title}
                    onClick={() => openGkgUpdateModal(update)}
                    className={`${!showAllGkgUpdatesMobile && index >= 2 ? "hidden md:block" : ""} w-full rounded-2xl border border-[#1eff7a]/15 bg-[#021509]/80 p-4 text-left transition hover:border-[#63ff9b]/60 hover:bg-[#06220f]`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1eff7a]/10 text-[#63ff9b]">
                        <Zap size={18} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-1 font-black text-white">
                          {update.title || "Actualización Ganker Games"}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm leading-5 text-zinc-400">
                          {update.description || "Nueva mejora disponible dentro de la página."}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <p className="text-xs font-bold text-[#63ff9b]">
                            {formatDateForVip(update.created_at)}
                          </p>
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#1eff7a]/10 px-2 py-1 text-[11px] font-black text-[#63ff9b]">
                            <Heart size={12} /> {Number(update.likes_count || 0)}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-300/10 px-2 py-1 text-[11px] font-black text-cyan-100">
                            <MessageCircle size={12} /> {Number(update.comments_count || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}

                {!gkgUpdates.length && (
                  <div className="rounded-2xl border border-[#1eff7a]/15 bg-[#021509]/80 p-4 text-sm text-zinc-400">
                    Aún no hay actualizaciones publicadas.
                  </div>
                )}

                {gkgUpdates.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setShowAllGkgUpdatesMobile((current) => !current)}
                    className="mt-3 w-full rounded-2xl border border-[#1eff7a]/30 bg-[#1eff7a]/10 px-4 py-3 text-sm font-black text-[#63ff9b] md:hidden"
                  >
                    {showAllGkgUpdatesMobile ? "Mostrar menos" : "Mostrar más"}
                  </button>
                )}
              </div>
            </Card>

            <Card className="hidden h-full md:block">
              <h2 className="mb-5 text-lg font-black">{t.redGkg}</h2>

              <div className="grid overflow-hidden rounded-2xl border border-[#1eff7a]/15 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div className="border-[#1eff7a]/15 p-5 text-center sm:border-r lg:border-b lg:border-r-0 xl:border-b-0 xl:border-r">
                  <UsersRound className="mx-auto mb-2 text-zinc-400" />
                  <p className="text-xs text-zinc-400">{t.followers}</p>
                  <p className="text-2xl font-black">{followersCount}</p>
                </div>

                <div className="p-5 text-center">
                  <UsersRound className="mx-auto mb-2 text-zinc-400" />
                  <p className="text-xs text-zinc-400">{t.following}</p>
                  <p className="text-2xl font-black">{followingCount}</p>
                </div>
              </div>
            </Card>
          </section>

          <section className="mx-auto max-w-7xl px-4 pb-6">
            <Card>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-black">{t.interests}</h2>

                <div className="flex flex-wrap items-center gap-2">
                  {profile.is_vip && (
                    <button
                      type="button"
                      onClick={() => openInterestModal()}
                      disabled={customInterestCount >= 5}
                      className="rounded-xl border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-sm font-black text-cyan-100 hover:border-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Añadir interés
                    </button>
                  )}

                  {profile.is_vip && hiddenDefaultInterestCount > 0 && (
                    <button
                      type="button"
                      onClick={restoreDefaultInterests}
                      className="rounded-xl border border-[#1eff7a]/30 bg-[#1eff7a]/10 px-4 py-2 text-sm font-black text-[#63ff9b] hover:border-[#63ff9b]"
                    >
                      Restaurar bases
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowAllInterestsMobile((current) => !current)}
                    className="text-sm font-bold text-[#63ff9b]"
                  >
                    {showAllInterestsMobile ? "Mostrar menos" : t.viewAll}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                {combinedInterests.map((game, index) => (
                  <div
                    key={game.id || game.title}
                    className={`${!showAllInterestsMobile && index >= 2 ? "hidden md:block" : ""} group overflow-hidden rounded-2xl border border-[#1eff7a]/15 bg-[#020804]/70 transition hover:-translate-y-1 hover:border-[#1eff7a]/60 hover:shadow-[0_0_24px_rgba(30,255,122,.18)]`}
                  >
                    <a
                      href={game.url || "#"}
                      target={game.url && game.url !== "#" ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                    >
                      <div
                        className={`relative h-36 overflow-hidden bg-gradient-to-br ${game.gradient}`}
                      >
                        {game.image_url && (
                          <img
                            src={game.image_url}
                            alt={game.title}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        )}
                        <Star
                          className="absolute left-3 top-3 text-white drop-shadow"
                          size={18}
                        />
                        <div className="absolute inset-0 bg-black/20" />
                      </div>

                      <div className="p-3">
                        <h3 className="min-h-12 text-sm font-black leading-tight transition group-hover:text-[#63ff9b]">
                          {game.title}
                        </h3>
                      </div>
                    </a>

                    {profile.is_vip && (
                      <div className="flex gap-2 border-t border-[#1eff7a]/10 p-3">
                        <button
                          type="button"
                          onClick={() => openInterestModal(game)}
                          className="flex-1 rounded-xl border border-cyan-300/25 px-2 py-2 text-xs font-black text-cyan-100"
                        >
                          Configurar
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteInterest(game)}
                          className="flex-1 rounded-xl border border-red-500/35 bg-red-500/10 px-2 py-2 text-xs font-black text-red-200"
                        >
                          Borrar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <section className="mx-auto max-w-7xl px-4 pb-6">
            <Card>
              <h2 className="mb-5 text-lg font-black">{t.recentActivity}</h2>

              <div className="space-y-4">
                {liveActivityFeed.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="flex items-center justify-between rounded-2xl border border-[#1eff7a]/15 bg-[#020804]/65 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1eff7a]/10 text-[#1eff7a]">
                          <Icon size={24} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-zinc-200">
                            {displayName} {item.title}
                          </p>
                          <p className="text-xs text-zinc-500">{item.time}</p>
                        </div>
                      </div>

                      <ChevronRight className="text-zinc-500" size={20} />
                    </div>
                  );
                })}
              </div>
            </Card>
          </section>

        </>
      )}


      {activeTab === "Comunidad" && (

        <section id="community-directory" className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
            <Card>
              <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-2xl font-black">{t.communitySectionTitle}</h2>
                  <p className="mt-2 text-sm text-zinc-400">{t.communitySectionDesc}</p>
                </div>

                <div className="w-full lg:max-w-md">
                  <label className="relative block">
                    <Search
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#63ff9b]"
                    />
                    <input
                      type="search"
                      value={communitySearch}
                      onChange={(event) => setCommunitySearch(event.target.value)}
                      placeholder={t.communitySearchPlaceholder}
                      className="w-full rounded-2xl border border-[#1eff7a]/30 bg-[#021509] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-[#63ff9b] focus:shadow-[0_0_18px_rgba(30,255,122,.12)]"
                    />
                  </label>

                  {socialLoading && (
                    <p className="mt-2 text-xs font-bold text-[#63ff9b]">{t.socialLoading}</p>
                  )}
                </div>
              </div>

              {socialMessage && (
                <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {socialMessage}
                </div>
              )}

              {filteredCommunityProfiles.length ? (
                <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
                  {filteredCommunityProfiles.map((member) => {
                    const isOwnProfile = idsMatch(member.id, user?.id);
                    const isFollowing = followingIds.some((id) =>
                      idsMatch(id, member.id)
                    );
                    const statusConfig = getPresenceConfig(member.presence_status || "offline");
                    const rawMemberUserLabel = member.ganker_user || member.fortnite_user || t.noFortniteUser;
                    const memberUserLabel = isOwnProfile
                      ? profile.ganker_user || profile.fortnite_user || rawMemberUserLabel
                      : rawMemberUserLabel;

                    return (
                      <div
                        key={member.id}
                        className="flex h-full min-w-0 flex-col justify-between rounded-2xl border border-[#1eff7a]/15 bg-white/[0.03] p-2.5 sm:p-4"
                      >
                        <a
                          href={getPublicProfileHref(member, user?.id)}
                          className="flex flex-col items-center gap-3 rounded-xl text-center transition hover:text-[#63ff9b] sm:flex-row sm:items-start sm:text-left"
                        >
                          <AvatarDisplay
                            src={member.avatar_url || ""}
                            alt={memberUserLabel}
                            status={member.presence_status || "offline"}
                            size="md"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="mx-auto max-w-[120px] truncate text-sm font-black text-white sm:mx-0 sm:max-w-none">
                              {memberUserLabel}
                            </p>
                            <span
                              className={`mt-2 hidden items-center gap-2 rounded-full border border-white/10 px-2 py-1 text-[11px] font-bold sm:inline-flex ${statusConfig.text}`}
                            >
                              <span className={`h-2 w-2 rounded-full ${statusConfig.dot}`} />
                              {getStatusLabel(member.presence_status || "offline", t)}
                            </span>
                          </div>
                        </a>

                        <button
                          type="button"
                          onClick={() => !isOwnProfile && toggleFollow(member.id)}
                          disabled={isOwnProfile}
                          className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${
                            isOwnProfile
                              ? "cursor-default border border-[#1eff7a]/15 bg-[#1eff7a]/10 text-[#63ff9b]"
                              : isFollowing
                                ? "border border-[#1eff7a] bg-[#1eff7a]/15 text-[#63ff9b] hover:bg-[#1eff7a]/22"
                                : "border border-[#1eff7a]/30 bg-transparent text-white hover:border-[#1eff7a] hover:text-[#63ff9b]"
                          }`}
                        >
                          <span className="inline-flex items-center gap-2">
                            <UserCheck
                              size={14}
                              className={isOwnProfile || isFollowing ? "block" : "hidden"}
                            />
                            <UserPlus
                              size={14}
                              className={!isOwnProfile && !isFollowing ? "block" : "hidden"}
                            />
                            <span>
                              {isOwnProfile
                                ? t.ownProfile
                                : isFollowing
                                  ? t.followingAction
                                  : t.followAction}
                            </span>
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-zinc-400">
                  {communitySearch.trim() ? t.communitySearchEmpty : t.communityEmpty}
                </p>
              )}
            </Card>
          </section>
      )}

      {interestModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[32px] border border-cyan-300/25 bg-[#020804] p-6 text-white shadow-[0_0_45px_rgba(34,211,238,.16)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
                  Interés VIP
                </p>
                <h3 className="mt-2 text-2xl font-black italic">
                  {editingInterest ? "Configurar interés" : "Añadir interés"}
                </h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Puedes configurar cualquier interés visible y agregar hasta 5 intereses adicionales como usuario VIP.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setInterestModalOpen(false)}
                className="rounded-2xl border border-[#1eff7a]/30 px-4 py-2 text-sm font-black text-[#63ff9b]"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <label>
                <span className="mb-2 block text-sm font-black">Nombre del interés *</span>
                <input
                  type="text"
                  value={interestForm.title}
                  onChange={(event) =>
                    setInterestForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Ej. Canal de YouTube, mapa creativo, grupo, tienda..."
                  className="w-full rounded-2xl border border-[#1eff7a]/25 bg-[#021509] px-4 py-3 text-white outline-none focus:border-[#1eff7a]"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-black">Enlace *</span>
                <input
                  type="url"
                  value={interestForm.url}
                  onChange={(event) =>
                    setInterestForm((current) => ({ ...current, url: event.target.value }))
                  }
                  placeholder="https://..."
                  className="w-full rounded-2xl border border-[#1eff7a]/25 bg-[#021509] px-4 py-3 text-white outline-none focus:border-[#1eff7a]"
                />
              </label>

              <div>
                <span className="mb-2 block text-sm font-black">Foto o imagen del interés *</span>

                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <input
                    type="url"
                    value={interestForm.image_url}
                    onChange={(event) =>
                      setInterestForm((current) => ({ ...current, image_url: event.target.value }))
                    }
                    placeholder="Pega la URL de una imagen o súbela desde tu PC"
                    className="w-full rounded-2xl border border-[#1eff7a]/25 bg-[#021509] px-4 py-3 text-white outline-none focus:border-[#1eff7a]"
                  />

                  <button
                    type="button"
                    onClick={() => interestFileInputRef.current?.click()}
                    className="rounded-2xl border border-cyan-300/35 bg-cyan-300/10 px-5 py-3 font-black text-cyan-100 hover:border-cyan-200"
                  >
                    Subir desde PC
                  </button>
                </div>

                <input
                  ref={interestFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setInterestImageFile(file);
                    if (file) {
                      setInterestForm((current) => ({ ...current, image_url: "" }));
                    }
                  }}
                />

                {interestImageFile ? (
                  <p className="mt-2 text-xs font-bold text-cyan-100">
                    Imagen seleccionada: {interestImageFile.name}
                  </p>
                ) : null}

                {(interestForm.image_url || interestImageFile) ? (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-[#1eff7a]/15 bg-[#021509]">
                    {interestImageFile ? (
                      <img
                        src={URL.createObjectURL(interestImageFile)}
                        alt="Vista previa"
                        className="h-40 w-full object-cover"
                      />
                    ) : (
                      <img
                        src={interestForm.image_url}
                        alt="Vista previa"
                        className="h-40 w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                  </div>
                ) : null}

                <p className="mt-2 text-xs leading-5 text-zinc-400">
                  No se permiten enlaces o imágenes relacionadas con contenido adulto, violencia, gore, drogas, apuestas o contenido riesgoso.
                </p>
              </div>

              <button
                type="button"
                onClick={saveInterest}
                disabled={interestSaving}
                className="rounded-2xl bg-[#1eff7a] px-5 py-4 font-black text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {interestSaving ? "Guardando..." : "Guardar interés"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedGkgUpdate && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[32px] border border-[#1eff7a]/25 bg-[#020804] p-5 text-white shadow-[0_0_45px_rgba(30,255,122,.18)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#63ff9b]">
                  Actualización Ganker Games
                </p>
                <h3 className="mt-2 text-2xl font-black leading-tight">
                  {selectedGkgUpdate.title || "Actualización"}
                </h3>
                <p className="mt-2 text-xs font-bold text-[#63ff9b]">
                  {formatDateForVip(selectedGkgUpdate.created_at)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedGkgUpdate(null);
                  setEditingGkgUpdateComment(null);
                  setGkgUpdateCommentText("");
                }}
                className="rounded-2xl border border-[#1eff7a]/30 px-4 py-2 text-sm font-black text-[#63ff9b]"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-[#1eff7a]/15 bg-[#021509]/80 p-4 text-sm leading-7 text-zinc-200">
              {selectedGkgUpdate.description || "Nueva mejora disponible dentro de la página."}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={toggleGkgUpdateLike}
                disabled={gkgUpdateActionLoading}
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black transition ${
                  selectedGkgUpdate.is_liked
                    ? "border-red-300/50 bg-red-400/15 text-red-200"
                    : "border-[#1eff7a]/30 bg-[#1eff7a]/10 text-[#63ff9b]"
                } disabled:opacity-60`}
              >
                <Heart size={18} />
                {selectedGkgUpdate.is_liked ? "Te gusta" : "Me gusta"}
                <span>{Number(selectedGkgUpdate.likes_count || 0)}</span>
              </button>

              <span className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 text-sm font-black text-cyan-100">
                <MessageCircle size={18} />
                Comentarios {Number(selectedGkgUpdate.comments_count || gkgUpdateComments.length || 0)}
              </span>
            </div>

            <div className="mt-5 rounded-2xl border border-[#1eff7a]/15 bg-[#021509]/60 p-4">
              <h4 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-[#63ff9b]">
                Comentario breve
              </h4>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  type="text"
                  value={gkgUpdateCommentText}
                  maxLength={140}
                  onChange={(event) => setGkgUpdateCommentText(event.target.value)}
                  placeholder="Escribe un comentario breve..."
                  className="w-full rounded-2xl border border-[#1eff7a]/25 bg-[#020804] px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-[#1eff7a]"
                />

                <button
                  type="button"
                  onClick={sendGkgUpdateComment}
                  disabled={gkgUpdateActionLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1eff7a] px-5 py-3 font-black text-black disabled:opacity-60"
                >
                  <Send size={18} />
                  {editingGkgUpdateComment ? "Guardar" : "Enviar"}
                </button>
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-zinc-500">Máximo 140 caracteres.</p>

                {editingGkgUpdateComment && (
                  <button
                    type="button"
                    onClick={cancelEditGkgUpdateComment}
                    className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-xs font-black text-red-200"
                  >
                    Cancelar edición
                  </button>
                )}
              </div>

              {gkgUpdateActionMessage && (
                <div className="mt-3 rounded-2xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-100">
                  {gkgUpdateActionMessage}
                </div>
              )}
            </div>

            <div className="mt-5 space-y-3">
              {gkgUpdateComments.length ? (
                gkgUpdateComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-2xl border border-[#1eff7a]/15 bg-[#021509]/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-black text-white">
                            {comment.ganker_user || comment.display_name || "Usuario GKG"}
                          </p>

                          {comment.updated_at && comment.updated_at !== comment.created_at && (
                            <span className="rounded-full bg-cyan-300/10 px-2 py-0.5 text-[10px] font-black text-cyan-100">
                              Editado
                            </span>
                          )}
                        </div>
                        <p className="mt-1 break-words text-sm leading-6 text-zinc-300">{comment.comment_text}</p>

                        {comment.profile_id === user?.id && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => startEditGkgUpdateComment(comment)}
                              className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-100"
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteGkgUpdateComment(comment)}
                              className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-xs font-black text-red-200"
                            >
                              Borrar
                            </button>
                          </div>
                        )}
                      </div>

                      <span className="shrink-0 text-right text-[11px] font-bold text-zinc-500">
                        {formatDateForVip(comment.created_at)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-[#1eff7a]/15 bg-[#021509]/70 p-4 text-sm text-zinc-400">
                  Aún no hay comentarios. Sé el primero en comentar.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "VIP" && (
        <VIPTab
          profile={profile}
          user={user}
          supabase={supabase}
          onGoToPremios={() => setActiveTab("Premios")}
        />
      )}

      {activeTab === "Premios" && (
        <VIPPrizesTab profile={profile} user={user} supabase={supabase} />
      )}

      {activeTab === "Sorteos" && (
        <GiveawaysTab
          t={t}
          lang={lang}
          supabase={supabase}
          user={user}
          profile={profile}
        />
      )}

      {activeTab === "Creador" && canManageGiveaways && (
        <CreatorPanel
          lang={lang}
          supabase={supabase}
          accountRole={accountRole}
        />
      )}

      {activeTab === "Configuración" && (
        <section className="mx-auto grid max-w-6xl gap-5 px-4 py-8 lg:grid-cols-[290px_1fr]">
          <aside>
            <Card>
              <h2 className="mb-5 text-xl font-black">{t.settingsTitle}</h2>

              <div className="space-y-3">
                {configMenu.map((item) => {
                  const Icon = item.icon;
                  const active = configSection === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setConfigSection(item.key)}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left text-sm font-black transition ${
                        active
                          ? "border-[#1eff7a]/50 bg-[#1eff7a]/10 text-[#63ff9b]"
                          : "border-[#1eff7a]/15 bg-[#021509] text-zinc-300 hover:border-[#1eff7a]/35 hover:text-white"
                      }`}
                    >
                      <Icon size={20} />
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </Card>
          </aside>

          <section>
            {configSection === "perfil" && (
              <Card>
                <h2 className="mb-2 text-2xl font-black">
                  {t.settingsProfileTitle}
                </h2>

                <p className="mb-6 text-sm text-zinc-400">
                  {t.settingsProfileDesc}
                </p>

                <div className="mb-6 flex flex-col items-center gap-4 rounded-2xl border border-[#1eff7a]/15 bg-[#021509]/70 p-5 sm:flex-row sm:items-center">
                  <AvatarDisplay
                    src={avatarSrc}
                    alt="Avatar GKG"
                    status={currentPresence}
                    size="md"
                    uploading={avatarUploading}
                  />

                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm font-black text-white">
                      {lang === "es" ? "Foto de perfil" : "Profile photo"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {lang === "es"
                        ? "La foto solo se puede cambiar desde esta sección."
                        : "Your photo can only be changed from this section."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => user && fileInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="rounded-2xl border border-[#1eff7a]/35 bg-[#1eff7a]/10 px-4 py-3 text-sm font-black text-[#63ff9b] transition hover:border-[#1eff7a] hover:bg-[#1eff7a]/20 hover:text-white disabled:opacity-60"
                  >
                    {avatarUploading ? t.uploadingAvatar : t.uploadAvatar}
                  </button>
                </div>

                <form onSubmit={requestSaveProfile} className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label={t.firstName}
                      required
                      placeholder={t.firstNamePlaceholder}
                      value={activeDraftProfile.first_name}
                      onChange={(value) =>
                        setDraftProfile({ ...activeDraftProfile, first_name: value })
                      }
                    />

                    <Input
                      label={t.middleName}
                      placeholder={t.middleNamePlaceholder}
                      value={activeDraftProfile.middle_name}
                      onChange={(value) =>
                        setDraftProfile({ ...activeDraftProfile, middle_name: value })
                      }
                    />

                    <Input
                      label={t.lastName}
                      required
                      placeholder={t.lastNamePlaceholder}
                      value={activeDraftProfile.last_name}
                      onChange={(value) =>
                        setDraftProfile({ ...activeDraftProfile, last_name: value })
                      }
                    />

                    <Input
                      label={t.email}
                      type="email"
                      placeholder={t.emailPlaceholder}
                      value={draftProfileEmail}
                      onChange={setDraftProfileEmail}
                    />

                    <Input
                      label={t.fortniteName}
                      required
                      placeholder={t.fortniteNamePlaceholder}
                      value={activeDraftProfile.fortnite_user}
                      onChange={(value) =>
                        setDraftProfile({
                          ...activeDraftProfile,
                          fortnite_user: value,
                          ganker_user: value,
                        })
                      }
                    />

                    <SelectInput
                      label={t.country}
                      value={activeDraftProfile.country}
                      onChange={(value) =>
                        setDraftProfile({ ...activeDraftProfile, country: value })
                      }
                      options={countries}
                      placeholder={t.selectCountry}
                    />

                    <Input
                      label={t.phone}
                      placeholder={t.phonePlaceholder}
                      value={activeDraftProfile.phone}
                      onChange={(value) =>
                        setDraftProfile({ ...activeDraftProfile, phone: value })
                      }
                    />

                    <Input
                      label={t.birthday}
                      type="date"
                      placeholder={t.birthdayPlaceholder}
                      value={activeDraftProfile.birthday}
                      onChange={(value) =>
                        setDraftProfile({ ...activeDraftProfile, birthday: value })
                      }
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <Notice icon={ShieldCheck}>
                      {t.fortniteNotice}
                      {fortniteDaysLeft > 0 &&
                        ` ${t.canChangeIn} ${fortniteDaysLeft} ${t.days}.`}
                    </Notice>

                    <Notice icon={Mail}>
                      {t.emailNotice}
                      {emailDaysLeft > 0 &&
                        ` ${t.canChangeIn} ${emailDaysLeft} ${t.days}.`}
                    </Notice>
                  </div>

                  {profileMessage && (
                    <div className="rounded-2xl border border-[#1eff7a]/25 bg-[#021509] p-3 text-sm text-zinc-200">
                      {profileMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-2xl bg-[#1eff7a] px-4 py-4 font-black text-black shadow-[0_0_24px_rgba(30,255,122,0.22)] disabled:opacity-60"
                  >
                    {saving ? t.saving : t.saveProfile}
                  </button>
                </form>
              </Card>
            )}

            {configSection === "tags" && (
              <Card>
                <h2 className="mb-2 text-2xl font-black">{t.tagsTitle}</h2>
                <p className="mb-2 text-sm text-zinc-400">{t.tagsDesc}</p>
                <p className="mb-6 text-xs font-bold text-[#63ff9b]">
                  {t.tagsLimitNormal} Actualmente: {profileTags.length}/{maxProfileTags}
                </p>

                <div className="space-y-5">
                  <div className="rounded-2xl border border-[#1eff7a]/15 bg-[#021509]/70 p-4">
                    <h3 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-[#63ff9b]">
                      Tus etiquetas
                    </h3>

                    <ProfileTagPills tags={profileTags} />

                    <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                      <input
                        type="text"
                        value={tagInput}
                        maxLength={24}
                        onChange={(event) => setTagInput(event.target.value)}
                        placeholder={t.tagPlaceholder}
                        className="w-full rounded-2xl border border-[#1eff7a]/25 bg-[#020804] px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-[#1eff7a]"
                      />

                      <button
                        type="button"
                        onClick={() => addProfileTag()}
                        disabled={tagSaving || profileTags.length >= maxProfileTags}
                        className="rounded-2xl bg-[#1eff7a] px-6 py-3 font-black text-black disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Agregar
                      </button>
                    </div>

                    {profileTags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {profileTags.map((tag) => (
                          <button
                            type="button"
                            key={tag.id}
                            onClick={() => deleteProfileTag(tag.id)}
                            className="inline-flex items-center gap-2 rounded-full border border-red-500/35 bg-red-500/10 px-3 py-2 text-xs font-black text-red-200"
                          >
                            #{tag.tag_text}
                            <X size={12} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-4">
                    <h3 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-cyan-100">
                      Recomendadas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {suggestedTags.map((tag) => {
                        const disabled = profileTags.some((item) => item.tag_text.toLowerCase() === tag.toLowerCase()) || profileTags.length >= maxProfileTags;

                        return (
                          <button
                            type="button"
                            key={tag}
                            onClick={() => addProfileTag(tag)}
                            disabled={disabled || tagSaving}
                            className="rounded-full border border-[#1eff7a]/25 bg-[#021509] px-3 py-2 text-xs font-black text-[#63ff9b] transition hover:border-[#63ff9b] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            #{tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {tagMessage && (
                    <div className="rounded-2xl border border-[#1eff7a]/25 bg-[#021509] p-3 text-sm text-zinc-200">
                      {tagMessage}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {configSection === "password" && (
              <Card>
                <h2 className="mb-2 text-2xl font-black">{t.passwordTitle}</h2>

                <p className="mb-6 text-sm text-zinc-400">
                  {t.passwordDesc}
                </p>

                <form onSubmit={savePassword} className="space-y-5">
                  <Input
                    label={t.oldPassword}
                    required
                    type="password"
                    placeholder={t.oldPasswordPlaceholder}
                    value={passwordForm.current_password}
                    onChange={(value) =>
                      setPasswordForm({
                        ...passwordForm,
                        current_password: value,
                      })
                    }
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label={t.newPassword}
                      required
                      type="password"
                      placeholder={t.newPasswordPlaceholder}
                      value={passwordForm.new_password}
                      onChange={(value) =>
                        setPasswordForm({
                          ...passwordForm,
                          new_password: value,
                        })
                      }
                    />

                    <Input
                      label={t.repeatPassword}
                      required
                      type="password"
                      placeholder={t.repeatPasswordPlaceholder}
                      value={passwordForm.confirm_password}
                      onChange={(value) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirm_password: value,
                        })
                      }
                    />
                  </div>

                  {passwordMessage && (
                    <div className="rounded-2xl border border-[#1eff7a]/25 bg-[#021509] p-3 text-sm text-zinc-200">
                      {passwordMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-2xl bg-[#1eff7a] px-4 py-4 font-black text-black shadow-[0_0_24px_rgba(30,255,122,0.22)] disabled:opacity-60"
                  >
                    {saving ? t.saving : t.savePassword}
                  </button>
                </form>
              </Card>
            )}

            {configSection === "reset" && (
              <Card>
                <h2 className="mb-2 text-2xl font-black">
                  {t.resetTitle}
                </h2>

                <p className="mb-6 text-sm text-zinc-400">
                  {t.resetDesc}
                </p>

                <form onSubmit={sendResetPassword} className="space-y-5">
                  <Input
                    label={t.email}
                    required
                    type="email"
                    placeholder={t.resetEmailPlaceholder}
                    value={resetEmail}
                    onChange={setResetEmail}
                  />

                  {resetMessage && (
                    <div className="rounded-2xl border border-[#1eff7a]/25 bg-[#021509] p-3 text-sm text-zinc-200">
                      {resetMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-2xl bg-[#1eff7a] px-4 py-4 font-black text-black shadow-[0_0_24px_rgba(30,255,122,0.22)] disabled:opacity-60"
                  >
                    {saving ? t.sending : t.sendReset}
                  </button>
                </form>
              </Card>
            )}

            {configSection === "privacy" && (
              <Card>
                <h2 className="mb-2 text-2xl font-black">{t.privacyTitle}</h2>
                <p className="mb-6 text-sm text-zinc-400">{t.privacyDesc}</p>

                <form onSubmit={savePrivacySettings} className="space-y-4">
                  <ToggleOption
                    label={t.showCountry}
                    checked={privacyForm.show_country}
                    onChange={(checked) =>
                      setPrivacyForm({ ...privacyForm, show_country: checked })
                    }
                  />

                  <ToggleOption
                    label={t.showBirthday}
                    checked={privacyForm.show_birthday}
                    onChange={(checked) =>
                      setPrivacyForm({ ...privacyForm, show_birthday: checked })
                    }
                  />

                  <ToggleOption
                    label={t.allowProfileSearch}
                    checked={privacyForm.allow_profile_search}
                    onChange={(checked) =>
                      setPrivacyForm({ ...privacyForm, allow_profile_search: checked })
                    }
                  />

                  {settingsMessage && (
                    <div className="rounded-2xl border border-[#1eff7a]/25 bg-[#021509] p-3 text-sm text-zinc-200">
                      {settingsMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={settingsSaving}
                    className="w-full rounded-2xl bg-[#1eff7a] px-4 py-4 font-black text-black shadow-[0_0_24px_rgba(30,255,122,0.22)] disabled:opacity-60"
                  >
                    {settingsSaving ? t.saving : t.saveProfile}
                  </button>
                </form>
              </Card>
            )}

            {configSection === "notifications" && (
              <Card>
                <h2 className="mb-2 text-2xl font-black">{t.notificationsTitle}</h2>
                <p className="mb-6 text-sm text-zinc-400">{t.notificationsDesc}</p>

                <form onSubmit={saveNotificationSettings} className="space-y-4">
                  <ToggleOption
                    label={t.notifyEmail}
                    checked={notificationForm.notify_email}
                    onChange={(checked) =>
                      setNotificationForm({ ...notificationForm, notify_email: checked })
                    }
                  />

                  <ToggleOption
                    label={t.notifyWhatsapp}
                    checked={notificationForm.notify_whatsapp}
                    onChange={(checked) =>
                      setNotificationForm({ ...notificationForm, notify_whatsapp: checked })
                    }
                  />

                  {!profile.phone && notificationForm.notify_whatsapp && (
                    <Notice icon={MessageCircle}>
                      {lang === "es"
                        ? "Agrega un número en Configuración de perfil para usar notificaciones por WhatsApp."
                        : "Add a phone number in Profile settings to use WhatsApp notifications."}
                    </Notice>
                  )}

                  {settingsMessage && (
                    <div className="rounded-2xl border border-[#1eff7a]/25 bg-[#021509] p-3 text-sm text-zinc-200">
                      {settingsMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={settingsSaving}
                    className="w-full rounded-2xl bg-[#1eff7a] px-4 py-4 font-black text-black shadow-[0_0_24px_rgba(30,255,122,0.22)] disabled:opacity-60"
                  >
                    {settingsSaving ? t.saving : t.saveProfile}
                  </button>
                </form>
              </Card>
            )}

            {configSection === "blocked" && (
              <Card>
                <h2 className="mb-2 text-2xl font-black">{t.blockedTitle}</h2>
                <p className="mb-6 text-sm text-zinc-400">{t.blockedDesc}</p>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-[#1eff7a]/15 bg-[#021509]/70 p-4">
                    <h3 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-[#63ff9b]">
                      {t.blockedUsers}
                    </h3>

                    {blockedProfiles.length ? (
                      <div className="space-y-3">
                        {blockedProfiles.map((member) => (
                          <UserBlockRow
                            key={member.id}
                            member={member}
                            actionLabel={t.blockedLabel || "Bloqueado"}
                            hoverLabel={t.unblockUser}
                            isBlocked
                            onAction={() => unblockUser(member)}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400">{t.noBlockedUsers}</p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-[#1eff7a]/15 bg-[#021509]/70 p-4">
                    <h3 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-[#63ff9b]">
                      {lang === "es" ? "Comunidad" : "Community"}
                    </h3>

                    <div className="space-y-3">
                      {communityProfiles
                        .filter((member) => !idsMatch(member.id, user?.id))
                        .filter((member) => !isProtectedRole(member))
                        .filter((member) => !member.deleted_at && member.allow_profile_search !== false)
                        .slice(0, 10)
                        .map((member) => {
                          const isBlocked = blockedProfiles.some((blocked) =>
                            idsMatch(blocked.id, member.id)
                          );

                          return (
                            <UserBlockRow
                              key={member.id}
                              member={member}
                              actionLabel={isBlocked ? (t.blockedLabel || "Bloqueado") : t.blockUser}
                              hoverLabel={isBlocked ? t.unblockUser : undefined}
                              danger={!isBlocked}
                              isBlocked={isBlocked}
                              onAction={() =>
                                isBlocked ? unblockUser(member) : blockUser(member)
                              }
                            />
                          );
                        })}
                    </div>
                  </div>

                  {settingsMessage && (
                    <div className="rounded-2xl border border-[#1eff7a]/25 bg-[#021509] p-3 text-sm text-zinc-200">
                      {settingsMessage}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {configSection === "history" && (
              <Card>
                <h2 className="mb-2 text-2xl font-black">{t.historyTitle}</h2>
                <p className="mb-6 text-sm text-zinc-400">{t.historyDesc}</p>

                {profileHistory.length ? (
                  <div className="space-y-3">
                    {profileHistory.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-[#1eff7a]/15 bg-[#021509]/70 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1eff7a]/10 text-[#1eff7a]">
                            <History size={20} />
                          </div>
                          <div>
                            <p className="font-black text-zinc-100">{item.description}</p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {item.created_at
                                ? new Date(item.created_at).toLocaleString("es-MX")
                                : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-[#1eff7a]/15 bg-[#021509]/70 p-4 text-sm text-zinc-400">
                    {t.noHistory}
                  </p>
                )}
              </Card>
            )}

            {configSection === "security" && (
              <Card>
                <h2 className="mb-2 text-2xl font-black">{t.securityTitle}</h2>
                <p className="mb-6 text-sm text-zinc-400">{t.securityDesc}</p>

                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <LogOut className="mt-1 shrink-0 text-red-300" size={22} />
                    <div>
                      <p className="font-black text-red-200">{t.logoutAllDevices}</p>
                      <p className="mt-1 text-sm leading-6 text-red-100/80">
                        {t.logoutAllDevicesDesc}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={logoutAllDevices}
                    disabled={settingsSaving}
                    className="mt-4 w-full rounded-2xl border border-red-500/40 bg-red-500/15 px-4 py-4 font-black text-red-200 transition hover:bg-red-500/25 disabled:opacity-60"
                  >
                    {settingsSaving ? t.saving : t.logoutAllDevices}
                  </button>
                </div>

                {settingsMessage && (
                  <div className="mt-5 rounded-2xl border border-[#1eff7a]/25 bg-[#021509] p-3 text-sm text-zinc-200">
                    {settingsMessage}
                  </div>
                )}
              </Card>
            )}

            {configSection === "delete" && (
              <Card>
                <h2 className="mb-2 flex items-center gap-2 text-2xl font-black text-red-300">
                  <AlertTriangle size={26} />
                  {isProfileDeleted ? t.restoreProfileTitle : t.deleteProfileTitle}
                </h2>

                <p className="mb-4 text-sm leading-6 text-zinc-400">
                  {isProfileDeleted ? t.restoreProfileDesc : t.deleteProfileDesc}
                </p>

                {!isProfileDeleted && (
                  <div className="mb-5 rounded-2xl border border-red-500/35 bg-red-500/10 p-4 text-sm leading-6 text-red-200">
                    {t.deleteProfileWarning}
                  </div>
                )}

                {isProfileDeleted ? (
                  <button
                    type="button"
                    onClick={restoreProfile}
                    disabled={restoringProfile}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#1eff7a]/35 bg-[#1eff7a] px-4 py-4 font-black text-black shadow-[0_0_24px_rgba(30,255,122,0.22)] disabled:opacity-60"
                  >
                    <RotateCcw size={20} />
                    {restoringProfile ? t.restoring : t.restoreProfileButton}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <Input
                      label={t.deleteProfileConfirmLabel}
                      placeholder={t.deleteProfileConfirmPlaceholder}
                      value={deleteConfirmText}
                      onChange={setDeleteConfirmText}
                    />

                    <button
                      type="button"
                      onClick={deleteProfile}
                      disabled={deletingProfile}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/50 bg-red-500/15 px-4 py-4 font-black text-red-300 shadow-[0_0_24px_rgba(239,68,68,0.12)] transition hover:bg-red-500/25 disabled:opacity-60"
                    >
                      <Trash2 size={20} />
                      {deletingProfile ? t.deleting : t.deleteProfileButton}
                    </button>
                  </div>
                )}

                {deleteMessage && (
                  <div className="mt-5 rounded-2xl border border-[#1eff7a]/25 bg-[#021509] p-3 text-sm text-zinc-200">
                    {deleteMessage}
                  </div>
                )}
              </Card>
            )}

          </section>
        </section>
      )}

      {showSaveConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border border-[#1eff7a]/30 bg-[#020804] p-6 shadow-[0_0_40px_rgba(30,255,122,0.16)]">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-yellow-400/40 bg-yellow-400/10 text-yellow-300">
                <AlertTriangle size={26} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-white">{t.saveConfirmTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-300">{t.saveConfirmDesc}</p>
                <p className="mt-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm leading-6 text-red-200">
                  {t.saveConfirmWarning}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setShowSaveConfirm(false)}
                className="rounded-2xl border border-[#1eff7a]/25 bg-[#021509] px-4 py-3 font-black text-[#63ff9b] transition hover:border-[#1eff7a] hover:text-white"
              >
                {t.cancelSave}
              </button>

              <button
                type="button"
                onClick={confirmSaveProfile}
                disabled={saving}
                className="rounded-2xl bg-[#1eff7a] px-4 py-3 font-black text-black shadow-[0_0_24px_rgba(30,255,122,0.22)] disabled:opacity-60"
              >
                {saving ? t.saving : t.confirmSave}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


const GIVEAWAY_COPY = {
  es: {
    introTitle: "Sorteos GKG",
    introDesc:
      "El sorteo es EXCLUSIVO para clientes de Ganker Games. Aquí puedes ver el podio del mes, los requisitos, el formulario privado de registro y la tabla de participantes.",
    monthLabel: "Mes vigente",
    monthResults: "Abril",
    winnerTitle: "Podio del mes",
    registerTitle: "Registro privado de participación",
    registerLocked:
      "Este formulario está oculto y solo aparece si entras con un enlace personalizado.",
    registerWithLink:
      "Ejemplo de enlace personalizado: /perfil?tab=Sorteos&invite=ABRIL-GKG-0001",
    registerVisible:
      "Este enlace es válido. Ya puedes registrar tu participación del día.",
    fortniteName: "Usuario de Ganker Games",
    contactInfo: "Si ganas, ¿cómo puedo contactarte?",
    rating: "Calificación del servicio",
    comment: "Comentario",
    sendEntry: "Registrar participación",
    sending: "Registrando...",
    participantsTitle: "Participantes del mes",
    participantsDesc:
      "Tabla del mes vigente con el número de registros y participaciones efectivas. Si el usuario es VIP, cuenta doble.",
    tableName: "Jugador",
    tableType: "Tipo",
    tableLogs: "Registros del mes",
    tableEntries: "Participaciones",
    vip: "VIP",
    normal: "Normal",
    noParticipants: "Todavía no hay participaciones registradas este mes.",
    resultsTitle: "Resultados y páginas oficiales",
    rouletteTitle: "Ejemplo de ruleta del sorteo",
    rouletteDesc:
      "La ruleta es una representación visual. Sorteo 1: todos los participantes. Sorteo 2: usuarios con 2 o más participaciones ponderadas. Sorteo 3: únicamente VIP.",
    everyone: "Sorteo 1 · Todos",
    frequent: "Sorteo 2 · Frecuentes",
    vipOnly: "Sorteo 3 · Solo VIP",
    rulesTitle: "Reglas del sorteo",
    additionalTitle: "Datos adicionales",
    requirements: "Requisitos",
    prizes: "Premios",
    hiddenFormNote:
      "Para participar necesitas abrir el enlace personalizado que tú les enviarás.",
    success:
      "Participación registrada correctamente. Si eres VIP, tu registro cuenta doble.",
    loginNameInfo:
      "Si el usuario ya inició sesión, el usuario de Ganker Games se toma automáticamente desde su perfil.",
    podiumMonth: "Abril",
    resultsPages: "Los resultados de los sorteos se podrán consultar en estas páginas:",
    place1: "GKG del Mes",
    place2: "GKG Frecuente del Mes",
    place3: "GKG VIP del Mes",
    card1Req:
      "Tendrás una participación diaria si realizas compra diaria; se borran si hay compras duplicadas en un día.",
    card1Prize: "1 Bundle/Lote (hasta 2400 paVos) y 1 mes de GKG VIP.",
    card2Req:
      "Necesitas 2 o más participaciones ponderadas durante el mes. Un registro VIP cuenta como 2 participaciones.",
    card2Prize: "1 Skin (hasta 1800 paVos) y 15 días de GKG VIP.",
    card3Req:
      "Debes tener membresía GKG VIP activa durante el mes. Cada registro VIP cuenta doble.",
    card3Prize: "2,400 paVos a su cuenta o vía regalo.",
    extra1:
      "Los registros terminarán dentro de los primeros 10 días del mes siguiente.",
    extra2:
      "El sorteo se hará dentro de los primeros 10 días del mes siguiente.",
    extra3:
      "Para participar debiste realizar una compra entre el día 1 del mes y el cierre del evento.",
    extra4:
      "VIP cuenta doble participación y solo se permite 1 registro por día por persona.",
    missingFields:
      "Completa usuario de Ganker Games, calificación y comentario.",
  },
  en: {
    introTitle: "GKG Giveaways",
    introDesc:
      "This giveaway is EXCLUSIVE for Ganker Games customers. Here you can see the monthly podium, requirements, the private form, and participants.",
    monthLabel: "Current month",
    monthResults: "April",
    winnerTitle: "Monthly podium",
    registerTitle: "Private participation form",
    registerLocked:
      "This form is hidden and only appears when the user opens a personalized link.",
    registerWithLink:
      "Example personalized link: /perfil?tab=Sorteos&invite=ABRIL-GKG-0001",
    registerVisible:
      "This invite link is valid. You can now register today's participation.",
    fortniteName: "Ganker Games username",
    contactInfo: "If you win, how can I contact you?",
    rating: "Service rating",
    comment: "Comment",
    sendEntry: "Register entry",
    sending: "Registering...",
    participantsTitle: "Monthly participants",
    participantsDesc:
      "Current month table with registration count and effective entries. VIP users count double.",
    tableName: "Player",
    tableType: "Type",
    tableLogs: "Monthly records",
    tableEntries: "Entries",
    vip: "VIP",
    normal: "Regular",
    noParticipants: "There are no registered entries this month yet.",
    resultsTitle: "Results and official pages",
    rouletteTitle: "Giveaway roulette example",
    rouletteDesc:
      "The roulette is a visual example. Giveaway 1: everyone. Giveaway 2: users with 2+ weighted entries. Giveaway 3: VIP only.",
    everyone: "Giveaway 1 · Everyone",
    frequent: "Giveaway 2 · Frequent",
    vipOnly: "Giveaway 3 · VIP only",
    rulesTitle: "Giveaway rules",
    additionalTitle: "Additional details",
    requirements: "Requirements",
    prizes: "Prizes",
    hiddenFormNote:
      "To participate, the user must open the personalized link you send.",
    success:
      "Entry registered correctly. If the player is VIP, the entry counts double.",
    loginNameInfo:
      "If the user is already logged in, the Ganker Games username is pulled automatically from the profile.",
    podiumMonth: "April",
    resultsPages: "Giveaway results can be checked on these pages:",
    place1: "GKG of the Month",
    place2: "Frequent GKG of the Month",
    place3: "VIP GKG of the Month",
    card1Req:
      "You get one daily entry if you make a daily purchase; duplicated same-day purchases are removed.",
    card1Prize: "1 Bundle/Pack up to 2400 V-Bucks and 1 month of GKG VIP.",
    card2Req:
      "You need 2 or more weighted entries during the month. One VIP record counts as 2 entries.",
    card2Prize: "1 Skin up to 1800 V-Bucks and 15 days of GKG VIP.",
    card3Req:
      "You need an active GKG VIP membership during the month. Each VIP record counts double.",
    card3Prize: "2,400 V-Bucks to the account or via gift.",
    extra1:
      "Registrations close within the first 10 days of the following month.",
    extra2:
      "The giveaway draw will happen within the first 10 days of the following month.",
    extra3:
      "To participate, a purchase must have been made between day 1 of the month and the event close date.",
    extra4:
      "VIP counts as double entry and only 1 registration per day per person is allowed.",
    missingFields:
      "Complete Ganker Games username, rating, and comment.",
  },
};


function normalizeGiveawayName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function mergeGiveawayParticipants(baseRows = [], manualRows = []) {
  const map = new Map();

  [...baseRows, ...manualRows].forEach((row) => {
    const name = row.fortnite_name || row.ganker_user || row.name || "";
    const key = normalizeGiveawayName(name);

    if (!key) return;

    const current =
      map.get(key) || {
        fortnite_name: name,
        is_vip: false,
        registros: 0,
        participaciones: 0,
      };

    current.fortnite_name = current.fortnite_name || name;
    current.is_vip = Boolean(current.is_vip || row.is_vip);
    current.registros += Number(row.registros || row.records_count || 1);
    current.participaciones += Number(row.participaciones || row.entries_count || (row.is_vip ? 2 : 1));
    current.avatar_url = current.avatar_url || row.avatar_url || row.profile_avatar || "";

    map.set(key, current);
  });

  return Array.from(map.values()).sort((a, b) => {
    if (Number(b.participaciones) !== Number(a.participaciones)) {
      return Number(b.participaciones) - Number(a.participaciones);
    }

    return String(a.fortnite_name || "").localeCompare(String(b.fortnite_name || ""));
  });
}

function getPreviousMonthInfo(lang = "es") {
  const now = new Date();
  const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const month = new Intl.DateTimeFormat(lang === "es" ? "es-MX" : "en-US", {
    month: "long",
  }).format(previous);

  return {
    label: month.charAt(0).toUpperCase() + month.slice(1),
    year: previous.getFullYear(),
    monthKey: `${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, "0")}`,
  };
}


function GiveawayStarRating({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {[1, 2, 3, 4, 5].map((starValue) => (
        <button
          key={starValue}
          type="button"
          onClick={() => onChange(starValue)}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-black transition ${
            starValue <= value
              ? "border-[#1eff7a]/45 bg-[#1eff7a]/12 text-[#63ff9b]"
              : "border-[#1eff7a]/20 bg-[#04140b] text-zinc-500 hover:border-[#1eff7a]/50"
          }`}
        >
          <Star
            size={16}
            className={
              starValue <= value
                ? "fill-[#1eff7a] text-[#1eff7a]"
                : "text-zinc-500"
            }
          />
          {starValue}
        </button>
      ))}
    </div>
  );
}

function GiveawayInfoModal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[32px] border border-[#1eff7a]/25 bg-[#020804] p-6 text-white shadow-[0_0_45px_rgba(30,255,122,.18)]">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-2xl font-black italic">{title}</h3>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[#1eff7a]/30 px-4 py-2 text-sm font-black text-[#63ff9b] hover:border-[#63ff9b]"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-5 space-y-3 text-sm leading-6 text-zinc-300">
          {children}
        </div>
      </div>
    </div>
  );
}

function GiveawaysTab({ t, lang, supabase, user, profile }) {
  const g = GIVEAWAY_COPY[lang] || GIVEAWAY_COPY.es;
  const router = useRouter();

  const [inviteToken, setInviteToken] = useState("");
  const [inviteStatus, setInviteStatus] = useState("none");
  const [formMessage, setFormMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [previousMonthPayload, setPreviousMonthPayload] = useState(null);
  const [previousWinners, setPreviousWinners] = useState([]);
  const [previousParticipants, setPreviousParticipants] = useState([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [extraModalOpen, setExtraModalOpen] = useState(false);
  const [groupsModalOpen, setGroupsModalOpen] = useState(false);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [form, setForm] = useState({
    fortnite_name: profile?.ganker_user || profile?.fortnite_user || "",
    service_rating: 0,
    comment: "",
  });

  const fallbackPreviousMonth = useMemo(() => getPreviousMonthInfo(lang), [lang]);

  const monthLabel = useMemo(() => {
    if (campaign?.month_label) return campaign.month_label;

    try {
      const value = new Intl.DateTimeFormat(lang === "es" ? "es-MX" : "en-US", {
        month: "long",
      }).format(new Date());

      return value.charAt(0).toUpperCase() + value.slice(1);
    } catch (error) {
      return g.monthResults;
    }
  }, [campaign?.month_label, g.monthResults, lang]);

  const previousMonth = useMemo(() => {
    const monthKey = previousMonthPayload?.month_key || fallbackPreviousMonth.monthKey;

    return {
      monthKey,
      label: previousMonthPayload?.month_label || fallbackPreviousMonth.label,
      year: Number(String(monthKey).slice(0, 4)) || fallbackPreviousMonth.year,
    };
  }, [fallbackPreviousMonth, previousMonthPayload]);

  const displayParticipants = participants;
  const historicalParticipantMonths = previousParticipants.length
    ? [
        {
          key: previousMonth.monthKey,
          label: `${previousMonth.label} ${previousMonth.year}`,
          rows: previousParticipants,
        },
      ]
    : [];

  const rules = [
    {
      title: `Usuario de ${previousMonth.label} ${previousMonth.year}`,
      icon: Trophy,
      requirement: g.card1Req,
      prize: "1 Bundle/Lote (hasta 2,400 paVos) y 1 mes de GKG VIP (beneficios limitados).",
    },
    {
      title: `Usuario frecuente de ${previousMonth.label} ${previousMonth.year}`,
      icon: Gift,
      requirement: g.card2Req,
      prize: "1 Skin (hasta 1,800 paVos) y 15 días de GKG VIP (beneficios limitados).",
    },
    {
      title: `Usuario VIP de ${previousMonth.label} ${previousMonth.year}`,
      icon: Crown,
      requirement: g.card3Req,
      prize: "$2,400 paVos a su cuenta o vía regalo.",
    },
  ];

  const additionalData = [
    g.extra1,
    g.extra2,
    g.extra3,
    g.extra4,
    "El registro privado solo se desbloquea con enlace personalizado.",
    "Cada enlace personalizado solo puede usarse una vez.",
    "El sorteo automático puede ejecutarse el día 1 del mes siguiente o manualmente desde Creador.",
    "Deja tu referencia en nuestros grupos de Ganker Games para validar actividad de comunidad.",
  ];

  useEffect(() => {
    if (profile?.ganker_user || profile?.fortnite_user) {
      setForm((prev) => ({
        ...prev,
        fortnite_name: profile?.ganker_user || profile?.fortnite_user || "",
      }));
    }
  }, [profile?.ganker_user, profile?.fortnite_user]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const invite = params.get("invite") || "";
    setInviteToken(invite);
    setInviteStatus(invite ? "checking" : "none");
  }, []);

  useEffect(() => {
    async function validateInvite() {
      if (!inviteToken) return;

      try {
        const { data, error } = await supabase.rpc("get_giveaway_invite_status", {
          token_input: inviteToken,
        });

        if (error) throw error;

        const inviteState = Array.isArray(data) ? data[0] : data;

        if (inviteState?.is_used) {
          setInviteStatus("used");
          return;
        }

        if (!inviteState?.is_valid) {
          setInviteStatus("invalid");
          return;
        }

        setInviteStatus("valid");
      } catch (error) {
        setInviteStatus("invalid");
      }
    }

    validateInvite();
  }, [inviteToken, supabase]);

  useEffect(() => {
    if (inviteToken && inviteStatus === "valid") {
      setRegistrationModalOpen(true);
    }
  }, [inviteStatus, inviteToken]);

  async function loadParticipants() {
    setLoadingRows(true);

    try {
      const response = await fetch("/api/giveaways/public", {
        method: "GET",
        cache: "no-store",
      });

      const result = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(result.error || "No se pudieron cargar los participantes.");
      }

      setCampaign(result.current_month || result.campaign || null);
      setParticipants(result.current_participants || result.participants || []);
      setPreviousMonthPayload(result.previous_month || null);
      setPreviousWinners(result.previous_month_winners || []);
      setPreviousParticipants(result.previous_month_participants || []);
    } catch (error) {
      console.warn("Giveaways public load error:", error);
      setParticipants([]);
      setPreviousWinners([]);
      setPreviousParticipants([]);
    } finally {
      setLoadingRows(false);
    }
  }

  useEffect(() => {
    loadParticipants();
  }, [lang]);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormMessage("");

    const fortniteName = (
      user && (profile?.ganker_user || profile?.fortnite_user)
        ? profile?.ganker_user || profile?.fortnite_user
        : form.fortnite_name
    ).trim();

    if (!fortniteName || !form.comment.trim() || !form.service_rating) {
      setFormMessage(g.missingFields);
      return;
    }

    if (!inviteToken || inviteStatus !== "valid") {
      setFormMessage("Este enlace no es válido, ya fue utilizado o pertenece a otro mes.");
      return;
    }

    if (!user) {
      const next = `/perfil?tab=Sorteos&invite=${encodeURIComponent(inviteToken)}`;
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/giveaways/participate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user?.id || null,
          fortnite_name: fortniteName,
          contact_info: "",
          service_rating: form.service_rating,
          comment: form.comment.trim(),
          invite_token: inviteToken,
          device_hint:
            typeof navigator !== "undefined"
              ? `${navigator.platform} | ${navigator.language}`
              : "unknown",
        }),
      });

      const result = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(result.error || "No se pudo registrar la participación.");
      }

      setInviteStatus("used");
      setFormMessage(result.message || g.success);
      setForm((prev) => ({
        ...prev,
        service_rating: 0,
        comment: "",
      }));
      loadParticipants();
    } catch (error) {
      setFormMessage(error.message || "Ocurrió un error.");
    } finally {
      setSubmitting(false);
    }
  }

  const podiumWinners = useMemo(() => {
    const winnerByType = new Map(
      (previousWinners || []).map((winner) => [winner.prize_type, winner])
    );

    const frequentWinner = winnerByType.get("frequent") || null;
    const monthlyWinner = winnerByType.get("monthly") || null;
    const vipWinner = winnerByType.get("vip") || null;

    return [
      {
        key: "frequent",
        title: `Usuario frecuente de ${previousMonth.label} ${previousMonth.year}`,
        winner: frequentWinner,
        prize:
          frequentWinner?.reward_name ||
          frequentWinner?.prize_name ||
          "1 Skin (hasta 1,800 paVos) y 15 días de GKG VIP (beneficios limitados).",
        glow: "shadow-[0_0_28px_rgba(250,204,21,.10)]",
      },
      {
        key: "monthly",
        title: `Usuario de ${previousMonth.label} ${previousMonth.year}`,
        winner: monthlyWinner,
        prize:
          monthlyWinner?.reward_name ||
          monthlyWinner?.prize_name ||
          "1 Bundle/Lote (hasta 2,400 paVos) y 1 mes de GKG VIP (beneficios limitados).",
        glow: "shadow-[0_0_35px_rgba(250,204,21,.18)]",
      },
      {
        key: "vip",
        title: `Usuario VIP de ${previousMonth.label} ${previousMonth.year}`,
        winner: vipWinner,
        prize:
          vipWinner?.reward_name ||
          vipWinner?.prize_name ||
          "$2,400 paVos a su cuenta o vía regalo.",
        glow: "shadow-[0_0_28px_rgba(250,204,21,.10)]",
      },
    ];
  }, [previousMonth.label, previousMonth.year, previousWinners]);

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <Card className="flex h-full flex-col overflow-hidden">
        <div className="bg-[radial-gradient(circle_at_top,#1eff7a20,transparent_55%)] p-6 md:p-8">
          <div className="grid items-start gap-4 xl:grid-cols-[1fr_auto]">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#1eff7a]/30 bg-[#1eff7a]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-[#63ff9b]">
                <Gift size={16} />
                {g.introTitle}
              </div>

              <h2 className="text-3xl font-black md:text-4xl">{g.introTitle}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300 md:text-base">
                {g.introDesc}
              </p>
            </div>

            <div className="rounded-[28px] border border-yellow-300/35 bg-[radial-gradient(circle_at_top,rgba(250,204,21,.22),transparent_45%),#081407] px-6 py-5 text-center shadow-[0_0_28px_rgba(250,204,21,.12)]">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-yellow-300">
                Mes vigente
              </p>
              <p className="mt-2 text-3xl font-black text-white drop-shadow-[0_0_12px_rgba(250,204,21,.28)]">
                {monthLabel}
              </p>
              <p className="mt-1 text-[11px] font-bold text-yellow-100/80">
                Se actualiza cada mes
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => setRulesModalOpen(true)}
          className="rounded-[28px] border border-[#1eff7a]/20 bg-[#04140b]/80 p-6 text-left transition hover:border-[#63ff9b] hover:bg-[#062012]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1eff7a]/25 bg-[#1eff7a]/10 text-[#63ff9b]">
              <Trophy size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black">{g.rulesTitle}</h3>
              <p className="mt-1 text-sm text-zinc-400">
                Consulta requisitos y premios del sorteo.
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setExtraModalOpen(true)}
          className="rounded-[28px] border border-[#1eff7a]/20 bg-[#04140b]/80 p-6 text-left transition hover:border-[#63ff9b] hover:bg-[#062012]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1eff7a]/25 bg-[#1eff7a]/10 text-[#63ff9b]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black">{g.additionalTitle}</h3>
              <p className="mt-1 text-sm text-zinc-400">
                Consulta fechas, condiciones y referencias.
              </p>
            </div>
          </div>
        </button>
      </div>

      <Card>
        <div className="mb-6 text-center">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-300">
            Podio del mes anterior
          </p>
          <h3 className="mt-2 text-3xl font-black text-yellow-300 drop-shadow-[0_0_16px_rgba(250,204,21,.35)]">
            Podio del Mes {previousMonth.label}
          </h3>
          <p className="mt-2 text-sm text-zinc-400">
            Ganadores correspondientes al sorteo de {previousMonth.label} {previousMonth.year}.
          </p>
        </div>

        <div className="grid auto-rows-fr gap-4 md:grid-cols-3">
          {podiumWinners.map((item) => {
            const winnerName =
              item.winner?.ganker_user ||
              item.winner?.profile_fortnite_user ||
              item.winner?.fortnite_name ||
              "Pendiente de listado";
            const avatar = item.winner?.avatar_url || item.winner?.profile_avatar || "";

            return (
              <div
                key={item.key}
                className={`flex h-full min-h-[330px] flex-col items-center justify-between rounded-[32px] border border-yellow-300/30 bg-[linear-gradient(180deg,#11210b_0%,#03140a_100%)] p-5 text-center ${item.glow}`}
              >
                <div>
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={winnerName}
                      className="mx-auto h-20 w-20 rounded-full border-2 border-yellow-300 object-cover shadow-[0_0_24px_rgba(250,204,21,.25)]"
                    />
                  ) : (
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-yellow-300/50 bg-yellow-300/10 text-yellow-200">
                      <Trophy size={34} />
                    </div>
                  )}

                  <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
                    {previousMonth.label} {previousMonth.year}
                  </p>
                  <h4 className="mt-2 min-h-[56px] text-xl font-black leading-tight text-white">
                    {item.title}
                  </h4>
                  <p className="mt-3 min-h-[32px] text-lg font-black text-yellow-100">
                    {winnerName}
                  </p>
                </div>

                <p className="mt-4 flex min-h-[76px] w-full items-center justify-center rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-3 text-xs font-bold leading-5 text-yellow-100">
                  Premio: {item.prize}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black">{g.registerTitle}</h3>
            <p className="mt-2 text-sm text-zinc-400">
              El formulario privado se abre en ventana modal cuando el enlace personalizado es válido.
            </p>
          </div>

          {inviteToken && user && inviteStatus === "valid" && (
            <button
              type="button"
              onClick={() => setRegistrationModalOpen(true)}
              className="rounded-2xl bg-[#1eff7a] px-5 py-3 font-black text-black hover:brightness-110"
            >
              Abrir registro privado
            </button>
          )}
        </div>

        {!inviteToken ? (
          <div className="mt-4 rounded-3xl border border-dashed border-[#1eff7a]/20 bg-[#04140b]/80 p-5">
            <p className="text-sm leading-6 text-zinc-300">{g.registerLocked}</p>
          </div>
        ) : !user ? (
          <div className="mt-4 rounded-3xl border border-yellow-300/25 bg-yellow-300/10 p-5">
            <p className="text-sm leading-6 text-yellow-100">
              Este enlace personalizado está reservado. Para desbloquear el registro, inicia sesión o crea tu cuenta de Ganker Games.
            </p>

            <button
              type="button"
              onClick={() => {
                const next = `/perfil?tab=Sorteos&invite=${encodeURIComponent(inviteToken)}`;
                router.push(`/login?next=${encodeURIComponent(next)}`);
              }}
              className="mt-4 rounded-2xl bg-[#1eff7a] px-5 py-3 font-black text-black hover:brightness-110"
            >
              Iniciar sesión o registrarme
            </button>
          </div>
        ) : inviteStatus === "used" ? (
          <div className="mt-4 rounded-3xl border border-red-500/25 bg-red-500/10 p-5">
            <p className="text-sm leading-6 text-red-100">
              Este enlace personalizado ya fue utilizado. Solicita otro enlace para participar nuevamente.
            </p>
          </div>
        ) : inviteStatus === "invalid" ? (
          <div className="mt-4 rounded-3xl border border-red-500/25 bg-red-500/10 p-5">
            <p className="text-sm leading-6 text-red-100">
              Este enlace no es válido para el mes vigente. Solicita un enlace nuevo para participar.
            </p>
          </div>
        ) : inviteStatus === "checking" ? (
          <div className="mt-4 rounded-3xl border border-yellow-300/25 bg-yellow-300/10 p-5">
            <p className="text-sm leading-6 text-yellow-100">
              Validando enlace personalizado...
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-3xl border border-[#1eff7a]/20 bg-[#04140b]/80 p-5">
            <p className="text-sm leading-6 text-zinc-300">
              Enlace disponible. Presiona <strong>Abrir registro privado</strong> para llenar tu participación sin salir de Sorteos.
            </p>
          </div>
        )}
      </Card>

      {registrationModalOpen && inviteToken && user && inviteStatus === "valid" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px] border border-[#1eff7a]/25 bg-[#020804] p-6 text-white shadow-[0_0_45px_rgba(30,255,122,.18)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#63ff9b]">
                  Sorteos GKG
                </p>
                <h3 className="mt-2 text-2xl font-black italic">
                  Registro privado de participación
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setRegistrationModalOpen(false)}
                className="rounded-2xl border border-[#1eff7a]/30 px-4 py-2 text-sm font-black text-[#63ff9b]"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-black">
                  {g.fortniteName}
                </label>
                <input
                  type="text"
                  value={user && (profile?.ganker_user || profile?.fortnite_user) ? profile?.ganker_user || profile?.fortnite_user : form.fortnite_name}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      fortnite_name: event.target.value,
                    }))
                  }
                  disabled={Boolean(user && (profile?.ganker_user || profile?.fortnite_user))}
                  className="w-full rounded-2xl border border-[#1eff7a]/20 bg-[#02130a] px-4 py-3 text-white outline-none transition focus:border-[#1eff7a]/50 disabled:cursor-not-allowed disabled:opacity-80"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black">
                  Calificación al servicio <span className="text-[#63ff9b]">(1 a 5)</span>
                </label>
                <GiveawayStarRating
                  value={form.service_rating}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, service_rating: value }))
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black">
                  {g.comment}
                </label>
                <textarea
                  rows={4}
                  value={form.comment}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      comment: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-[#1eff7a]/20 bg-[#02130a] px-4 py-3 text-white outline-none transition focus:border-[#1eff7a]/50"
                />
              </div>

              <div className="rounded-2xl border border-[#1eff7a]/15 bg-[#02130a] p-4 text-sm leading-6 text-zinc-300">
                Deja tu referencia en nuestros grupos de Ganker Games para validar tu participación y ganar premios por actividad de comunidad. Para ganar el premio por dos compras por mes de $8 MXN x 100 paVos deberás mandar tu referencia por WhatsApp o Facebook.
                <button
                  type="button"
                  onClick={() => setGroupsModalOpen(true)}
                  className="mt-3 inline-flex rounded-xl border border-[#1eff7a]/30 px-4 py-2 text-xs font-black text-[#63ff9b] hover:border-[#63ff9b]"
                >
                  Ver grupos de Ganker Games
                </button>
              </div>

              {formMessage ? (
                <div className="rounded-2xl border border-[#1eff7a]/18 bg-[#03140a] px-4 py-3 text-sm text-zinc-300">
                  {formMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full bg-[#1eff7a] px-6 py-3 text-sm font-black text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Gift size={18} />
                {submitting ? g.sending : g.sendEntry}
              </button>
            </form>
          </div>
        </div>
      )}

      <Card>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black">Participantes del mes vigente</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Aquí aparecerán únicamente los registros del mes actual. Los meses anteriores se conservan abajo por historial.
            </p>
          </div>

          <div className="rounded-full border border-[#1eff7a]/20 bg-[#1eff7a]/10 px-4 py-2 text-sm font-black text-[#63ff9b]">
            {monthLabel}
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-[#1eff7a]/15">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#05180d] text-zinc-300">
              <tr>
                <th className="px-4 py-3 font-black">{g.tableName}</th>
                <th className="px-4 py-3 font-black">{g.tableType}</th>
                <th className="px-4 py-3 font-black">{g.tableLogs}</th>
                <th className="px-4 py-3 font-black">{g.tableEntries}</th>
              </tr>
            </thead>

            <tbody>
              {loadingRows ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-zinc-400">
                    {t.loading}
                  </td>
                </tr>
              ) : displayParticipants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-zinc-400">
                    Sin participantes registrados en {monthLabel}.
                  </td>
                </tr>
              ) : (
                displayParticipants.map((row) => (
                  <tr
                    key={row.fortnite_name}
                    className="border-t border-[#1eff7a]/10 bg-[#021109]/60"
                  >
                    <td className="px-4 py-3 font-bold text-white">
                      {row.fortnite_name}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex w-24 justify-center rounded-full px-3 py-1 text-xs font-black ${
                          row.is_vip
                            ? "bg-cyan-300/15 text-cyan-100"
                            : "bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        {row.is_vip ? g.vip : g.normal}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{row.registros}</td>
                    <td className="px-4 py-3 font-black text-[#63ff9b]">
                      {row.participaciones}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {historicalParticipantMonths.map((history) => (
        <Card key={history.key}>
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black">Participantes de {history.label}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Aquí se muestra únicamente el mes anterior. Los demás meses se conservan internamente en Supabase para auditoría.
              </p>
            </div>

            <div className="rounded-full border border-yellow-300/30 bg-yellow-300/10 px-4 py-2 text-sm font-black text-yellow-200">
              Histórico
            </div>
          </div>

          <div className="max-h-[520px] overflow-y-auto rounded-3xl border border-yellow-300/15">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 bg-[#151805] text-zinc-300">
                <tr>
                  <th className="px-4 py-3 font-black">Jugador</th>
                  <th className="px-4 py-3 font-black">Tipo</th>
                  <th className="px-4 py-3 font-black">Registros del mes</th>
                  <th className="px-4 py-3 font-black">Participaciones</th>
                </tr>
              </thead>

              <tbody>
                {history.rows.map((row) => (
                  <tr
                    key={`${history.key}-${row.fortnite_name}`}
                    className="border-t border-yellow-300/10 bg-[#080f05]/70"
                  >
                    <td className="px-4 py-3 font-bold text-white">
                      {row.fortnite_name}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex w-24 justify-center rounded-full px-3 py-1 text-xs font-black ${
                          row.is_vip
                            ? "bg-cyan-300/15 text-cyan-100"
                            : "bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        {row.is_vip ? "VIP" : "Normal"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{row.registros}</td>
                    <td className="px-4 py-3 font-black text-yellow-200">
                      {row.participaciones}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}

      <GiveawayInfoModal
        open={rulesModalOpen}
        title={g.rulesTitle}
        onClose={() => setRulesModalOpen(false)}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {rules.map((rule) => {
            const Icon = rule.icon;

            return (
              <div
                key={rule.title}
                className="rounded-2xl border border-[#1eff7a]/15 bg-[#04140b]/80 p-4"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#1eff7a]/20 bg-[#1eff7a]/10 text-[#63ff9b]">
                  <Icon size={22} />
                </div>

                <h4 className="text-lg font-black leading-tight">{rule.title}</h4>

                <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-[#63ff9b]">
                  {g.requirements}
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  {rule.requirement}
                </p>

                <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-[#63ff9b]">
                  {g.prizes}
                </p>
                <p className="mt-2 text-sm leading-6 text-white">
                  {rule.prize}
                </p>
              </div>
            );
          })}
        </div>
      </GiveawayInfoModal>

      <GiveawayInfoModal
        open={extraModalOpen}
        title={g.additionalTitle}
        onClose={() => setExtraModalOpen(false)}
      >
        {additionalData.map((item) => (
          <div
            key={item}
            className="flex items-start gap-3 rounded-2xl border border-[#1eff7a]/12 bg-[#04140b]/75 px-4 py-3"
          >
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#63ff9b]" />
            <span>{item}</span>
          </div>
        ))}
      </GiveawayInfoModal>

      <GiveawayInfoModal
        open={groupsModalOpen}
        title="Grupos oficiales de Ganker Games"
        onClose={() => setGroupsModalOpen(false)}
      >
        <a
          href="https://chat.whatsapp.com/IKyb9dcMtjLA2GEb6GGChi"
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-2xl border border-[#1eff7a]/20 bg-[#04140b] p-4 font-black text-[#63ff9b] hover:border-[#63ff9b]"
        >
          WhatsApp: Grupo Ganker Games
        </a>
        <a
          href="https://www.facebook.com/groups/803889084797937"
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-2xl border border-[#1eff7a]/20 bg-[#04140b] p-4 font-black text-[#63ff9b] hover:border-[#63ff9b]"
        >
          Facebook: Grupo Ganker Games
        </a>
      </GiveawayInfoModal>
    </section>
  );
}


async function readJsonResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const rawText = await response.text();

  if (!contentType.includes("application/json")) {
    const preview = rawText.slice(0, 120).replace(/\s+/g, " ");
    throw new Error(
      `La ruta API no devolvió JSON. Revisa que el archivo route.js esté en la carpeta correcta. Respuesta: ${preview}`
    );
  }

  try {
    return JSON.parse(rawText);
  } catch (error) {
    throw new Error("La respuesta de la API no es un JSON válido.");
  }
}

const CREATOR_COPY = {
  es: {
    title: "Panel de Creador",
    subtitle:
      "Administra sorteos, genera enlaces personalizados y ejecuta la selección automática de ganadores.",
    role: "Rol actual",
    campaign: "Campaña activa",
    noCampaign: "No hay campaña activa.",
    reload: "Actualizar panel",
    generateTitle: "Generar enlaces personalizados",
    generateDesc:
      "Estos enlaces abren el formulario oculto de participación para las personas que tú elijas.",
    amount: "Cantidad",
    generate: "Generar enlaces",
    generating: "Generando...",
    latestLinks: "Últimos enlaces generados",
    copy: "Copiar",
    copied: "Copiado",
    drawTitle: "Recuperar cierre mensual",
    drawDesc:
      "Revisa y recupera el cierre del mes anterior sin reemplazar ganadores ya guardados.",
    drawButton: "Recuperar cierre mensual",
    drawing: "Revisando cierre...",
    winners: "Ganadores",
    noWinners: "Todavía no hay ganadores seleccionados.",
    participants: "Resumen de participantes",
    deleteRecord: "Borrar",
    deletingRecord: "Borrando...",
    deleteConfirm: "¿Seguro que quieres borrar todos los registros de este jugador en la campaña activa?",
    deleteSuccess: "Registro borrado correctamente.",
    actions: "Acciones",
    user: "Jugador",
    type: "Tipo",
    records: "Registros",
    entries: "Participaciones",
    vip: "VIP",
    normal: "Normal",
    prizeType: "Sorteo",
    selectedAt: "Fecha",
    monthly: "GKG del Mes",
    frequent: "GKG Frecuente del Mes",
    vipOnly: "GKG VIP del Mes",
    everyoneRule: "Sorteo 1: todos los participantes. VIP cuenta doble.",
    frequentRule:
      "Sorteo 2: solo usuarios con 2 o más participaciones ponderadas en el mes. Un registro VIP cuenta doble.",
    vipRule: "Sorteo 3: únicamente usuarios VIP.",
    confirmDraw:
      "¿Revisar y recuperar el cierre mensual? Si ya existen ganadores, se conservarán exactamente los mismos.",
    errorAuth: "No se encontró sesión activa para validar permisos.",
  },
  en: {
    title: "Creator Panel",
    subtitle:
      "Manage giveaways, generate personalized links, and run the automatic winner selection.",
    role: "Current role",
    campaign: "Active campaign",
    noCampaign: "No active campaign.",
    reload: "Refresh panel",
    generateTitle: "Generate personalized links",
    generateDesc:
      "These links open the hidden participation form for the people you choose.",
    amount: "Amount",
    generate: "Generate links",
    generating: "Generating...",
    latestLinks: "Latest generated links",
    copy: "Copy",
    copied: "Copied",
    drawTitle: "Recover monthly close",
    drawDesc:
      "Review and recover the previous monthly close without replacing saved winners.",
    drawButton: "Recover monthly close",
    drawing: "Reviewing close...",
    winners: "Winners",
    noWinners: "No winners selected yet.",
    participants: "Participants summary",
    deleteRecord: "Delete",
    deletingRecord: "Deleting...",
    deleteConfirm: "Are you sure you want to delete all records for this player in the active campaign?",
    deleteSuccess: "Record deleted successfully.",
    actions: "Actions",
    user: "Player",
    type: "Type",
    records: "Records",
    entries: "Entries",
    vip: "VIP",
    normal: "Regular",
    prizeType: "Giveaway",
    selectedAt: "Date",
    monthly: "GKG of the Month",
    frequent: "Frequent GKG of the Month",
    vipOnly: "VIP GKG of the Month",
    everyoneRule: "Giveaway 1: all participants. VIP counts double.",
    frequentRule:
      "Giveaway 2: only users with 2 or more weighted monthly entries. One VIP record counts double.",
    vipRule: "Giveaway 3: VIP users only.",
    confirmDraw:
      "Review and recover the monthly close? Existing winners will be preserved exactly.",
    errorAuth: "No active session found to validate permissions.",
  },
};

function CreatorPanel({ lang, supabase, accountRole }) {
  const c = CREATOR_COPY[lang] || CREATOR_COPY.es;

  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [campaign, setCampaign] = useState(null);
  const [invites, setInvites] = useState([]);
  const [winners, setWinners] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [previousMonthPayload, setPreviousMonthPayload] = useState(null);
  const [historicalParticipants, setHistoricalParticipants] = useState([]);
  const [inviteCount, setInviteCount] = useState(10);
  const [copiedToken, setCopiedToken] = useState("");
  const [deletingParticipant, setDeletingParticipant] = useState("");
  const [vipIdentifier, setVipIdentifier] = useState("");
  const [vipMonthsAdmin, setVipMonthsAdmin] = useState("1");
  const [vipAdminNote, setVipAdminNote] = useState("");
  const [vipAdminMessage, setVipAdminMessage] = useState("");
  const [vipUsers, setVipUsers] = useState([]);
  const [vipSearch, setVipSearch] = useState("");
  const [vipUserEdits, setVipUserEdits] = useState({});
  const [vipRewardsAdmin, setVipRewardsAdmin] = useState([]);
  const [vipRewardSearch, setVipRewardSearch] = useState("");
  const [manualRewardUser, setManualRewardUser] = useState("");
  const [manualRewardName, setManualRewardName] = useState("");
  const [manualRewardType, setManualRewardType] = useState("sorteo");
  const [manualRewardMessage, setManualRewardMessage] = useState("");
  const [participantModalOpen, setParticipantModalOpen] = useState(false);
  const [manualParticipant, setManualParticipant] = useState({
    fortnite_name: "",
    is_vip: false,
    registros: 1,
    participaciones: 1,
  });
  const [creatorSection, setCreatorSection] = useState("vip");

  async function getAuthHeaders() {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;

    if (!token) {
      throw new Error(c.errorAuth);
    }

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  async function loadAdminData() {
    setLoadingAdmin(true);
    setMessage("");

    try {
      const headers = await getAuthHeaders();

      const response = await fetch("/api/giveaways/admin", {
        method: "GET",
        headers,
      });

      const result = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(result.error || "No se pudo cargar el panel.");
      }

      const activeCampaign = result.current_month || result.campaign || null;

      setCampaign(activeCampaign);
      setInvites(result.invites || []);
      setWinners(result.previous_month_winners || result.winners || []);
      setParticipants(result.current_participants || result.participants || []);
      setPreviousMonthPayload(result.previous_month || null);
      setHistoricalParticipants(result.previous_month_participants || []);

      const { data: vipUserRows, error: vipUserError } = await supabase.rpc(
        "admin_get_vip_users"
      );

      if (!vipUserError) {
        setVipUsers(vipUserRows || []);
      }

      const { data: vipRewardRows, error: vipRewardError } = await supabase.rpc(
        "admin_get_vip_rewards"
      );

      if (!vipRewardError) {
        setVipRewardsAdmin(vipRewardRows || []);
      }
    } catch (error) {
      setMessage(error.message || "Error al cargar el panel.");
    } finally {
      setLoadingAdmin(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, [lang]);

  function getFullInviteLink(token) {
    if (typeof window === "undefined") {
      return `/perfil?tab=Sorteos&invite=${token}`;
    }

    return `${window.location.origin}/perfil?tab=Sorteos&invite=${token}`;
  }

  async function copyInvite(token) {
    const link = getFullInviteLink(token);

    try {
      await navigator.clipboard.writeText(link);
      setCopiedToken(token);

      setTimeout(() => setCopiedToken(""), 1200);
    } catch (error) {
      setMessage(link);
    }
  }

  async function deleteInvite(token) {
    const confirmed =
      typeof window === "undefined"
        ? true
        : window.confirm("¿Seguro que quieres borrar este enlace personalizado?");

    if (!confirmed) return;

    setWorking(true);
    setMessage("");

    try {
      const headers = await getAuthHeaders();

      const response = await fetch("/api/giveaways/admin", {
        method: "POST",
        headers,
        body: JSON.stringify({
          action: "delete_invite",
          token,
        }),
      });

      const result = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(result.error || "No se pudo borrar el enlace.");
      }

      setInvites(result.invites || []);
      setMessage("Enlace personalizado borrado correctamente.");
    } catch (error) {
      setMessage(error.message || "No se pudo borrar el enlace.");
    } finally {
      setWorking(false);
    }
  }

  async function generateInvites() {
    setWorking(true);
    setMessage("");

    try {
      const headers = await getAuthHeaders();

      const response = await fetch("/api/giveaways/admin", {
        method: "POST",
        headers,
        body: JSON.stringify({
          action: "generate_invites",
          count: Number(inviteCount || 1),
        }),
      });

      const result = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(result.error || "No se pudieron generar enlaces.");
      }

      setInvites(result.invites || []);
      setCampaign(result.campaign || campaign);
      setMessage(
        lang === "es"
          ? "Enlaces personalizados generados correctamente."
          : "Personalized links generated successfully."
      );
    } catch (error) {
      setMessage(error.message || "Error.");
    } finally {
      setWorking(false);
    }
  }

  async function repairMonthlyClose() {
    const targetMonthKey = previousMonthPayload?.month_key;

    if (!targetMonthKey) {
      setMessage("No se pudo identificar el mes anterior.");
      return;
    }

    const confirmed =
      typeof window === "undefined"
        ? true
        : window.confirm(
            `¿Revisar y recuperar el cierre de ${targetMonthKey}? Si ya existen ganadores, se conservarán exactamente los mismos.`
          );

    if (!confirmed) return;

    setWorking(true);
    setMessage("");

    try {
      const headers = await getAuthHeaders();

      const response = await fetch("/api/giveaways/admin", {
        method: "POST",
        headers,
        body: JSON.stringify({
          action: "repair_monthly_close",
          month_key: targetMonthKey,
        }),
      });

      const result = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(result.error || "No se pudo revisar el cierre mensual.");
      }

      setMessage(
        result.message ||
          "Cierre mensual revisado correctamente. Los ganadores existentes se conservaron."
      );

      await loadAdminData();
    } catch (error) {
      setMessage(error.message || "No se pudo revisar el cierre mensual.");
    } finally {
      setWorking(false);
    }
  }

  async function addManualParticipant() {
    setWorking(true);
    setMessage("");

    try {
      const name = manualParticipant.fortnite_name.trim();

      if (!name) {
        throw new Error("Escribe el nombre del jugador.");
      }

      const monthKey =
        campaign?.month_key ||
        campaign?.month_label ||
        new Date().toISOString().slice(0, 7);

      const { error } = await supabase.rpc("admin_add_manual_giveaway_participant", {
        month_key_input: monthKey,
        fortnite_name_input: name,
        is_vip_input: Boolean(manualParticipant.is_vip),
        registros_input: Number(manualParticipant.registros || 1),
        participaciones_input: Number(manualParticipant.participaciones || (manualParticipant.is_vip ? 2 : 1)),
      });

      if (error) throw error;

      setParticipantModalOpen(false);
      setManualParticipant({
        fortnite_name: "",
        is_vip: false,
        registros: 1,
        participaciones: 1,
      });
      setMessage("Participante agregado correctamente.");
      await loadAdminData();
    } catch (error) {
      setMessage(error.message || "No se pudo agregar participante.");
    } finally {
      setWorking(false);
    }
  }

  async function deleteParticipant(fortniteName) {
    const confirmed =
      typeof window === "undefined" ? true : window.confirm(c.deleteConfirm);

    if (!confirmed) return;

    setDeletingParticipant(fortniteName);
    setMessage("");

    try {
      const headers = await getAuthHeaders();

      const response = await fetch("/api/giveaways/admin", {
        method: "POST",
        headers,
        body: JSON.stringify({
          action: "delete_participant",
          fortnite_name: fortniteName,
        }),
      });

      const result = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(result.error || "No se pudo borrar el registro.");
      }

      setMessage(result.message || c.deleteSuccess);
      await loadAdminData();
    } catch (error) {
      setMessage(error.message || "Error.");
    } finally {
      setDeletingParticipant("");
    }
  }

  function getPrizeName(type) {
    if (type === "monthly") return c.monthly;
    if (type === "frequent") return c.frequent;
    if (type === "vip") return c.vipOnly;
    return type;
  }

  const filteredVipUsers = vipUsers.filter((item) => {
    const query = vipSearch.trim().toLowerCase();

    if (!query) return true;

    return [
      item.display_name,
      item.ganker_user,
      item.fortnite_user,
      item.email,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  function selectVipUser(item) {
    const identifier = item.ganker_user || item.fortnite_user || item.email || item.id || "";
    setVipIdentifier(identifier);
    setVipAdminNote(
      item.is_vip
        ? "Renovación VIP validada desde panel creador"
        : "Activación VIP validada desde panel creador"
    );
  }

  function getVipRowName(item) {
    const fullName = `${item.first_name || ""} ${item.middle_name || ""} ${item.last_name || ""}`
      .replace(/\s+/g, " ")
      .trim();

    return fullName || item.display_name || item.ganker_user || item.email || "Usuario GKG";
  }

  async function activateVipForUser() {
    setWorking(true);
    setVipAdminMessage("");

    try {
      const months = Math.min(12, Math.max(1, Number(vipMonthsAdmin || 1)));

      if (!vipIdentifier.trim()) {
        throw new Error("Escribe el usuario Ganker Games o correo del usuario.");
      }

      const { data, error } = await supabase.rpc("admin_activate_vip", {
        user_identifier: vipIdentifier.trim(),
        months_to_add: months,
        payment_note: vipAdminNote || "Activación manual desde panel creador",
      });

      if (error) throw error;

      setVipAdminMessage("VIP actualizado correctamente. Los premios correspondientes se agregaron en automático.");
      setVipIdentifier("");
      setVipAdminNote("");
      setVipMonthsAdmin("1");
      await loadAdminData();
    } catch (error) {
      setVipAdminMessage(error.message || "No se pudo activar el VIP.");
    } finally {
      setWorking(false);
    }
  }

  async function continueVipMonth() {
    setWorking(true);
    setVipAdminMessage("");

    try {
      if (!vipIdentifier.trim()) {
        throw new Error("Escribe el usuario Ganker Games o correo del usuario.");
      }

      const { data, error } = await supabase.rpc("admin_activate_vip", {
        user_identifier: vipIdentifier.trim(),
        months_to_add: 1,
        payment_note: vipAdminNote || "Pago mensual confirmado desde panel creador",
      });

      if (error) throw error;

      setVipAdminMessage("Pago mensual registrado. El mes VIP sigue activo.");
      await loadAdminData();
    } catch (error) {
      setVipAdminMessage(error.message || "No se pudo registrar el pago mensual.");
    } finally {
      setWorking(false);
    }
  }

  async function setExactVipMonth() {
    setWorking(true);
    setVipAdminMessage("");

    try {
      const exactMonth = Math.max(1, Number(vipMonthsAdmin || 1));

      if (!vipIdentifier.trim()) {
        throw new Error("Escribe el usuario Ganker Games o correo del usuario.");
      }

      const { data, error } = await supabase.rpc("admin_set_vip_month", {
        user_identifier: vipIdentifier.trim(),
        target_streak_months: exactMonth,
        payment_note: vipAdminNote || "Ajuste manual de antigüedad VIP desde panel creador",
      });

      if (error) throw error;

      setVipAdminMessage(`Usuario colocado en el mes VIP ${exactMonth}. Los premios correspondientes se actualizaron.`);
      await loadAdminData();
    } catch (error) {
      setVipAdminMessage(error.message || "No se pudo poner al usuario en ese mes VIP.");
    } finally {
      setWorking(false);
    }
  }

  async function removeVipMonths() {
    setWorking(true);
    setVipAdminMessage("");

    try {
      const monthsToRemove = Math.max(1, Number(vipMonthsAdmin || 1));

      if (!vipIdentifier.trim()) {
        throw new Error("Escribe el usuario Ganker Games o correo del usuario.");
      }

      const { data, error } = await supabase.rpc("admin_remove_vip_months", {
        user_identifier: vipIdentifier.trim(),
        months_to_remove: monthsToRemove,
        payment_note: vipAdminNote || "Ajuste manual: quitar meses VIP desde panel creador",
      });

      if (error) throw error;

      setVipAdminMessage(`Se quitaron ${monthsToRemove} mes(es) VIP. Los premios se recalcularon.`);
      await loadAdminData();
    } catch (error) {
      setVipAdminMessage(error.message || "No se pudieron quitar meses VIP.");
    } finally {
      setWorking(false);
    }
  }

  function formatDateInput(value) {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toISOString().slice(0, 10);
  }

  function getVipEdit(item) {
    const edit = vipUserEdits[item.id] || {};

    return {
      months: edit.months ?? String(Math.max(1, Number(item.vip_streak_months || 1))),
      startDate: edit.startDate ?? formatDateInput(item.vip_started_at),
      note: edit.note ?? "",
    };
  }

  function updateVipEdit(itemId, field, value) {
    setVipUserEdits((current) => ({
      ...current,
      [itemId]: {
        ...(current[itemId] || {}),
        [field]: value,
      },
    }));
  }

  function getVipIdentifier(item) {
    return item?.id || item?.ganker_user || item?.fortnite_user || item?.email || "";
  }

  async function runVipAction(item, action) {
    const edit = getVipEdit(item);
    const identifier = getVipIdentifier(item);
    const months = Math.max(1, Number(edit.months || 1));
    const note = edit.note || "Ajuste VIP desde listado de usuarios";

    setWorking(true);
    setVipAdminMessage("");

    try {
      if (action === "add") {
        const { error } = await supabase.rpc("admin_activate_vip", {
          user_identifier: identifier,
          months_to_add: Math.min(12, months),
          payment_note: note || "Activación VIP desde listado",
        });

        if (error) throw error;

        setVipAdminMessage(`Se añadieron ${Math.min(12, months)} mes(es) VIP a ${getVipRowName(item)}.`);
      }

      if (action === "renew") {
        const { error } = await supabase.rpc("admin_activate_vip", {
          user_identifier: identifier,
          months_to_add: 1,
          payment_note: note || "Renovación mensual desde listado",
        });

        if (error) throw error;

        setVipAdminMessage(`Renovación registrada para ${getVipRowName(item)}.`);
      }

      if (action === "set") {
        const { error } = await supabase.rpc("admin_set_vip_month_with_start", {
          user_identifier: identifier,
          target_streak_months: months,
          vip_start_date_input: edit.startDate || null,
          payment_note: note || "Ajuste de mes exacto VIP desde listado",
        });

        if (error) throw error;

        setVipAdminMessage(`${getVipRowName(item)} quedó en el mes VIP ${months}. La fecha de inicio, premios y línea VIP fueron actualizados.`);
      }

      if (action === "remove") {
        const { error } = await supabase.rpc("admin_remove_vip_months", {
          user_identifier: identifier,
          months_to_remove: months,
          payment_note: note || "Quitar meses VIP desde listado",
        });

        if (error) throw error;

        setVipAdminMessage(`Se quitaron ${months} mes(es) VIP a ${getVipRowName(item)}.`);
      }

      await loadAdminData();
    } catch (error) {
      setVipAdminMessage(error.message || "No se pudo actualizar el VIP.");
    } finally {
      setWorking(false);
    }
  }

  const filteredVipRewards = vipRewardsAdmin.filter((reward) => {
    const query = vipRewardSearch.trim().toLowerCase();

    if (!query) return true;

    return [
      reward.display_name,
      reward.ganker_user,
      reward.email,
      reward.reward_name,
      reward.status,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  async function updateVipRewardStatus(reward, newStatus) {
    setWorking(true);
    setVipAdminMessage("");

    try {
      const { error } = await supabase.rpc("admin_update_vip_reward_status", {
        reward_id_input: reward.id,
        new_status: newStatus,
      });

      if (error) throw error;

      setVipAdminMessage(
        newStatus === "claimed"
          ? "Premio marcado como cobrado."
          : newStatus === "processing"
            ? "Premio marcado como procesando regalo."
            : "Premio marcado como disponible."
      );

      await loadAdminData();
    } catch (error) {
      setVipAdminMessage(error.message || "No se pudo actualizar el premio.");
    } finally {
      setWorking(false);
    }
  }

  async function deleteVipReward(reward) {
    const confirmed =
      typeof window === "undefined"
        ? true
        : window.confirm(`¿Quitar el premio "${reward.reward_name}"?`);

    if (!confirmed) return;

    setWorking(true);
    setVipAdminMessage("");

    try {
      const { error } = await supabase.rpc("admin_delete_vip_reward", {
        reward_id_input: reward.id,
      });

      if (error) throw error;

      setVipAdminMessage("Premio eliminado correctamente.");
      await loadAdminData();
    } catch (error) {
      setVipAdminMessage(error.message || "No se pudo quitar el premio.");
    } finally {
      setWorking(false);
    }
  }

  async function addManualReward() {
    setWorking(true);
    setManualRewardMessage("");

    try {
      if (!manualRewardUser.trim()) {
        throw new Error("Escribe usuario Ganker Games, correo o ID del usuario.");
      }

      if (!manualRewardName.trim()) {
        throw new Error("Escribe el nombre del premio.");
      }

      const { error } = await supabase.rpc("admin_add_profile_reward_by_identifier", {
        user_identifier: manualRewardUser.trim(),
        reward_name_input: manualRewardName.trim(),
        reward_type_input: manualRewardType,
      });

      if (error) throw error;

      setManualRewardMessage(
        manualRewardType === "sorteo"
          ? "PREMIO SORTEO agregado correctamente y asignado al usuario."
          : "PREMIO VIP agregado correctamente y asignado al usuario."
      );
      setManualRewardUser("");
      setManualRewardName("");
      setManualRewardType("sorteo");
      await loadAdminData();
    } catch (error) {
      setManualRewardMessage(error.message || "No se pudo agregar el premio.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#1eff7a]/30 bg-[#1eff7a]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#63ff9b]">
              <ShieldCheck size={16} />
              {c.role}: {accountRole}
            </div>

            <h2 className="text-3xl font-black">{c.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">
              {c.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={loadAdminData}
            className="rounded-2xl border border-[#1eff7a]/30 bg-[#021509] px-5 py-3 text-sm font-black text-[#63ff9b] hover:border-[#63ff9b]"
          >
            {c.reload}
          </button>
        </div>

        {message ? (
          <div className="mt-5 rounded-2xl border border-[#1eff7a]/20 bg-[#021509] px-4 py-3 text-sm text-zinc-200">
            {message}
          </div>
        ) : null}
      </Card>

      <Card>
        <div className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setCreatorSection("vip")}
            className={`rounded-2xl border px-5 py-4 text-sm font-black transition ${
              creatorSection === "vip"
                ? "border-cyan-300/50 bg-cyan-300/15 text-cyan-100"
                : "border-[#1eff7a]/20 bg-[#021509] text-[#63ff9b] hover:border-[#63ff9b]"
            }`}
          >
            Control VIP
          </button>

          <button
            type="button"
            onClick={() => setCreatorSection("premios")}
            className={`rounded-2xl border px-5 py-4 text-sm font-black transition ${
              creatorSection === "premios"
                ? "border-yellow-300/50 bg-yellow-300/15 text-yellow-100"
                : "border-[#1eff7a]/20 bg-[#021509] text-zinc-300 hover:border-[#63ff9b]"
            }`}
          >
            Premios
          </button>

          <button
            type="button"
            onClick={() => setCreatorSection("sorteos")}
            className={`rounded-2xl border px-5 py-4 text-sm font-black transition ${
              creatorSection === "sorteos"
                ? "border-[#1eff7a]/50 bg-[#1eff7a]/15 text-[#63ff9b]"
                : "border-[#1eff7a]/20 bg-[#021509] text-zinc-300 hover:border-[#63ff9b]"
            }`}
          >
            Sorteos
          </button>
        </div>
      </Card>

      {creatorSection === "vip" && (
      <div className="space-y-6">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
                <Crown size={16} />
                Control VIP
              </div>

              <h3 className="text-2xl font-black">Usuarios VIP registrados</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                Administra todo desde el listado: activa VIP, añade meses, marca renovación, pon el mes exacto, cambia la fecha de inicio o quita meses.
              </p>
            </div>

            <button
              type="button"
              onClick={loadAdminData}
              disabled={working}
              className="rounded-2xl border border-[#1eff7a]/30 bg-[#020804] px-4 py-3 text-xs font-black text-[#63ff9b] hover:border-[#63ff9b] disabled:opacity-60"
            >
              Actualizar lista
            </button>
          </div>

          <input
            type="text"
            value={vipSearch}
            onChange={(event) => setVipSearch(event.target.value)}
            placeholder="Buscar por usuario GKG o correo..."
            className="mt-5 w-full rounded-2xl border border-[#1eff7a]/25 bg-[#020804] px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-[#1eff7a]"
          />

          <div className="mt-5 max-h-[560px] space-y-4 overflow-y-auto pr-1">
            {loadingAdmin ? (
              <p className="rounded-2xl border border-[#1eff7a]/15 bg-[#020804]/70 p-4 text-sm text-zinc-400">
                Cargando usuarios...
              </p>
            ) : filteredVipUsers.length === 0 ? (
              <p className="rounded-2xl border border-[#1eff7a]/15 bg-[#020804]/70 p-4 text-sm text-zinc-400">
                No se encontraron usuarios registrados.
              </p>
            ) : (
              filteredVipUsers.map((item) => {
                const rowName = getVipRowName(item);
                const userLabel = item.ganker_user || item.fortnite_user || "Sin usuario GKG";
                const statusText = item.is_vip
                  ? `VIP activo · ${item.vip_streak_months || 0} mes(es)`
                  : "Sin VIP activo";
                const edit = getVipEdit(item);

                return (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-[#1eff7a]/15 bg-[#020804]/75 p-4"
                  >
                    <div className="grid gap-4 xl:grid-cols-[1fr_340px_auto]">
                      <div className="flex min-w-0 items-center gap-3">
                        <AvatarDisplay
                          src={item.avatar_url || ""}
                          alt={rowName}
                          status={item.presence_status || "offline"}
                          size="sm"
                        />

                        <div className="min-w-0">
                          <p className="truncate font-black text-white">{rowName}</p>
                          <p className="truncate text-xs text-zinc-400">
                            {userLabel} · {item.email || "Sin correo visible"}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-black ${
                                item.is_vip
                                  ? "bg-cyan-300/15 text-cyan-200"
                                  : "bg-zinc-700/40 text-zinc-300"
                              }`}
                            >
                              {statusText}
                            </span>

                            {item.vip_started_at && (
                              <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-100">
                                Inicio: {formatDateForVip(item.vip_started_at)}
                              </span>
                            )}

                            {item.vip_until && (
                              <span className="rounded-full bg-[#1eff7a]/10 px-3 py-1 text-xs font-black text-[#63ff9b]">
                                Vence: {formatDateForVip(item.vip_until)}
                              </span>
                            )}

                            {item.vip_grace_until && (
                              <span className="rounded-full bg-yellow-300/10 px-3 py-1 text-xs font-black text-yellow-100">
                                Gracia: {formatDateForVip(item.vip_grace_until)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                            Meses
                          </span>
                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={edit.months}
                            onChange={(event) =>
                              updateVipEdit(item.id, "months", event.target.value)
                            }
                            className="w-full rounded-2xl border border-[#1eff7a]/25 bg-[#021509] px-4 py-3 text-white outline-none focus:border-[#1eff7a]"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                            Fecha inicio VIP
                          </span>
                          <input
                            type="date"
                            value={edit.startDate}
                            onChange={(event) => {
                              const newDate = event.target.value;
                              updateVipEdit(item.id, "startDate", newDate);

                              const calculatedMonths = calculateVipMonthsFromDate(newDate);
                              if (calculatedMonths) {
                                updateVipEdit(item.id, "months", calculatedMonths);
                              }
                            }}
                            className="w-full rounded-2xl border border-[#1eff7a]/25 bg-[#021509] px-4 py-3 text-white outline-none focus:border-[#1eff7a]"
                          />
                          <button
                            type="button"
                            onClick={() => runVipAction(item, "set")}
                            disabled={working}
                            className="mt-2 w-full rounded-xl border border-cyan-300/35 bg-cyan-300/10 px-3 py-2 text-xs font-black text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/15 disabled:opacity-60"
                          >
                            Confirmar fecha y mes
                          </button>
                        </label>

                        <label className="block sm:col-span-2">
                          <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                            Nota
                          </span>
                          <input
                            type="text"
                            value={edit.note}
                            onChange={(event) =>
                              updateVipEdit(item.id, "note", event.target.value)
                            }
                            placeholder="Ej. comprobante validado"
                            className="w-full rounded-2xl border border-[#1eff7a]/25 bg-[#021509] px-4 py-3 text-white outline-none focus:border-[#1eff7a]"
                          />
                        </label>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                        <button
                          type="button"
                          onClick={() => runVipAction(item, "add")}
                          disabled={working}
                          className="rounded-xl bg-cyan-300 px-3 py-2 text-xs font-black text-black hover:brightness-110 disabled:opacity-60"
                        >
                          Activar / añadir
                        </button>

                        <button
                          type="button"
                          onClick={() => runVipAction(item, "renew")}
                          disabled={working}
                          className="rounded-xl border border-[#1eff7a]/30 bg-[#021509] px-3 py-2 text-xs font-black text-[#63ff9b] hover:border-[#63ff9b] disabled:opacity-60"
                        >
                          Renovó
                        </button>

                        <button
                          type="button"
                          onClick={() => runVipAction(item, "set")}
                          disabled={working}
                          className="rounded-xl border border-cyan-300/35 bg-cyan-300/10 px-3 py-2 text-xs font-black text-cyan-100 hover:border-cyan-200 disabled:opacity-60"
                        >
                          Poner mes exacto
                        </button>

                        <button
                          type="button"
                          onClick={() => runVipAction(item, "remove")}
                          disabled={working}
                          className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-black text-red-200 hover:bg-red-500/20 disabled:opacity-60"
                        >
                          Quitar meses
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {vipAdminMessage && (
            <div className="mt-5 rounded-2xl border border-[#1eff7a]/20 bg-[#021509] px-4 py-3 text-sm text-zinc-200">
              {vipAdminMessage}
            </div>
          )}

          <p className="mt-4 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4 text-xs leading-5 text-yellow-100">
            Regla: los meses deben ser seguidos. Si pasan más de 5 días después de vencida la membresía y no se registra renovación, se reinicia la antigüedad de premios. Los premios ya cobrados se conservan.
          </p>
        </Card>


      </div>
      )}

      {creatorSection === "premios" && (
      <div className="space-y-6">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#1eff7a]/30 bg-[#1eff7a]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#63ff9b]">
                <Trophy size={16} />
                Control de premios
              </div>

              <h3 className="text-2xl font-black">Listado de premios asignados</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                Administra los premios por usuario: agrega premios manuales, revisa qué regalo pidió cada usuario y cambia el estado a disponible, procesando, cobrado o quítalo.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-[#1eff7a]/15 bg-[#021509]/70 p-4">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#63ff9b]">
              Agregar premio manual
            </p>

            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1.4fr_180px_auto]">
              <input
                type="text"
                value={manualRewardUser}
                onChange={(event) => setManualRewardUser(event.target.value)}
                placeholder="Usuario GKG, correo o ID"
                className="rounded-2xl border border-[#1eff7a]/25 bg-[#020804] px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-[#1eff7a]"
              />

              <input
                type="text"
                value={manualRewardName}
                onChange={(event) => setManualRewardName(event.target.value)}
                placeholder="Texto libre del premio"
                className="rounded-2xl border border-[#1eff7a]/25 bg-[#020804] px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-[#1eff7a]"
              />

              <select
                value={manualRewardType}
                onChange={(event) => setManualRewardType(event.target.value)}
                className="rounded-2xl border border-[#1eff7a]/25 bg-[#020804] px-4 py-3 text-white outline-none focus:border-[#1eff7a]"
              >
                <option value="sorteo">PREMIO SORTEO</option>
                <option value="vip">PREMIO VIP</option>
              </select>

              <button
                type="button"
                onClick={addManualReward}
                disabled={working}
                className="rounded-2xl bg-[#1eff7a] px-5 py-3 font-black text-black hover:brightness-110 disabled:opacity-60"
              >
                Añadir premio
              </button>
            </div>

            {manualRewardMessage && (
              <div className="mt-3 rounded-2xl border border-[#1eff7a]/20 bg-[#020804] px-4 py-3 text-sm text-zinc-200">
                {manualRewardMessage}
              </div>
            )}
          </div>

          <input
            type="text"
            value={vipRewardSearch}
            onChange={(event) => setVipRewardSearch(event.target.value)}
            placeholder="Buscar premio, usuario GKG o estatus..."
            className="mt-5 w-full rounded-2xl border border-[#1eff7a]/25 bg-[#020804] px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-[#1eff7a]"
          />

          <div className="mt-5 max-h-[520px] space-y-3 overflow-y-auto pr-1">
            {loadingAdmin ? (
              <p className="rounded-2xl border border-[#1eff7a]/15 bg-[#020804]/70 p-4 text-sm text-zinc-400">
                Cargando premios...
              </p>
            ) : filteredVipRewards.length === 0 ? (
              <p className="rounded-2xl border border-[#1eff7a]/15 bg-[#020804]/70 p-4 text-sm text-zinc-400">
                No hay premios registrados.
              </p>
            ) : (
              filteredVipRewards.map((reward) => {
                const isSorteoReward = reward.reward_type === "sorteo";
                const rewardUserLabel = reward.ganker_user || reward.fortnite_user || reward.display_name || "Usuario GKG";

                return (
                <div
                  key={reward.id}
                  className={`grid gap-4 rounded-3xl border p-4 lg:grid-cols-[1fr_auto] lg:items-center ${
                    isSorteoReward
                      ? "border-yellow-300/25 bg-[radial-gradient(circle_at_left,rgba(250,204,21,.12),transparent_34%),#020804]/90"
                      : "border-cyan-300/20 bg-[radial-gradient(circle_at_left,rgba(34,211,238,.10),transparent_34%),#020804]/90"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-4">
                      <AvatarDisplay
                        src={reward.avatar_url || ""}
                        alt={rewardUserLabel}
                        status="offline"
                        size="sm"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-lg font-black text-white">
                          {rewardUserLabel}
                        </p>
                        <p className={`truncate text-sm font-black ${isSorteoReward ? "text-yellow-200" : "text-cyan-100"}`}>
                          {reward.reward_name}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${
                        reward.reward_type === "sorteo"
                          ? "bg-yellow-300/10 text-yellow-100"
                          : "bg-cyan-300/10 text-cyan-100"
                      }`}>
                        {reward.reward_type === "sorteo" ? "PREMIO SORTEO" : "PREMIO VIP"}
                      </span>

                      {reward.milestone_months ? (
                        <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-100">
                          Mes {reward.milestone_months}
                        </span>
                      ) : null}

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          reward.status === "claimed"
                            ? "bg-[#1eff7a]/10 text-[#63ff9b]"
                            : reward.status === "processing"
                              ? "bg-red-500/15 text-red-200"
                              : "bg-yellow-300/10 text-yellow-100"
                        }`}
                      >
                        {reward.status === "claimed" ? "Cobrado" : reward.status === "processing" ? "Usuario reclamó premio" : "Disponible"}
                      </span>

                      {reward.valid_until && (
                        <span className="rounded-full bg-zinc-700/40 px-3 py-1 text-xs font-black text-zinc-300">
                          Vigencia: {formatDateForVip(reward.valid_until)}
                        </span>
                      )}
                    </div>

                    {(reward.claim_requested_item || reward.claim_fortnite_user || reward.claim_requested_at) && (
                      <div className="mt-3 rounded-2xl border border-red-500/25 bg-red-500/10 p-3 text-xs leading-5 text-red-100">
                        <p className="font-black text-red-200">Solicitud de reclamo del usuario</p>
                        <p><strong>Objeto solicitado:</strong> {reward.claim_requested_item || "No indicado"}</p>
                        <p><strong>Usuario Fortnite:</strong> {reward.claim_fortnite_user || "No indicado"}</p>
                        {reward.claim_requested_at && (
                          <p><strong>Solicitado:</strong> {formatDateForVip(reward.claim_requested_at)}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <button
                      type="button"
                      onClick={() => updateVipRewardStatus(reward, "claimed")}
                      disabled={working}
                      className="rounded-xl border border-[#1eff7a]/30 bg-[#021509] px-3 py-2 text-xs font-black text-[#63ff9b] hover:border-[#63ff9b] disabled:opacity-60"
                    >
                      Cobrado
                    </button>

                    <button
                      type="button"
                      onClick={() => updateVipRewardStatus(reward, "available")}
                      disabled={working}
                      className="rounded-xl border border-yellow-300/35 bg-yellow-300/10 px-3 py-2 text-xs font-black text-yellow-100 hover:border-yellow-200 disabled:opacity-60"
                    >
                      Disponible
                    </button>

                    <button
                      type="button"
                      onClick={() => updateVipRewardStatus(reward, "processing")}
                      disabled={working}
                      className="rounded-xl border border-red-500/35 bg-red-500/10 px-3 py-2 text-xs font-black text-red-200 hover:border-red-300 disabled:opacity-60"
                    >
                      Procesando
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteVipReward(reward)}
                      disabled={working}
                      className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-black text-red-200 hover:bg-red-500/20 disabled:opacity-60"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
      )}

      {creatorSection === "sorteos" && (
      <>
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h3 className="text-2xl font-black">{c.campaign}</h3>

          {loadingAdmin ? (
            <p className="mt-4 text-zinc-400">Cargando...</p>
          ) : campaign ? (
            <div className="mt-5 space-y-3 text-sm text-zinc-300">
              <div className="rounded-2xl border border-[#1eff7a]/15 bg-[#04140b] p-4">
                <p className="font-black text-white">{campaign.title}</p>
                <p className="mt-1 text-[#63ff9b]">{campaign.month_label}</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <InfoMini label="Inicio" value={campaign.start_date} />
                <InfoMini label="Cierre" value={campaign.end_date} />
              </div>
            </div>
          ) : (
            <p className="mt-4 text-zinc-400">{c.noCampaign}</p>
          )}

          <div className="mt-6 space-y-3 rounded-2xl border border-[#1eff7a]/15 bg-[#04140b] p-4 text-sm text-zinc-300">
            <p>{c.everyoneRule}</p>
            <p>{c.frequentRule}</p>
            <p>{c.vipRule}</p>
            <p className="text-yellow-100">
              El sorteo automático corresponde al día 1 del mes siguiente. También puedes ejecutarlo manualmente desde este panel.
            </p>
          </div>
        </Card>

        <Card>
          <h3 className="text-2xl font-black">{c.generateTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{c.generateDesc}</p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <label className="flex-1">
              <span className="mb-2 block text-sm font-black text-zinc-200">
                {c.amount}
              </span>
              <input
                type="number"
                min="1"
                max="200"
                value={inviteCount}
                onChange={(event) => setInviteCount(event.target.value)}
                className="w-full rounded-2xl border border-[#1eff7a]/25 bg-[#021509] px-4 py-3 text-white outline-none focus:border-[#1eff7a]"
              />
            </label>

            <button
              type="button"
              onClick={generateInvites}
              disabled={working}
              className="mt-auto rounded-2xl bg-[#1eff7a] px-5 py-3 font-black text-black hover:brightness-110 disabled:opacity-60"
            >
              {working ? c.generating : c.generate}
            </button>
          </div>

          <div className="mt-6">
            <h4 className="mb-3 font-black">{c.latestLinks}</h4>

            <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
              {invites.length === 0 ? (
                <p className="text-sm text-zinc-500">Sin enlaces generados.</p>
              ) : (
                invites.map((invite) => (
                  <div
                    key={invite.id || invite.token}
                    className="rounded-2xl border border-[#1eff7a]/15 bg-[#04140b] p-3"
                  >
                    <p className="break-all text-xs text-zinc-400">
                      {getFullInviteLink(invite.token)}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-black ${
                          invite.used_at || invite.active === false
                            ? "bg-red-500/15 text-red-200"
                            : "bg-[#1eff7a]/10 text-[#63ff9b]"
                        }`}
                      >
                        {invite.used_at || invite.active === false ? "Usado / inactivo" : "Disponible"}
                      </span>

                      <button
                        type="button"
                        onClick={() => copyInvite(invite.token)}
                        className="rounded-xl border border-[#1eff7a]/30 px-3 py-2 text-xs font-black text-[#63ff9b] hover:border-[#63ff9b]"
                      >
                        {copiedToken === invite.token ? c.copied : c.copy}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteInvite(invite.token)}
                        disabled={working}
                        className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-black text-red-200 hover:bg-red-500/20 disabled:opacity-60"
                      >
                        Borrar enlace
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card>
          <h3 className="text-2xl font-black">{c.drawTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Revisa el cierre del mes anterior sin reemplazar ganadores guardados. VIP cuenta doble, frecuente requiere 2+ participaciones ponderadas y VIP solo participa en el sorteo VIP.
          </p>

          <div className="mt-5 grid gap-3">
            <button
              type="button"
              onClick={repairMonthlyClose}
              disabled={working}
              className="rounded-2xl bg-[#1eff7a] px-5 py-4 font-black text-black hover:brightness-110 disabled:opacity-60"
            >
              {working ? "Revisando cierre..." : "Recuperar cierre mensual"}
            </button>
          </div>
        </Card>

        <Card>
          <h3 className="text-2xl font-black">{c.winners}</h3>

          <div className="mt-5 space-y-3">
            {winners.length === 0 ? (
              <p className="text-sm text-zinc-500">{c.noWinners}</p>
            ) : (
              winners.map((winner) => (
                <div
                  key={winner.id || `${winner.prize_type}-${winner.fortnite_name}`}
                  className="rounded-2xl border border-[#1eff7a]/15 bg-[#04140b] p-4"
                >
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#63ff9b]">
                    {getPrizeName(winner.prize_type)}
                  </p>
                  <p className="mt-2 text-xl font-black">{winner.fortnite_name}</p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {c.entries}: {winner.entries_count || winner.participaciones || 0} · {c.records}:{" "}
                    {winner.records_count || winner.registros || 0}
                  </p>
                  {winner.prize_name && (
                    <p className="mt-2 rounded-xl bg-yellow-300/10 px-3 py-2 text-xs font-bold text-yellow-100">
                      Premio: {winner.prize_name}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-2xl font-black">{c.participants}</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Puedes agregar, borrar o importar usuarios del mes vigente.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setParticipantModalOpen(true)}
            className="rounded-2xl bg-[#1eff7a] px-5 py-3 text-sm font-black text-black hover:brightness-110"
          >
            Agregar usuario
          </button>
        </div>

        <div className="mt-5 overflow-x-auto rounded-3xl border border-[#1eff7a]/15">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#05180d] text-zinc-300">
              <tr>
                <th className="px-4 py-3 font-black">{c.user}</th>
                <th className="px-4 py-3 font-black">{c.type}</th>
                <th className="px-4 py-3 font-black">{c.records}</th>
                <th className="px-4 py-3 font-black">{c.entries}</th>
                <th className="px-4 py-3 font-black">{c.actions}</th>
              </tr>
            </thead>

            <tbody>
              {participants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">
                    Sin participantes.
                  </td>
                </tr>
              ) : (
                participants.map((row) => (
                  <tr
                    key={row.fortnite_name}
                    className="border-t border-[#1eff7a]/10 bg-[#021109]/60"
                  >
                    <td className="px-4 py-3 font-bold text-white">
                      {row.fortnite_name}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex w-24 justify-center rounded-full px-3 py-1 text-xs font-black ${
                          row.is_vip
                            ? "bg-cyan-300/15 text-cyan-100"
                            : "bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        {row.is_vip ? c.vip : c.normal}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{row.registros}</td>
                    <td className="px-4 py-3 font-black text-[#63ff9b]">
                      {row.participaciones}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => deleteParticipant(row.fortnite_name)}
                        disabled={deletingParticipant === row.fortnite_name}
                        className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-black text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
                      >
                        {deletingParticipant === row.fortnite_name
                          ? c.deletingRecord
                          : c.deleteRecord}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <Card>
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-2xl font-black">Historial de participantes</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Aquí se muestra el mes anterior. Los registros anteriores se conservan internamente en Supabase para auditoría.
            </p>
          </div>

          <span className="rounded-full border border-yellow-300/30 bg-yellow-300/10 px-4 py-2 text-sm font-black text-yellow-100">
            {previousMonthPayload?.month_label || "Mes anterior"}{" "}
            {String(previousMonthPayload?.month_key || "").slice(0, 4)}
          </span>
        </div>

        <div className="max-h-[430px] overflow-y-auto rounded-3xl border border-yellow-300/15">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 bg-[#151805] text-zinc-300">
              <tr>
                <th className="px-4 py-3 font-black">Jugador</th>
                <th className="px-4 py-3 font-black">Tipo</th>
                <th className="px-4 py-3 font-black">Registros</th>
                <th className="px-4 py-3 font-black">Participaciones</th>
              </tr>
            </thead>

            <tbody>
              {historicalParticipants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-zinc-400">
                    No hay participantes históricos para mostrar.
                  </td>
                </tr>
              ) : (
                historicalParticipants.map((row) => (
                  <tr
                    key={`creator-history-${previousMonthPayload?.month_key || "previous"}-${row.fortnite_name}`}
                    className="border-t border-yellow-300/10 bg-[#080f05]/70"
                  >
                    <td className="px-4 py-3 font-bold text-white">{row.fortnite_name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex w-24 justify-center rounded-full px-3 py-1 text-xs font-black ${
                          row.is_vip
                            ? "bg-cyan-300/15 text-cyan-100"
                            : "bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        {row.is_vip ? "VIP" : "Normal"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{row.registros}</td>
                    <td className="px-4 py-3 font-black text-yellow-200">{row.participaciones}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {participantModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[32px] border border-[#1eff7a]/25 bg-[#020804] p-6 text-white shadow-[0_0_45px_rgba(30,255,122,.18)]">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-2xl font-black italic">Agregar participante</h3>

              <button
                type="button"
                onClick={() => setParticipantModalOpen(false)}
                className="rounded-2xl border border-[#1eff7a]/30 px-4 py-2 text-sm font-black text-[#63ff9b]"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <label>
                <span className="mb-2 block text-sm font-black">Jugador</span>
                <input
                  type="text"
                  value={manualParticipant.fortnite_name}
                  onChange={(event) =>
                    setManualParticipant((current) => ({
                      ...current,
                      fortnite_name: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-[#1eff7a]/25 bg-[#021509] px-4 py-3 text-white outline-none focus:border-[#1eff7a]"
                />
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-[#1eff7a]/15 bg-[#021509] p-4">
                <input
                  type="checkbox"
                  checked={manualParticipant.is_vip}
                  onChange={(event) =>
                    setManualParticipant((current) => ({
                      ...current,
                      is_vip: event.target.checked,
                      participaciones: event.target.checked ? Math.max(2, Number(current.participaciones || 2)) : current.participaciones,
                    }))
                  }
                />
                <span className="font-black">Es VIP / cuenta doble</span>
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm font-black">Registros</span>
                  <input
                    type="number"
                    min="1"
                    value={manualParticipant.registros}
                    onChange={(event) =>
                      setManualParticipant((current) => ({
                        ...current,
                        registros: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-[#1eff7a]/25 bg-[#021509] px-4 py-3 text-white outline-none focus:border-[#1eff7a]"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-black">Participaciones</span>
                  <input
                    type="number"
                    min="1"
                    value={manualParticipant.participaciones}
                    onChange={(event) =>
                      setManualParticipant((current) => ({
                        ...current,
                        participaciones: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-[#1eff7a]/25 bg-[#021509] px-4 py-3 text-white outline-none focus:border-[#1eff7a]"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={addManualParticipant}
                disabled={working}
                className="rounded-2xl bg-[#1eff7a] px-5 py-4 font-black text-black hover:brightness-110 disabled:opacity-60"
              >
                Guardar participante
              </button>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </section>
  );
}

function InfoMini({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#1eff7a]/15 bg-black/10 p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#63ff9b]">
        {label}
      </p>
      <p className="mt-2 text-sm text-zinc-300">{value || "-"}</p>
    </div>
  );
}



function getPresenceConfig(status) {
  if (status === "away") {
    return {
      labelKey: "statusAway",
      dot: "bg-yellow-300",
      text: "text-yellow-200",
      border: "border-yellow-300",
      shadow: "shadow-[0_0_32px_rgba(253,224,71,.45)]",
      ring: "ring-yellow-300/60",
    };
  }

  if (status === "offline") {
    return {
      labelKey: "statusOffline",
      dot: "bg-red-500",
      text: "text-red-300",
      border: "border-red-500",
      shadow: "shadow-[0_0_32px_rgba(239,68,68,.45)]",
      ring: "ring-red-500/60",
    };
  }

  return {
    labelKey: "statusOnline",
    dot: "bg-[#1eff7a]",
    text: "text-[#63ff9b]",
    border: "border-[#1eff7a]",
    shadow: "shadow-[0_0_35px_rgba(30,255,122,.45)]",
    ring: "ring-[#1eff7a]/60",
  };
}

function StatusSelector({ status, t, onChange, disabled = false }) {
  const [open, setOpen] = useState(false);
  const config = getPresenceConfig(status);

  const options = [
    { value: "online", label: t.statusOnline },
    { value: "away", label: t.statusAway },
    { value: "offline", label: t.statusOffline },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((value) => !value)}
        className={`inline-flex items-center gap-2 rounded-full border border-transparent px-1 py-1 text-sm font-black transition ${config.text} ${
          disabled ? "cursor-not-allowed opacity-70" : "hover:border-[#1eff7a]/25"
        }`}
        title={t.changeStatus}
      >
        <span className={`h-2.5 w-2.5 rounded-full ${config.dot}`} />
        <span>{t[config.labelKey]}</span>
        {!disabled && <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-[#1eff7a]/20 bg-[#020804] p-2 shadow-[0_18px_40px_rgba(0,0,0,.45)]">
          {options.map((option) => {
            const optionConfig = getPresenceConfig(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-zinc-200 hover:bg-[#1eff7a]/10"
              >
                <span className={`h-2.5 w-2.5 rounded-full ${optionConfig.dot}`} />
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AvatarDisplay({
  src,
  alt,
  status = "offline",
  size = "lg",
  onClick,
  uploading = false,
}) {
  const config = getPresenceConfig(status);

  const sizes = {
    sm: {
      wrapper: "h-12 w-12",
      icon: 24,
      camera: "h-6 w-6",
      cameraIcon: 12,
    },
    md: {
      wrapper: "h-20 w-20",
      icon: 40,
      camera: "h-7 w-7",
      cameraIcon: 14,
    },
    lg: {
      wrapper: "h-36 w-36",
      icon: 72,
      camera: "h-10 w-10",
      cameraIcon: 18,
    },
  };

  const currentSize = sizes[size] || sizes.lg;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick || uploading}
      className={`group relative shrink-0 rounded-full border-4 bg-black transition duration-500 hover:scale-[1.03] disabled:cursor-default ${currentSize.wrapper} ${config.border} ${config.shadow}`}
      title={alt}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-[radial-gradient(circle_at_50%_35%,#f2f2f2_0_26%,#4b4d52_27%_100%)]">
          <div className="relative flex h-[58%] w-[58%] items-center justify-center rounded-full bg-zinc-100">
            <User className="translate-y-2 text-zinc-700" size={currentSize.icon} />
            <span className="absolute left-[32%] top-[27%] h-1.5 w-1.5 rounded-full bg-black" />
            <span className="absolute right-[32%] top-[27%] h-1.5 w-1.5 rounded-full bg-black" />
            <span className="absolute bottom-[34%] h-3 w-8 rounded-b-full border-b-4 border-black" />
          </div>
        </div>
      )}

      {onClick && (
        <span
          className={`absolute bottom-0 right-0 flex items-center justify-center rounded-full border-2 border-[#020804] bg-[#1eff7a] text-black transition group-hover:scale-110 ${currentSize.camera}`}
        >
          <Camera size={currentSize.cameraIcon} />
        </span>
      )}

      <span
        className={`absolute inset-0 rounded-full ring-2 ring-offset-2 ring-offset-[#020804] transition duration-500 ${config.ring}`}
      />

      {uploading && (
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 text-[10px] font-black uppercase tracking-widest text-[#63ff9b]">
          ...
        </span>
      )}
    </button>
  );
}


function Card({ children, className = "" }) {
  return (
    <div className={`min-w-0 max-w-full overflow-hidden rounded-[24px] border border-[#1eff7a]/18 bg-[#020804]/85 p-4 shadow-[0_0_35px_rgba(0,0,0,.45)] backdrop-blur sm:rounded-3xl sm:p-5 ${className}`}>
      {children}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-zinc-400">
        <Icon size={17} />
        <span>{label}</span>
      </div>

      <span className="text-right text-zinc-300">{value}</span>
    </div>
  );
}

function Legend({ color, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className={`h-3 w-3 rounded-full ${color}`} />
        <span className="text-zinc-400">{label}</span>
      </div>

      <span className="font-bold text-zinc-300">{value}</span>
    </div>
  );
}

function ProfileTagPills({ tags = [], className = "" }) {
  if (!tags.length) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag, index) => (
        <span
          key={tag.id || tag.tag_text}
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-black transition hover:scale-[1.02] ${getTagColorClasses(tag, index)}`}
        >
          <Tag size={12} />
          {tag.tag_text}
        </span>
      ))}
    </div>
  );
}

function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
}) {
  return (
    <label className="block">
      {label && (
        <span className="mb-2 block text-sm font-black text-zinc-200">
          {label}
          {required && <span className="text-[#1eff7a]"> *</span>}
        </span>
      )}

      <input
        type={type}
        placeholder={placeholder}
        value={value || ""}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-[#1eff7a]/25 bg-[#021509] px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-[#1eff7a]"
      />
    </label>
  );
}

function SelectInput({ label, value, onChange, options, placeholder }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-2 block text-sm font-black text-zinc-200">
          {label}
        </span>
      )}

      <select
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-[#1eff7a]/25 bg-[#021509] px-4 py-3 text-white outline-none focus:border-[#1eff7a]"
      >
        <option value="">{placeholder || "Selecciona una opción"}</option>

        {options.map((option) => (
          <option key={option} value={option} className="bg-[#021509]">
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleOption({ label, checked, onChange, description }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[#1eff7a]/15 bg-[#021509] px-4 py-4 text-left transition hover:border-[#1eff7a]/40"
    >
      <div>
        <p className="font-black text-zinc-100">{label}</p>
        {description && <p className="mt-1 text-xs text-zinc-500">{description}</p>}
      </div>

      <span
        className={`relative h-7 w-12 shrink-0 rounded-full border transition ${
          checked
            ? "border-[#1eff7a]/70 bg-[#1eff7a]/25"
            : "border-zinc-600 bg-zinc-800/70"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full transition ${
            checked ? "left-6 bg-[#1eff7a]" : "left-1 bg-zinc-400"
          }`}
        />
      </span>
    </button>
  );
}

function UserBlockRow({
  member,
  actionLabel,
  hoverLabel,
  onAction,
  danger = false,
  isBlocked = false,
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#1eff7a]/15 bg-[#020804]/65 p-3">
      <a href={getPublicProfileHref(member)} className="shrink-0">
        <AvatarDisplay
          src={member.avatar_url || ""}
          alt={getProfileDisplayName(member)}
          status={member.presence_status || "offline"}
          size="sm"
        />
      </a>

      <a href={getPublicProfileHref(member)} className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-white hover:text-[#63ff9b]">
          {getProfileDisplayName(member)}
        </p>
        <p className="truncate text-xs text-zinc-400">
          {member.ganker_user || member.fortnite_user || "GKG"}
        </p>
      </a>

      <button
        type="button"
        onClick={onAction}
        className={`group rounded-xl border px-3 py-2 text-xs font-black transition ${
          danger
            ? "border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20"
            : isBlocked
              ? "border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20"
              : "border-[#1eff7a]/35 bg-[#1eff7a]/10 text-[#63ff9b] hover:border-[#1eff7a]"
        }`}
      >
        {hoverLabel ? (
          <>
            <span className="group-hover:hidden">{actionLabel}</span>
            <span className="hidden group-hover:inline">{hoverLabel}</span>
          </>
        ) : (
          actionLabel
        )}
      </button>
    </div>
  );
}

function Notice({ icon: Icon, children }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-[#1eff7a]/15 bg-[#021509] px-4 py-3 text-xs leading-5 text-zinc-400">
      <Icon className="mt-0.5 shrink-0 text-[#1eff7a]" size={16} />
      <p>{children}</p>
    </div>
  );
}



function VIPTab({ profile, user, supabase, onGoToPremios }) {
  const isVip = Boolean(profile?.is_vip);
  const totalVipMonths = getVipTotalMonthsSinceStart(profile);
  const storedVipMonths = Number(profile?.vip_streak_months || 0);
  const vipMonths = totalVipMonths > 0 ? totalVipMonths : storedVipMonths > 0 ? storedVipMonths : getVipMonths(profile);
  const storedCycleMonths = Number(profile?.vip_cycle_months || 0);
  const vipCycleMonths =
    vipMonths > 0 ? ((vipMonths - 1) % 12) + 1 : storedCycleMonths > 0 ? storedCycleMonths : 0;
  const vipCycleNumber = getVipCycleNumberFromMonths(vipMonths);
  const vipBadgeLabel = getVipBadgeLabelFromMonths(vipMonths);
  const vipStartDate = getVipStartDate(profile);
  const vipDaysRemaining = getVipDaysRemaining(profile);
  const vipSinceYear =
    vipStartDate && !Number.isNaN(new Date(vipStartDate).getTime())
      ? new Date(vipStartDate).getFullYear()
      : null;
  const [activeVipRewards, setActiveVipRewards] = useState([]);

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [paymentUser, setPaymentUser] = useState(profile?.ganker_user || profile?.fortnite_user || "");
  const [paymentMonths, setPaymentMonths] = useState("1");
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState("");

  const selectedMonths = Math.min(12, Math.max(1, Number(paymentMonths || 1)));
  const paymentTotal = selectedMonths * 99;
  const earnedActiveVipRewards = activeVipRewards.filter((reward) =>
    isVipRewardEarned(reward, totalVipMonths, vipCycleNumber)
  );

  useEffect(() => {
    async function loadActiveVipRewards() {
      if (!user?.id) {
        setActiveVipRewards([]);
        return;
      }

      const { data, error } = await supabase
        .from("vip_rewards")
        .select("*")
        .eq("profile_id", user.id)
        .eq("reward_type", "vip")
        .in("status", ["available", "claimed"])
        .gte("valid_until", new Date().toISOString())
        .order("milestone_months", { ascending: true });

      if (!error) {
        setActiveVipRewards(data || []);
      }
    }

    loadActiveVipRewards();
  }, [user?.id, supabase, profile?.vip_streak_months, profile?.vip_started_at, profile?.vip_until]);

  const milestones = [
    {
      months: 1,
      title: "1 mes VIP",
      reward: "1 emote gratis",
      icon: Gift,
    },
    {
      months: 3,
      title: "3 meses VIP",
      reward: "1 skin sin límite de paVos",
      icon: Star,
    },
    {
      months: 6,
      title: "6 meses VIP",
      reward: "1 lote o pase de batalla hasta 2,000 paVos",
      icon: Gamepad2,
    },
    {
      months: 12,
      title: "12 meses VIP",
      reward: "1 lote hasta 3,000 paVos o 1 mes de Club Fortnite",
      icon: Crown,
    },
  ];

  const benefits = [
    "Objetos vía regalo: $8 MXN x cada 100 paVos",
    "Pase de batalla: $90 MXN",
    "Club Fortnite: $110 MXN",
    "Participación doble en todos los sorteos",
    "Sorteo de cumpleañero",
    "Insignia azul GKG VIP junto al nombre",
    "Agregar 5 intereses adicionales en la barra de intereses del jugador",
    "Vigencia de premios VIP: 1 año. Si dejas de ser VIP, la vigencia estándar es de 6 meses.",
  ];

  function handleReceiptChange(event) {
    const file = event.target.files?.[0] || null;
    setPaymentReceipt(file);
  }

  function sendVipPaymentWhatsApp() {
    setPaymentMessage("");

    if (!paymentUser.trim()) {
      setPaymentMessage("Escribe tu usuario de Ganker Games.");
      return;
    }

    if (!paymentReceipt) {
      setPaymentMessage("Sube tu comprobante de pago antes de enviar.");
      return;
    }

    if (selectedMonths < 1 || selectedMonths > 12) {
      setPaymentMessage("Solo puedes pagar de 1 a 12 meses.");
      return;
    }

    const text = [
      "💎 Solicitud de pago GKG VIP",
      "",
      `Usuario Ganker Games: ${paymentUser.trim()}`,
      `Meses a pagar: ${selectedMonths}`,
      `Total: $${paymentTotal} MXN`,
      "",
      "Ya tengo mi comprobante de pago y quiero validarlo para activar/renovar mi VIP.",
      "Nota: adjuntaré el comprobante en este chat.",
    ].join("\\n");

    window.open(`https://wa.me/${GKG_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
    setPayModalOpen(false);
  }

  return (
    <section className="mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-8">
      <div className="grid items-stretch gap-5 lg:grid-cols-[360px_1fr]">
        <Card className="overflow-hidden">
          <div className="flex h-full flex-col rounded-3xl border border-cyan-300/25 bg-[radial-gradient(circle_at_top,rgba(0,210,255,.25),transparent_38%),linear-gradient(135deg,rgba(30,255,122,.13),rgba(2,8,4,.92))] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/35 bg-cyan-300/10 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,.18)]">
                <Crown size={30} />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-200">
                  GKG VIP
                </p>
                <h2 className="text-2xl font-black text-white">
                  Membresía mensual
                </h2>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[#1eff7a]/15 bg-[#020804]/75 p-4">
              <p className="text-sm text-zinc-400">Precio mensual</p>
              <p className="mt-1 text-4xl font-black text-[#63ff9b]">
                $99 <span className="text-base text-zinc-300">MXN / mes</span>
              </p>
              <p className="mt-3 text-xs leading-5 text-zinc-400">
                La membresía dura 1 mes. Al renovarla sin interrupciones, se acumula tu antigüedad VIP para desbloquear recompensas.
              </p>

              <button
                type="button"
                onClick={() => setPayModalOpen(true)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1eff7a] px-5 py-4 font-black text-black shadow-[0_0_24px_rgba(30,255,122,.25)] transition hover:brightness-110"
              >
                <MessageCircle size={20} />
                Pagar VIP por WhatsApp
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                <p className="text-sm text-cyan-100">Estado actual</p>
                <p className="mt-1 text-2xl font-black">
                  {isVip ? `${vipBadgeLabel} activo` : "Sin VIP activo"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#1eff7a]/15 bg-[#020804]/75 p-4">
                <p className="text-sm text-zinc-400">Meses totales desde inicio</p>
                <p className="mt-1 text-3xl font-black text-white">
                  {totalVipMonths} {totalVipMonths === 1 ? "mes" : "meses"}
                </p>
                <p className="mt-2 text-xs text-cyan-200">
                  Ciclo actual: año VIP {vipCycleNumber} · mes {Math.max(0, vipCycleMonths)} de 12
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Meses registrados en sistema: {storedVipMonths}
                </p>
                <p className="mt-2 text-xs text-zinc-400">
                  Inicio: {formatDateForVip(vipStartDate)}
                </p>
                {vipDaysRemaining !== null && (
                  <p className="mt-2 text-xs font-bold text-[#63ff9b]">
                    Quedan {vipDaysRemaining} días de membresía.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="flex h-full flex-col">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#63ff9b]">
                Línea del tiempo VIP
              </p>
              <h2 className="mt-2 text-3xl font-black italic">
                Recompensas por antigüedad
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                Cada etapa se desbloquea según meses seguidos como VIP. Al pasar de 12 meses, el ciclo de premios reinicia y vuelve a empezar con el emote.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[330px]">
              <div className="flex min-h-[74px] flex-col justify-center rounded-2xl border border-cyan-300/45 bg-cyan-300/10 px-4 py-3 text-right shadow-[0_0_22px_rgba(34,211,238,.14)]">
                <p className="text-xs text-cyan-100">Insignia azul</p>
                <p className="font-black text-cyan-200">{vipBadgeLabel}</p>
              </div>

              {vipSinceYear && (
                <div className="flex min-h-[74px] flex-col justify-center rounded-2xl border border-[#1eff7a]/25 bg-[#1eff7a]/10 px-4 py-3 text-right">
                  <p className="text-xs text-[#63ff9b]">Antigüedad</p>
                  <p className="font-black text-white">VIP desde {vipSinceYear}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-4">
            {milestones.map((item, index) => {
              const Icon = item.icon;
              const displayMonth = getVipDisplayMilestoneMonth(item.months, vipCycleNumber);
              const rewardRecord = activeVipRewards.find(
                (reward) =>
                  Number(reward.milestone_months) === item.months &&
                  Number(reward.cycle_number || 1) === vipCycleNumber &&
                  isVipRewardEarned(reward, totalVipMonths, vipCycleNumber)
              );
              const unlocked = isVip && totalVipMonths >= displayMonth;
              const rewardIsValid = Boolean(rewardRecord);
              const rewardIsClaimed = rewardRecord?.status === "claimed";
              const titleMonthText = displayMonth === 1 ? "1 mes VIP" : `${displayMonth} meses VIP`;

              return (
                <button
                  type="button"
                  key={item.months}
                  onClick={() => unlocked && rewardIsValid && onGoToPremios?.()}
                  className={`relative flex h-full min-h-[250px] flex-col rounded-3xl border p-4 text-left transition ${
                    unlocked
                      ? "border-cyan-300/45 bg-cyan-300/10 shadow-[0_0_28px_rgba(34,211,238,.14)] hover:scale-[1.02]"
                      : "border-[#1eff7a]/15 bg-[#020804]/70 cursor-default"
                  }`}
                >
                  {index < milestones.length - 1 && (
                    <div className="absolute left-1/2 top-8 hidden h-1 w-full bg-gradient-to-r from-[#1eff7a]/30 to-cyan-300/50 md:block" />
                  )}

                  <div
                    className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border ${
                      unlocked
                        ? "border-cyan-300/50 bg-cyan-300/15 text-cyan-200"
                        : "border-[#1eff7a]/20 bg-[#03170c] text-[#63ff9b]"
                    }`}
                  >
                    <Icon size={28} />
                  </div>

                  <p className="mt-4 text-sm font-black uppercase tracking-[0.16em] text-zinc-400">
                    {titleMonthText}
                  </p>
                  <p className="mt-2 min-h-[72px] text-lg font-black leading-tight text-white">{item.reward}</p>

                  <span
                    className={`mt-auto inline-flex w-fit rounded-full px-3 py-1 text-xs font-black ${
                      unlocked
                        ? "bg-cyan-300/15 text-cyan-200"
                        : "bg-zinc-700/40 text-zinc-300"
                    }`}
                  >
                    {rewardIsClaimed ? "Cobrado" : unlocked && rewardIsValid ? "Disponible" : unlocked ? "Por agregar" : "Pendiente"}
                  </span>

                  {unlocked && rewardIsValid && (
                    <p className="mt-3 text-xs font-bold text-cyan-100">
                      Toca para ir a Premios
                    </p>
                  )}

                  {unlocked && !rewardIsValid && (
                    <p className="mt-3 text-xs font-bold text-yellow-100">
                      Cumple meses, falta generar premio vigente
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-8 rounded-3xl border border-[#1eff7a]/15 bg-[#020804]/70 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#63ff9b]">
                  Premios vigentes por antigüedad
                </p>
                <h3 className="mt-1 text-xl font-black text-white">
                  {earnedActiveVipRewards.length} premio{earnedActiveVipRewards.length === 1 ? "" : "s"} dentro de vigencia
                </h3>
              </div>

              <button
                type="button"
                onClick={() => onGoToPremios?.()}
                className="rounded-2xl border border-[#1eff7a]/30 bg-[#021509] px-4 py-3 text-xs font-black text-[#63ff9b] hover:border-[#63ff9b]"
              >
                Ver en Premios
              </button>
            </div>

            {earnedActiveVipRewards.length ? (
              <div className="mt-4 grid auto-rows-fr gap-3 md:grid-cols-2">
                {earnedActiveVipRewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="flex h-full min-h-[118px] flex-col rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-4"
                  >
                    <p className="font-black text-white">{reward.reward_name}</p>
                    <p className="mt-1 text-xs text-zinc-300">
                      Mes {reward.milestone_months} · Vigente hasta {formatDateForVip(reward.valid_until)}
                    </p>
                    <span className={`mt-auto inline-flex w-fit rounded-full px-3 py-1 text-xs font-black ${
                      reward.status === "claimed"
                        ? "bg-[#1eff7a]/10 text-[#63ff9b]"
                        : "bg-cyan-300/10 text-cyan-100"
                    }`}>
                      {reward.status === "claimed" ? "Cobrado" : "Disponible"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-400">
                Aún no hay premios VIP vigentes registrados. Cuando confirmes meses/fecha desde Creador, aparecerán aquí si están dentro de vigencia.
              </p>
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1eff7a]/25 bg-[#1eff7a]/10 text-[#63ff9b]">
            <Ticket size={26} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#63ff9b]">
              Beneficios activos
            </p>
            <h2 className="text-2xl font-black">Lo que incluye GKG VIP</h2>
          </div>
        </div>

        <div className="mt-5 grid auto-rows-fr gap-3 md:grid-cols-2 xl:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit}
              className="flex h-full min-h-[84px] items-center rounded-2xl border border-[#1eff7a]/15 bg-[#03170c]/80 p-4 text-sm font-bold leading-6 text-zinc-200"
            >
              <span className="mr-2 text-[#63ff9b]">✦</span>
              {benefit}
            </div>
          ))}
        </div>

        <div className="mt-5 grid auto-rows-fr gap-3 lg:grid-cols-3">
          <p className="flex h-full min-h-[86px] items-center rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4 text-xs leading-5 text-yellow-100">
            Los beneficios VIP solo aplican a 1 usuario registrado de Ganker Games.
          </p>
          <p className="flex h-full min-h-[86px] items-center rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4 text-xs leading-5 text-yellow-100">
            Los meses deben ser seguidos para reclamar premios. Si interrumpes, el conteo de premios se reinicia.
          </p>
          <p className="flex h-full min-h-[86px] items-center rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4 text-xs leading-5 text-yellow-100">
            Después de los 30 días de membresía tienes 5 días de gracia para renovar. Si no pagas, pierdes el avance pendiente y conservas solo premios ya ganados.
          </p>
        </div>
      </Card>

      {payModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-[#1eff7a]/25 bg-[#020804] p-6 shadow-[0_0_45px_rgba(30,255,122,.18)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-[#63ff9b]">
                  Pago VIP
                </p>
                <h3 className="mt-2 text-2xl font-black">Enviar comprobante</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Llena todos los campos. Solo puedes pagar hasta 12 meses por solicitud.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPayModalOpen(false)}
                className="rounded-xl border border-[#1eff7a]/25 px-3 py-2 text-sm font-black text-[#63ff9b]"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <Input
                label="Usuario Ganker Games"
                value={paymentUser}
                onChange={setPaymentUser}
                required
              />

              <label className="block">
                <span className="mb-2 block text-sm font-black text-zinc-200">
                  Meses a pagar <span className="text-[#1eff7a]">*</span>
                </span>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={paymentMonths}
                  onChange={(event) => setPaymentMonths(event.target.value)}
                  className="w-full rounded-2xl border border-[#1eff7a]/25 bg-[#021509] px-4 py-3 text-white outline-none focus:border-[#1eff7a]"
                />
              </label>

              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                <p className="text-sm text-cyan-100">Cantidad a pagar</p>
                <p className="mt-1 text-3xl font-black text-white">${paymentTotal} MXN</p>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-zinc-200">
                  Comprobante de pago <span className="text-[#1eff7a]">*</span>
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleReceiptChange}
                  className="w-full rounded-2xl border border-[#1eff7a]/25 bg-[#021509] px-4 py-3 text-white file:mr-4 file:rounded-xl file:border-0 file:bg-[#1eff7a] file:px-3 file:py-2 file:font-black file:text-black"
                />
                {paymentReceipt && (
                  <p className="mt-2 text-xs text-[#63ff9b]">
                    Archivo seleccionado: {paymentReceipt.name}
                  </p>
                )}
              </label>

              {paymentMessage && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                  {paymentMessage}
                </div>
              )}

              <button
                type="button"
                onClick={sendVipPaymentWhatsApp}
                className="rounded-2xl bg-[#1eff7a] px-5 py-4 font-black text-black hover:brightness-110"
              >
                Enviar solicitud por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}



function VIPPrizesTab({ profile, user, supabase }) {
  const [rewards, setRewards] = useState([]);
  const [loadingRewards, setLoadingRewards] = useState(true);
  const [message, setMessage] = useState("");
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [fortniteToSend, setFortniteToSend] = useState(profile?.fortnite_user || "");
  const [shopItems, setShopItems] = useState([]);
  const [shopLoading, setShopLoading] = useState(false);
  const [shopSearch, setShopSearch] = useState("");
  const [selectedShopItem, setSelectedShopItem] = useState(null);
  const [confirmingClaim, setConfirmingClaim] = useState(false);

  function normalizePrizeText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function getRewardShopRules(reward) {
    const name = normalizePrizeText(reward?.reward_name);

    if (name.includes("club")) {
      return {
        type: "club",
        textOptions: [
          {
            id: "club-fortnite",
            name: "1 mes de Club Fortnite",
            price: 110,
            image: "",
            source: "beneficio",
          },
        ],
      };
    }

    if (name.includes("pase de batalla") && !name.includes("lote")) {
      return {
        type: "battle_pass",
        textOptions: [
          {
            id: "pase-batalla",
            name: "Pase de batalla",
            price: 90,
            image: "",
            source: "beneficio",
          },
        ],
      };
    }

    if (name.includes("emote") || name.includes("gesto")) {
      return { type: "emote", textOptions: [] };
    }

    if (name.includes("skin") || name.includes("atuendo")) {
      return { type: "skin", textOptions: [] };
    }

    if (name.includes("mochila") || name.includes("backpack") || name.includes("back bling")) {
      return { type: "backpack", textOptions: [] };
    }

    if (name.includes("pico") || name.includes("pickaxe")) {
      return { type: "pickaxe", textOptions: [] };
    }

    if (name.includes("planeador") || name.includes("ala delta") || name.includes("glider")) {
      return { type: "glider", textOptions: [] };
    }

    if (name.includes("envoltorio") || name.includes("camuflaje") || name.includes("wrap")) {
      return { type: "wrap", textOptions: [] };
    }

    if (name.includes("lote") || name.includes("bundle")) {
      const limit = name.includes("3000") || name.includes("3,000") ? 3000 : 2000;
      const textOptions = [];

      if (name.includes("pase de batalla")) {
        textOptions.push({
          id: "pase-batalla",
          name: "Pase de batalla",
          price: 90,
          image: "",
          source: "beneficio",
        });
      }

      if (name.includes("club")) {
        textOptions.push({
          id: "club-fortnite",
          name: "1 mes de Club Fortnite",
          price: 110,
          image: "",
          source: "beneficio",
        });
      }

      return { type: "bundle", priceLimit: limit, textOptions };
    }

    return { type: "any", textOptions: [] };
  }

  function itemMatchesReward(item, rules) {
    const haystack = normalizePrizeText(
      [
        item.name,
        item.type,
        item.typeDisplay,
        item.category,
        item.categories?.join(" "),
        item.source,
      ].filter(Boolean).join(" ")
    );

    const price = Number(item.price || 0);

    if (rules.type === "any") return true;
    if (rules.type === "club" || rules.type === "battle_pass") return false;

    if (rules.type === "bundle") {
      const isBundle =
        item.isBundle ||
        haystack.includes("bundle") ||
        haystack.includes("lote") ||
        haystack.includes("paquete");

      return isBundle && (!rules.priceLimit || price <= rules.priceLimit);
    }

    if (rules.type === "skin") {
      return haystack.includes("outfit") || haystack.includes("atuendo") || haystack.includes("skin");
    }

    if (rules.type === "emote") {
      return haystack.includes("emote") || haystack.includes("gesto") || haystack.includes("baile");
    }

    if (rules.type === "backpack") {
      return haystack.includes("backpack") || haystack.includes("back bling") || haystack.includes("mochila");
    }

    if (rules.type === "pickaxe") {
      return haystack.includes("pickaxe") || haystack.includes("pico") || haystack.includes("herramienta");
    }

    if (rules.type === "glider") {
      return haystack.includes("glider") || haystack.includes("planeador") || haystack.includes("ala delta");
    }

    if (rules.type === "wrap") {
      return haystack.includes("wrap") || haystack.includes("envoltorio") || haystack.includes("camuflaje");
    }

    return true;
  }

  async function loadRewards() {
    if (!user?.id) {
      setLoadingRewards(false);
      return;
    }

    setLoadingRewards(true);

    try {
      const { data, error } = await supabase
        .from("vip_rewards")
        .select("*")
        .eq("profile_id", user.id)
        .gte("valid_until", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRewards(data || []);
    } catch (error) {
      setMessage(error.message || "No se pudieron cargar tus premios.");
    } finally {
      setLoadingRewards(false);
    }
  }

  useEffect(() => {
    loadRewards();
  }, [user?.id]);

  async function loadShopItems(reward) {
    setShopLoading(true);
    setShopItems([]);

    const rules = getRewardShopRules(reward);

    try {
      const response = await fetch("/api/fortnite-shop", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();
      const apiItems = Array.isArray(result.items) ? result.items : [];

      const filteredApiItems = apiItems
        .filter((item) => itemMatchesReward(item, rules))
        .sort((a, b) => {
          const priceA = Number(a.price || 0);
          const priceB = Number(b.price || 0);

          if (priceA !== priceB) return priceA - priceB;

          return String(a.name || "").localeCompare(String(b.name || ""));
        })
        .slice(0, 120);

      const merged = [
        ...(rules.textOptions || []),
        ...filteredApiItems,
      ];

      setShopItems(merged);
    } catch (error) {
      setShopItems(rules.textOptions || []);
      setMessage(
        rules.textOptions?.length
          ? "La tienda no cargó, pero puedes seleccionar el beneficio directo."
          : "No se pudo cargar la Tienda Fortnite actual. Inténtalo de nuevo."
      );
    } finally {
      setShopLoading(false);
    }
  }

  function openClaimModal(reward) {
    setSelectedReward(reward);
    setSelectedShopItem(null);
    setShopSearch("");
    setFortniteToSend(profile?.fortnite_user || profile?.ganker_user || "");
    setClaimModalOpen(true);
    loadShopItems(reward);
  }

  async function confirmClaimReward() {
    if (!selectedReward) return;

    if (!fortniteToSend.trim()) {
      setMessage("Escribe el usuario de Fortnite a enviar.");
      return;
    }

    if (!selectedShopItem) {
      setMessage("Selecciona el objeto o beneficio que quieres reclamar.");
      return;
    }

    const confirmed =
      typeof window === "undefined"
        ? true
        : window.confirm("¿Seguro que quieres reclamar este premio? Se enviará la solicitud a Ganker Games y quedará como procesando regalo.");

    if (!confirmed) return;

    setConfirmingClaim(true);
    setMessage("");

    try {
      const itemText = `${selectedShopItem.name} · ${selectedShopItem.price || 0} paVos`;

      const { error } = await supabase.rpc("request_reward_claim", {
        reward_id_input: selectedReward.id,
        fortnite_user_input: fortniteToSend.trim(),
        requested_item_input: itemText,
      });

      if (error) throw error;

      const text = [
        "🎁 Solicitud de reclamo de premio GKG",
        "",
        `Usuario Ganker Games: ${profile?.ganker_user || user?.email || "GKG"}`,
        `Usuario Fortnite a enviar: ${fortniteToSend.trim()}`,
        `Premio: ${selectedReward.reward_name}`,
        `Tipo: ${selectedReward.reward_type === "sorteo" ? "PREMIO SORTEO" : "PREMIO VIP"}`,
        `Objeto elegido: ${itemText}`,
        `Vigencia: ${formatDateForVip(selectedReward.valid_until)}`,
        "",
        "Confirmo que quiero reclamar este premio.",
      ].join("\\n");

      if (typeof window !== "undefined") {
        window.open(`https://wa.me/${GKG_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
      }

      setRewards((current) =>
        current.map((reward) =>
          reward.id === selectedReward.id
            ? {
                ...reward,
                status: "processing",
                claim_fortnite_user: fortniteToSend.trim(),
                claim_requested_item: itemText,
                claim_requested_at: new Date().toISOString(),
              }
            : reward
        )
      );

      await loadRewards();

      setClaimModalOpen(false);
      setSelectedReward(null);
      setSelectedShopItem(null);
      setMessage("Premio enviado a revisión. Estado: procesando regalo.");
    } catch (error) {
      setMessage(error.message || "No se pudo reclamar el premio.");
    } finally {
      setConfirmingClaim(false);
    }
  }

  const filteredShopItems = shopItems.filter((item) =>
    item.name.toLowerCase().includes(shopSearch.trim().toLowerCase())
  );

  return (
    <section className="mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-8">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#63ff9b]">
              Premios GKG
            </p>
            <h2 className="mt-2 text-3xl font-black italic">
              Recompensas y premios disponibles
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
              Aquí aparecen tus premios VIP y premios de sorteo. Los premios VIP tienen vigencia de 1 año; los premios no VIP tienen vigencia de 6 meses.
            </p>
          </div>

          <button
            type="button"
            onClick={loadRewards}
            className="rounded-2xl border border-[#1eff7a]/30 bg-[#021509] px-5 py-3 text-sm font-black text-[#63ff9b] hover:border-[#63ff9b]"
          >
            Actualizar
          </button>
        </div>

        {message && (
          <div className="mt-5 rounded-2xl border border-[#1eff7a]/20 bg-[#021509] p-3 text-sm text-zinc-200">
            {message}
          </div>
        )}

        {loadingRewards ? (
          <p className="mt-6 text-zinc-400">Cargando premios...</p>
        ) : rewards.length ? (
          <div className="mt-6 grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rewards.map((reward) => {
              const status = reward.status || "available";
              const isClaimed = status === "claimed";
              const isProcessing = status === "processing";
              const isSorteoReward = reward.reward_type === "sorteo";
              const typeLabel = isSorteoReward ? "PREMIO SORTEO" : "PREMIO VIP";

              return (
                <div
                  key={reward.id}
                  className={`flex h-full min-h-[300px] flex-col items-center rounded-3xl border p-5 text-center ${
                    isSorteoReward
                      ? "border-yellow-300/30 bg-[radial-gradient(circle_at_top,rgba(250,204,21,.15),transparent_38%),#03170c]"
                      : "border-cyan-300/20 bg-[radial-gradient(circle_at_top,rgba(34,211,238,.14),transparent_35%),#03170c]"
                  }`}
                >
                  <div className="min-h-[142px] w-full">
                    <p className={`text-xs font-black uppercase tracking-[0.18em] ${
                      reward.reward_type === "sorteo" ? "text-yellow-300" : "text-cyan-200"
                    }`}>
                      {typeLabel} {reward.milestone_months ? `· ${reward.milestone_months} mes${reward.milestone_months === 1 ? "" : "es"}` : ""}
                    </p>

                    <h3 className="mt-3 min-h-[58px] text-xl font-black leading-tight text-white">
                      {reward.reward_name}
                    </h3>

                    <p className="mt-2 text-sm text-zinc-400">
                      Vigencia: {formatDateForVip(reward.valid_until)}
                    </p>
                  </div>

                  <div className="mt-4 flex w-full flex-wrap items-center justify-center gap-2">
                    <span
                      className={`inline-flex w-36 justify-center rounded-full px-3 py-1 text-xs font-black ${
                        isClaimed
                          ? "bg-[#1eff7a]/10 text-[#63ff9b]"
                          : isProcessing
                            ? "bg-red-500/15 text-red-200"
                            : isSorteoReward
                              ? "bg-yellow-300/10 text-yellow-100"
                              : "bg-cyan-300/10 text-cyan-200"
                      }`}
                    >
                      {isClaimed ? "Cobrado" : isProcessing ? "Procesando regalo" : "Disponible"}
                    </span>
                  </div>

                  {isProcessing && (
                    <div className="mt-4 w-full rounded-2xl border border-red-500/25 bg-red-500/10 p-3 text-center text-xs leading-5 text-red-100">
                      <p><strong>Solicitado:</strong> {reward.claim_requested_item || "Objeto pendiente"}</p>
                      <p><strong>Usuario Fortnite:</strong> {reward.claim_fortnite_user || "No indicado"}</p>
                    </div>
                  )}

                  {isClaimed || isProcessing ? (
                    <div className={`mt-auto w-full rounded-2xl border px-4 py-3 text-center font-black ${
                      isClaimed
                        ? "border-[#1eff7a]/20 bg-[#1eff7a]/10 text-[#63ff9b]"
                        : "border-red-500/30 bg-red-500/10 text-red-200"
                    }`}>
                      {isClaimed ? "Premio cobrado" : "Procesando regalo"}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openClaimModal(reward)}
                      className={`mt-auto w-full rounded-2xl px-4 py-3 font-black text-black transition hover:brightness-110 ${
                        isSorteoReward ? "bg-yellow-300" : "bg-[#1eff7a]"
                      }`}
                    >
                      Reclamar premio
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-[#1eff7a]/15 bg-[#021509] p-6 text-center">
            <Trophy className="mx-auto text-[#63ff9b]" size={38} />
            <p className="mt-3 font-black">Aún no tienes premios desbloqueados.</p>
            <p className="mt-2 text-sm text-zinc-400">
              Cuando ganes sorteos o cumplas meses VIP, aparecerán aquí.
            </p>
          </div>
        )}
      </Card>

      {claimModalOpen && selectedReward && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px] border border-[#1eff7a]/25 bg-[#020804] p-6 text-white shadow-[0_0_45px_rgba(30,255,122,.18)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#63ff9b]">
                  Reclamar premio
                </p>
                <h3 className="mt-2 text-2xl font-black">{selectedReward.reward_name}</h3>
              </div>

              <button
                type="button"
                onClick={() => setClaimModalOpen(false)}
                className="rounded-2xl border border-[#1eff7a]/30 px-4 py-2 text-sm font-black text-[#63ff9b]"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <label>
                <span className="mb-2 block text-sm font-black">
                  Usuario de Fortnite a enviar
                </span>
                <input
                  type="text"
                  value={fortniteToSend}
                  onChange={(event) => setFortniteToSend(event.target.value)}
                  className="w-full rounded-2xl border border-[#1eff7a]/25 bg-[#021509] px-4 py-3 text-white outline-none focus:border-[#1eff7a]"
                />
              </label>

              <div>
                <span className="mb-2 block text-sm font-black">
                  Selecciona objeto de la Tienda Fortnite actual
                </span>
                <input
                  type="text"
                  value={shopSearch}
                  onChange={(event) => setShopSearch(event.target.value)}
                  placeholder="Buscar objeto..."
                  className="w-full rounded-2xl border border-[#1eff7a]/25 bg-[#021509] px-4 py-3 text-white outline-none focus:border-[#1eff7a]"
                />

                <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
                  {shopLoading ? (
                    <p className="rounded-2xl border border-[#1eff7a]/15 bg-[#021509] p-4 text-sm text-zinc-400">
                      Cargando tienda actual...
                    </p>
                  ) : filteredShopItems.length ? (
                    filteredShopItems.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setSelectedShopItem(item)}
                        className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                          selectedShopItem?.id === item.id
                            ? "border-[#1eff7a] bg-[#1eff7a]/10"
                            : "border-[#1eff7a]/15 bg-[#021509] hover:border-[#63ff9b]"
                        }`}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-14 w-14 rounded-xl object-contain"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1eff7a]/10 text-[#63ff9b]">
                            <Gift size={24} />
                          </div>
                        )}

                        <div>
                          <p className="font-black text-white">{item.name}</p>
                          <p className="text-xs text-zinc-400">
                            {item.price || 0} paVos {item.typeDisplay ? `· ${item.typeDisplay}` : ""}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="rounded-2xl border border-[#1eff7a]/15 bg-[#021509] p-4 text-sm text-zinc-400">
                      No se encontraron objetos para este tipo de premio en la tienda actual.
                    </p>
                  )}
                </div>
              </div>

              {selectedShopItem && (
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm">
                  Objeto seleccionado: <strong>{selectedShopItem.name}</strong> · {selectedShopItem.price || 0} paVos
                </div>
              )}

              <button
                type="button"
                onClick={confirmClaimReward}
                disabled={confirmingClaim}
                className="rounded-2xl bg-[#1eff7a] px-5 py-4 font-black text-black transition hover:brightness-110 disabled:opacity-60"
              >
                {confirmingClaim ? "Enviando..." : "Confirmar reclamo por WhatsApp"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


function SimpleTab({ title, icon: Icon, children }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <Card>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1eff7a]/10 text-[#1eff7a]">
            <Icon size={26} />
          </div>

          <h2 className="text-2xl font-black">{title}</h2>
        </div>

        <p className="text-zinc-400">{children}</p>
      </Card>
    </section>
  );
}


const GKG_TWINKLE_STARS = [
  { left: "8%", top: "10%", size: 3, delay: "0s", duration: "2.6s", opacity: 0.95 },
  { left: "19%", top: "30%", size: 2, delay: ".5s", duration: "2.1s", opacity: 0.82 },
  { left: "33%", top: "14%", size: 4, delay: ".8s", duration: "3s", opacity: 0.88 },
  { left: "47%", top: "8%", size: 2, delay: "1.3s", duration: "2.4s", opacity: 0.78 },
  { left: "63%", top: "18%", size: 3, delay: ".2s", duration: "2.8s", opacity: 0.92 },
  { left: "79%", top: "9%", size: 2, delay: "1.1s", duration: "2.2s", opacity: 0.72 },
  { left: "89%", top: "28%", size: 4, delay: ".9s", duration: "3.2s", opacity: 0.94 },
  { left: "12%", top: "45%", size: 2, delay: "1.8s", duration: "2.5s", opacity: 0.76 },
  { left: "26%", top: "57%", size: 3, delay: ".4s", duration: "2.9s", opacity: 0.9 },
  { left: "40%", top: "39%", size: 2, delay: "1.2s", duration: "2s", opacity: 0.7 },
  { left: "55%", top: "50%", size: 4, delay: "0s", duration: "3.1s", opacity: 0.96 },
  { left: "68%", top: "42%", size: 2, delay: "1.6s", duration: "2.4s", opacity: 0.8 },
  { left: "82%", top: "54%", size: 3, delay: ".7s", duration: "2.7s", opacity: 0.88 },
  { left: "92%", top: "63%", size: 2, delay: "1.5s", duration: "2.2s", opacity: 0.68 },
  { left: "10%", top: "73%", size: 4, delay: "1.1s", duration: "3s", opacity: 0.92 },
  { left: "23%", top: "86%", size: 2, delay: ".6s", duration: "2.4s", opacity: 0.76 },
  { left: "37%", top: "78%", size: 3, delay: "1.7s", duration: "2.8s", opacity: 0.84 },
  { left: "58%", top: "89%", size: 2, delay: ".3s", duration: "2.1s", opacity: 0.7 },
  { left: "76%", top: "81%", size: 4, delay: "1.4s", duration: "3.3s", opacity: 0.95 },
  { left: "90%", top: "92%", size: 2, delay: ".9s", duration: "2.3s", opacity: 0.74 },
];

function GkgTwinkleBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(30,255,122,0.16),transparent_0,transparent_22%),radial-gradient(circle_at_78%_16%,rgba(30,255,122,0.14),transparent_0,transparent_18%),radial-gradient(circle_at_68%_58%,rgba(99,255,155,0.12),transparent_0,transparent_20%),radial-gradient(circle_at_12%_88%,rgba(30,255,122,0.12),transparent_0,transparent_18%)]" />
      <div
        className="absolute left-[8%] top-[16%] h-40 w-40 rounded-full bg-[#1eff7a]/8 blur-3xl"
        style={{ animation: "gkgFloatGlow 7s ease-in-out infinite" }}
      />
      <div
        className="absolute right-[12%] top-[34%] h-48 w-48 rounded-full bg-[#63ff9b]/8 blur-3xl"
        style={{ animation: "gkgFloatGlow 8.5s ease-in-out infinite", animationDelay: "1.4s" }}
      />
      <div
        className="absolute bottom-[8%] left-[24%] h-52 w-52 rounded-full bg-[#1eff7a]/6 blur-3xl"
        style={{ animation: "gkgFloatGlow 9.2s ease-in-out infinite", animationDelay: ".7s" }}
      />
      {GKG_TWINKLE_STARS.map((star, index) => (
        <span
          key={`${star.left}-${star.top}-${index}`}
          className="absolute rounded-full bg-[#95ffd0] shadow-[0_0_10px_rgba(149,255,208,0.9)]"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animation: `gkgTwinkle ${star.duration} ease-in-out infinite`,
            animationDelay: star.delay,
          }}
        />
      ))}
    </div>
  );
}
