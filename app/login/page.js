"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const BAD_WORDS = [
  "puta",
  "puto",
  "pendejo",
  "pendeja",
  "verga",
  "mierda",
  "ching",
  "culero",
  "culera",
  "fuck",
  "shit",
  "bitch",
];

const COUNTRY_CODES = [
  "AF", "AL", "DE", "AD", "AO", "AI", "AG", "SA", "DZ", "AR", "AM", "AW",
  "AU", "AT", "AZ", "BS", "BD", "BB", "BH", "BE", "BZ", "BJ", "BM", "BY",
  "BO", "BA", "BW", "BR", "BN", "BG", "BF", "BI", "BT", "CV", "KH", "CM",
  "CA", "TD", "CL", "CN", "CY", "CO", "KM", "CG", "CD", "KP", "KR", "CI",
  "CR", "HR", "CU", "CW", "DK", "DM", "EC", "EG", "SV", "AE", "ER", "SK",
  "SI", "ES", "US", "EE", "ET", "PH", "FI", "FJ", "FR", "GA", "GM", "GE",
  "GH", "GI", "GD", "GR", "GL", "GP", "GU", "GT", "GF", "GG", "GN", "GQ",
  "GW", "GY", "HT", "HN", "HK", "HU", "IN", "ID", "IQ", "IR", "IE", "IM",
  "IS", "KY", "FO", "FK", "MP", "MH", "SB", "TC", "VG", "VI", "IL", "IT",
  "JM", "JP", "JE", "JO", "KZ", "KE", "KG", "KI", "KW", "LA", "LS", "LV",
  "LB", "LR", "LY", "LI", "LT", "LU", "MO", "MK", "MG", "MY", "MW", "MV",
  "ML", "MT", "MA", "MQ", "MU", "MR", "YT", "MX", "FM", "MD", "MC", "MN",
  "ME", "MS", "MZ", "MM", "NA", "NR", "NP", "NI", "NE", "NG", "NU", "NO",
  "NC", "NZ", "OM", "NL", "PK", "PW", "PS", "PA", "PG", "PY", "PE", "PF",
  "PL", "PT", "PR", "QA", "GB", "CF", "CZ", "DO", "RE", "RW", "RO", "RU",
  "WS", "AS", "BL", "KN", "SM", "MF", "PM", "VC", "SH", "LC", "ST", "SN",
  "RS", "SC", "SL", "SG", "SX", "SY", "SO", "LK", "SZ", "ZA", "SD", "SS",
  "SE", "CH", "SR", "TH", "TW", "TZ", "TJ", "TL", "TG", "TK", "TO", "TT",
  "TN", "TM", "TR", "TV", "UA", "UG", "UY", "UZ", "VU", "VA", "VE", "VN",
  "WF", "YE", "DJ", "ZM", "ZW",
];

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function hasBadWords(value) {
  const clean = normalizeText(value);
  return BAD_WORDS.some((word) => clean.includes(word));
}

function calculateAge(dateString) {
  if (!dateString) return null;

  const today = new Date();
  const birthDate = new Date(dateString);

  if (Number.isNaN(birthDate.getTime())) return null;

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

function validatePassword(password, firstNames, paternalLastName, gankerUser) {
  if (password.length < 8) {
    return "La contraseña debe tener mínimo 8 caracteres.";
  }

  if (!/[A-Z]/.test(password)) {
    return "La contraseña debe tener al menos una letra mayúscula.";
  }

  if (!/[a-z]/.test(password)) {
    return "La contraseña debe tener al menos una letra minúscula.";
  }

  if (!/[0-9]/.test(password)) {
    return "La contraseña debe tener al menos un número.";
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return "La contraseña debe tener al menos un signo o símbolo.";
  }

  const cleanPassword = normalizeText(password);
  const cleanFirstNames = normalizeText(firstNames);
  const cleanPaternalLastName = normalizeText(paternalLastName);
  const cleanGankerUser = normalizeText(gankerUser);

  if (cleanFirstNames.length >= 3 && cleanPassword.includes(cleanFirstNames)) {
    return "La contraseña no debe incluir tu nombre.";
  }

  if (
    cleanPaternalLastName.length >= 3 &&
    cleanPassword.includes(cleanPaternalLastName)
  ) {
    return "La contraseña no debe incluir tu apellido.";
  }

  if (cleanGankerUser.length >= 3 && cleanPassword.includes(cleanGankerUser)) {
    return "La contraseña no debe incluir tu usuario de Ganker Games.";
  }

  return "";
}

function getPasswordStrength(password, firstNames, paternalLastName, gankerUser) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  ];

  let score = checks.filter(Boolean).length;

  const cleanPassword = normalizeText(password);
  const cleanFirstNames = normalizeText(firstNames);
  const cleanPaternalLastName = normalizeText(paternalLastName);
  const cleanGankerUser = normalizeText(gankerUser);

  if (
    (cleanFirstNames.length >= 3 && cleanPassword.includes(cleanFirstNames)) ||
    (cleanPaternalLastName.length >= 3 &&
      cleanPassword.includes(cleanPaternalLastName)) ||
    (cleanGankerUser.length >= 3 && cleanPassword.includes(cleanGankerUser))
  ) {
    score = Math.max(1, score - 2);
  }

  if (!password) {
    return {
      score: 0,
      label: "Sin contraseña",
      bar: "bg-slate-600",
      text: "text-slate-400",
    };
  }

  if (score <= 2) {
    return {
      score,
      label: "Débil",
      bar: "bg-red-500",
      text: "text-red-300",
    };
  }

  if (score <= 4) {
    return {
      score,
      label: "Media",
      bar: "bg-yellow-400",
      text: "text-yellow-200",
    };
  }

  return {
    score,
    label: "Segura",
    bar: "bg-[#15d863]",
    text: "text-[#67ff9a]",
  };
}

function createHumanChallenge() {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 2;

  return {
    a,
    b,
    answer: String(a + b),
  };
}


async function promiseWithTimeout(promise, timeoutMs, errorMessage) {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    window.clearTimeout(timeoutId);
  }
}


function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const standaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    setIsInstalled(standaloneMode);
    setIsIos(/iphone|ipad|ipod/i.test(window.navigator.userAgent));

    async function registerServiceWorker() {
      if (!("serviceWorker" in navigator)) return;

      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch (error) {
        console.warn("No se pudo registrar el service worker:", error);
      }
    }

    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setInstallPrompt(event);
    }

    function handleAppInstalled() {
      setInstallPrompt(null);
      setShowInstructions(false);
      setIsInstalled(true);
    }

    registerServiceWorker();

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstallClick() {
    if (!installPrompt) {
      setShowInstructions((current) => !current);
      return;
    }

    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  if (isInstalled) {
    return (
      <div className="mt-4 rounded-2xl border border-[#1eff7a]/25 bg-[#07140f] px-4 py-3 text-center text-sm font-black text-[#67ff9a]">
        ✅ App de Ganker Games instalada
      </div>
    );
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleInstallClick}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#1eff7a]/45 bg-[#1eff7a]/10 px-4 py-3 font-black text-[#67ff9a] transition hover:border-[#67ff9a] hover:bg-[#1eff7a]/15 hover:text-white"
      >
        <span aria-hidden="true">📲</span>
        {isIos ? "Cómo instalar la app en iPhone" : "Instalar app de Ganker Games"}
      </button>

      {showInstructions && (
        <div className="mt-3 rounded-2xl border border-[#1eff7a]/25 bg-[#07140f] p-4 text-xs leading-5 text-slate-300">
          {isIos ? (
            <p>
              Abre esta página en Safari, presiona el botón de compartir y elige
              <strong className="text-white"> “Agregar a pantalla de inicio”</strong>.
            </p>
          ) : (
            <p>
              En Chrome, abre el menú de los tres puntos y selecciona
              <strong className="text-white"> “Instalar app”</strong> o
              <strong className="text-white"> “Agregar a pantalla principal”</strong>.
              Si la opción todavía no aparece, actualiza la página después del despliegue.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [mode, setMode] = useState("login");

  const [firstNames, setFirstNames] = useState("");
  const [paternalLastName, setPaternalLastName] = useState("");
  const [maternalLastName, setMaternalLastName] = useState("");
  const [gankerUser, setGankerUser] = useState("");

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const [birthDate, setBirthDate] = useState("");
  const [nationality, setNationality] = useState("México");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [humanChallenge, setHumanChallenge] = useState(() =>
    createHumanChallenge()
  );
  const [humanAnswer, setHumanAnswer] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(false);

  const [restoreCandidate, setRestoreCandidate] = useState(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);

  const passwordStrength = useMemo(
    () => getPasswordStrength(password, firstNames, paternalLastName, gankerUser),
    [password, firstNames, paternalLastName, gankerUser]
  );

  const nationalities = useMemo(() => {
    try {
      const displayNames = new Intl.DisplayNames(["es"], { type: "region" });

      return COUNTRY_CODES
        .map((code) => displayNames.of(code))
        .filter(Boolean)
        .filter((country, index, array) => array.indexOf(country) === index)
        .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
    } catch {
      return [
        "México",
        "Estados Unidos",
        "Colombia",
        "Argentina",
        "Chile",
        "Perú",
        "España",
        "Guatemala",
        "El Salvador",
        "Honduras",
        "Venezuela",
        "Otro",
      ];
    }
  }, []);

  const fullDisplayName = [
    firstNames.trim(),
    paternalLastName.trim(),
    maternalLastName.trim(),
  ]
    .filter(Boolean)
    .join(" ");

  function showMessage(text, type = "info") {
    setMessage(text);
    setMessageType(type);
  }

  function openProfilePage() {
    if (typeof window !== "undefined") {
      window.location.replace("/perfil");
      return;
    }

    router.replace("/perfil");
    router.refresh();
  }

  function handleAvatarChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showMessage("El archivo debe ser una imagen.", "error");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showMessage("La imagen no debe pesar más de 2 MB.", "error");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setMessage("");
  }

  async function uploadAvatar(userId) {
    if (!avatarFile) return "";

    const extension = avatarFile.name.split(".").pop() || "jpg";
    const safeName = `${Date.now()}.${extension}`;
    const path = `${userId}/${safeName}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      throw new Error("No se pudo subir la foto de perfil.");
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);

    return data.publicUrl;
  }

  async function signInAndOpenProfile(loginEmail, shouldRestoreProfile = false) {
    const { data, error } = await promiseWithTimeout(
      supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      }),
      12000,
      "El inicio de sesión tardó demasiado. Revisa tu conexión e intenta nuevamente."
    );

    if (error) throw error;

    if (shouldRestoreProfile && data.user) {
      const { error: restoreError } = await supabase
        .from("profiles")
        .update({
          deleted_at: null,
          restore_until: null,
          presence_status: "online",
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.user.id);

      if (restoreError) {
        throw new Error("Se inició sesión, pero no se pudo restaurar el perfil.");
      }

      await supabase.auth.updateUser({
        data: {
          profile_restored_at: new Date().toISOString(),
        },
      });
    }

    openProfilePage();
  }

  async function resolveLoginEmail(loginInput) {
    let loginEmail = loginInput.trim().toLowerCase();

    if (!loginEmail) {
      throw new Error("Escribe tu correo o usuario de Ganker Games.");
    }

    if (!loginEmail.includes("@")) {
      const { data: foundEmail, error: usernameError } = await promiseWithTimeout(
        supabase.rpc("get_email_by_ganker_user", {
          username_input: loginEmail,
        }),
        8000,
        "La búsqueda del usuario tardó demasiado. Intenta nuevamente."
      );

      if (usernameError) {
        throw new Error("No se pudo validar el usuario de Ganker Games.");
      }

      if (!foundEmail) {
        throw new Error("No encontramos ese correo o usuario de Ganker Games.");
      }

      loginEmail = foundEmail;
    }

    return loginEmail;
  }

  async function checkDeletedProfile(loginInput) {
    try {
      const { data, error } = await promiseWithTimeout(
        supabase.rpc("get_deleted_profile_by_login", {
          login_input: loginInput.trim().toLowerCase(),
        }),
        6000,
        "La revisión del perfil tardó demasiado."
      );

      if (error) {
        console.warn("No se pudo revisar si el perfil está en restauración:", error);
        return null;
      }

      const deletedProfile = Array.isArray(data) ? data[0] : data;

      if (!deletedProfile?.deleted_at) {
        return null;
      }

      return deletedProfile;
    } catch (error) {
      console.warn("La revisión del perfil excedió el tiempo permitido:", error);
      return null;
    }
  }

  async function handleRestoreLogin() {
    if (!restoreCandidate?.loginEmail) return;

    setRestoreLoading(true);
    setMessage("");

    try {
      await signInAndOpenProfile(restoreCandidate.loginEmail, true);
    } catch (error) {
      showMessage(error.message || "No se pudo restaurar el perfil.", "error");
      setRestoreCandidate(null);
    } finally {
      setRestoreLoading(false);
    }
  }

  async function validateRegisterData() {
    const cleanFirstNames = firstNames.trim();
    const cleanPaternalLastName = paternalLastName.trim();
    const cleanMaternalLastName = maternalLastName.trim();
    const cleanGankerUser = gankerUser.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanFirstNames) {
      return "El nombre o nombres son obligatorios.";
    }

    if (cleanFirstNames.length < 2) {
      return "El nombre debe tener al menos 2 caracteres.";
    }

    if (hasBadWords(cleanFirstNames)) {
      return "El nombre contiene palabras no permitidas.";
    }

    if (!cleanPaternalLastName) {
      return "El primer apellido es obligatorio.";
    }

    if (hasBadWords(cleanPaternalLastName)) {
      return "El primer apellido contiene palabras no permitidas.";
    }

    if (cleanMaternalLastName && hasBadWords(cleanMaternalLastName)) {
      return "El segundo apellido contiene palabras no permitidas.";
    }

    if (!cleanGankerUser) {
      return "El usuario de Ganker Games es obligatorio.";
    }

    if (cleanGankerUser.length < 3) {
      return "El usuario de Ganker Games debe tener al menos 3 caracteres.";
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(cleanGankerUser)) {
      return "El usuario de Ganker Games solo puede tener letras, números, punto, guion o guion bajo.";
    }

    if (hasBadWords(cleanGankerUser)) {
      return "El usuario de Ganker Games contiene palabras no permitidas.";
    }

    if (!cleanEmail) {
      return "El correo electrónico es obligatorio.";
    }

    if (!cleanEmail.includes("@")) {
      return "Escribe un correo electrónico válido.";
    }

    const { data: emailAvailable, error: emailError } = await supabase.rpc(
      "is_email_available",
      {
        email_input: cleanEmail,
      }
    );

    if (emailError) {
      return "No se pudo validar si el correo ya fue utilizado.";
    }

    if (!emailAvailable) {
      return "Ese correo ya fue utilizado por otro usuario.";
    }

    if (!birthDate) {
      return "La fecha de nacimiento es obligatoria.";
    }

    const age = calculateAge(birthDate);

    if (age === null || age < 0) {
      return "La fecha de nacimiento no es válida.";
    }

    if (!nationality) {
      return "La nacionalidad es obligatoria.";
    }

    const passwordError = validatePassword(
      password,
      cleanFirstNames,
      cleanPaternalLastName,
      cleanGankerUser
    );

    if (passwordError) {
      return passwordError;
    }

    if (humanAnswer.trim() !== humanChallenge.answer) {
      setHumanChallenge(createHumanChallenge());
      setHumanAnswer("");
      return "No se pudo verificar que eres humano. Intenta de nuevo.";
    }

    if (!legalAccepted) {
      return "Debes aceptar los Términos de uso y confirmar que consultaste el Aviso de privacidad.";
    }

    const { data: available, error } = await supabase.rpc(
      "is_ganker_user_available",
      {
        username_input: cleanGankerUser,
      }
    );

    if (error) {
      return "No se pudo validar si el usuario de Ganker Games está disponible.";
    }

    if (!available) {
      return "Ese usuario de Ganker Games ya está registrado. Usa otro.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("info");

    try {
      if (mode === "register") {
        const validationError = await validateRegisterData();

        if (validationError) {
          const isError =
            validationError.includes("correo") ||
            validationError.includes("usuario") ||
            validationError.includes("contraseña") ||
            validationError.includes("humano");

          showMessage(validationError, isError ? "error" : "info");
          setLoading(false);
          return;
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanFirstNames = firstNames.trim();
        const cleanPaternalLastName = paternalLastName.trim();
        const cleanMaternalLastName = maternalLastName.trim();
        const cleanGankerUser = gankerUser.trim();

        const age = calculateAge(birthDate);
        const userType = age >= 18 ? "Mayor de edad" : "Menor de edad";

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              display_name: fullDisplayName,
              first_names: cleanFirstNames,
              paternal_last_name: cleanPaternalLastName,
              maternal_last_name: cleanMaternalLastName,
              ganker_user: cleanGankerUser,
              birth_date: birthDate,
              nationality,
              avatar_url: "",
              user_type: userType,
              legal_terms_accepted_at: new Date().toISOString(),
              legal_terms_version: "2026-06",
              privacy_notice_version: "2026-06",
            },
          },
        });

        if (error) throw error;

        if (data.user && data.session) {
          let avatarUrl = "";

          if (avatarFile) {
            avatarUrl = await uploadAvatar(data.user.id);

            await supabase.auth.updateUser({
              data: {
                avatar_url: avatarUrl,
              },
            });

            await supabase.from("profiles").upsert({
              id: data.user.id,
              display_name: fullDisplayName,
              first_names: cleanFirstNames,
              paternal_last_name: cleanPaternalLastName,
              maternal_last_name: cleanMaternalLastName,
              ganker_user: cleanGankerUser,
              fortnite_user: cleanGankerUser,
              birth_date: birthDate,
              nationality,
              user_type: userType,
              avatar_url: avatarUrl,
              updated_at: new Date().toISOString(),
            });
          }
        }

        showMessage("Cuenta creada correctamente.", "success");

        openProfilePage();
        return;
      }

      const loginInput = email.trim().toLowerCase();
      const loginEmail = await resolveLoginEmail(loginInput);
      const deletedProfile = await checkDeletedProfile(loginInput);

      if (deletedProfile) {
        if (!deletedProfile.can_restore) {
          throw new Error(
            "Este perfil ya superó los 30 días de restauración. Deberás crear un perfil nuevo."
          );
        }

        setRestoreCandidate({
          ...deletedProfile,
          loginEmail: deletedProfile.email || loginEmail,
        });
        setLoading(false);
        return;
      }

      await signInAndOpenProfile(loginEmail, false);
    } catch (error) {
      const lowerMessage = error.message?.toLowerCase() || "";

      if (
        lowerMessage.includes("already registered") ||
        lowerMessage.includes("already been registered") ||
        lowerMessage.includes("user already registered")
      ) {
        showMessage("Ese correo ya fue utilizado por otro usuario.", "error");
      } else if (lowerMessage.includes("duplicate")) {
        showMessage("Ese usuario de Ganker Games ya está registrado.", "error");
      } else if (
        lowerMessage.includes("invalid login credentials") ||
        lowerMessage.includes("invalid credentials")
      ) {
        showMessage("Correo, usuario o contraseña incorrectos.", "error");
      } else {
        showMessage(error.message || "Ocurrió un error.", "error");
      }
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(mode === "login" ? "register" : "login");
    setMessage("");
    setMessageType("info");
    setHumanAnswer("");
    setHumanChallenge(createHumanChallenge());
    setShowPassword(false);
    setRestoreCandidate(null);
    setLegalAccepted(false);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(0,255,102,0.18),_transparent_28%),linear-gradient(180deg,#000_0%,#021106_100%)] px-4 py-10 text-white">
      <div className="mx-auto max-w-md rounded-[28px] border border-[#1eff7a]/30 bg-[#04120d]/90 p-6 shadow-[0_0_40px_rgba(21,216,99,0.14)]">
        <div className="text-center">
          <div className="relative mx-auto h-28 w-28">
            <img
              src={avatarPreview || "/gankergames-logo.png"}
              alt="Logo de GankerGames"
              onError={(event) => {
                event.currentTarget.src = "/gankergames-logo.png";
              }}
              className="h-28 w-28 object-contain drop-shadow-[0_0_24px_rgba(21,216,99,0.48)]"
            />

            {mode === "register" && (
              <label className="absolute -bottom-2 left-1/2 cursor-pointer -translate-x-1/2 rounded-full border border-[#67ff9a]/40 bg-[#07140f] px-3 py-1 text-[10px] font-black uppercase text-[#67ff9a] shadow-[0_0_16px_rgba(21,216,99,0.18)]">
                Foto
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <h1 className="mt-6 text-3xl font-black italic">
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta GankerGames"}
          </h1>

          <p className="mt-2 text-sm text-slate-300">
            Accede a tu perfil de GankerGames.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "register" && (
            <>
              <input
                type="text"
                placeholder="Nombre o nombres"
                value={firstNames}
                onChange={(event) => setFirstNames(event.target.value)}
                required
                className="w-full rounded-2xl border border-[#1eff7a]/25 bg-[#08140f] px-4 py-3 text-white outline-none focus:border-[#67ff9a]"
              />

              <input
                type="text"
                placeholder="Primer apellido"
                value={paternalLastName}
                onChange={(event) => setPaternalLastName(event.target.value)}
                required
                className="w-full rounded-2xl border border-[#1eff7a]/25 bg-[#08140f] px-4 py-3 text-white outline-none focus:border-[#67ff9a]"
              />

              <input
                type="text"
                placeholder="Segundo apellido materno (opcional)"
                value={maternalLastName}
                onChange={(event) => setMaternalLastName(event.target.value)}
                className="w-full rounded-2xl border border-[#1eff7a]/25 bg-[#08140f] px-4 py-3 text-white outline-none focus:border-[#67ff9a]"
              />

              <input
                type="text"
                placeholder="Usuario GankerGames único"
                value={gankerUser}
                onChange={(event) => setGankerUser(event.target.value)}
                required
                className="w-full rounded-2xl border border-[#1eff7a]/25 bg-[#08140f] px-4 py-3 text-white outline-none focus:border-[#67ff9a]"
              />

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#67ff9a]">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(event) => setBirthDate(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-[#1eff7a]/25 bg-[#08140f] px-4 py-3 text-white outline-none focus:border-[#67ff9a]"
                />
              </div>

              <select
                value={nationality}
                onChange={(event) => setNationality(event.target.value)}
                required
                className="w-full rounded-2xl border border-[#1eff7a]/25 bg-[#08140f] px-4 py-3 text-white outline-none focus:border-[#67ff9a]"
              >
                {nationalities.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </>
          )}

          <input
            type="text"
            placeholder={
              mode === "login"
                ? "Correo o usuario GankerGames"
                : "Correo electrónico"
            }
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-2xl border border-[#1eff7a]/25 bg-[#08140f] px-4 py-3 text-white outline-none focus:border-[#67ff9a]"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={mode === "register" ? 8 : 6}
              className="w-full rounded-2xl border border-[#1eff7a]/25 bg-[#08140f] px-4 py-3 pr-12 text-white outline-none focus:border-[#67ff9a]"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#1eff7a]/30 bg-[#06110c] text-[#67ff9a] transition hover:border-[#67ff9a] hover:text-white"
            >
              {showPassword ? (
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3l18 18" />
                  <path d="M10.6 10.6A2 2 0 0 0 13.4 13.4" />
                  <path d="M9.9 5.2A9.8 9.8 0 0 1 12 5c5.5 0 9 5 9 7a8.3 8.3 0 0 1-2.1 3.2" />
                  <path d="M6.1 6.1C4.2 7.3 3 9.3 3 12c0 2 3.5 7 9 7a9.8 9.8 0 0 0 4.1-.9" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {mode === "login" && (
            <div className="text-right">
              <Link
                href="/olvide-contrasena"
                className="text-sm font-black text-[#67ff9a] transition hover:text-white"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          )}

          {mode === "register" && (
            <>
              <div className="rounded-2xl border border-[#1eff7a]/20 bg-[#07140f] p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">
                    Seguridad
                  </span>
                  <span
                    className={`text-xs font-black uppercase ${passwordStrength.text}`}
                  >
                    {passwordStrength.label}
                  </span>
                </div>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#020905]">
                  <div
                    className={`h-full rounded-full transition-all ${passwordStrength.bar}`}
                    style={{
                      width: `${Math.max(
                        8,
                        (passwordStrength.score / 5) * 100
                      )}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs leading-5 text-slate-300">
                  La contraseña debe tener mínimo 8 caracteres, una mayúscula,
                  una minúscula, un número y un signo.
                </p>
              </div>

              <div className="rounded-2xl border border-[#1eff7a]/25 bg-[#08140f] p-4">
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#67ff9a]">
                  Verificación humana
                </label>

                <div className="flex items-center gap-3">
                  <span className="rounded-xl border border-[#1eff7a]/25 bg-[#07140f] px-4 py-3 font-black text-white">
                    {humanChallenge.a} + {humanChallenge.b} =
                  </span>

                  <input
                    type="number"
                    placeholder="?"
                    value={humanAnswer}
                    onChange={(event) => setHumanAnswer(event.target.value)}
                    required
                    className="min-w-0 flex-1 rounded-2xl border border-[#1eff7a]/25 bg-[#020905] px-4 py-3 text-white outline-none focus:border-[#67ff9a]"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#1eff7a]/25 bg-[#07140f] p-4 text-xs leading-5 text-slate-300">
                <input
                  type="checkbox"
                  checked={legalAccepted}
                  onChange={(event) => setLegalAccepted(event.target.checked)}
                  required
                  className="mt-1 h-4 w-4 accent-[#15d863]"
                />
                <span>
                  He leído y acepto los{" "}
                  <Link className="font-black text-[#67ff9a] underline" href="/terminos-de-uso" target="_blank">
                    Términos de uso
                  </Link>
                  {" "}y confirmo que consulté el{" "}
                  <Link className="font-black text-[#67ff9a] underline" href="/aviso-de-privacidad" target="_blank">
                    Aviso de privacidad
                  </Link>
                  . Si soy menor de edad, cuento con autorización de mi madre, padre o tutor.
                </span>
              </label>
            </>
          )}

          {message && (
            <div
              className={`rounded-2xl border p-3 text-sm ${
                messageType === "error"
                  ? "border-red-500/40 bg-red-500/10 text-red-300"
                  : messageType === "success"
                    ? "border-[#1eff7a]/30 bg-[#07140f] text-[#67ff9a]"
                    : "border-[#1eff7a]/25 bg-[#07140f] text-slate-200"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#15d863] px-4 py-4 font-black text-[#06110a] shadow-[0_0_24px_rgba(21,216,99,0.22)] disabled:opacity-60"
          >
            {loading
              ? "Cargando..."
              : mode === "login"
                ? "Entrar"
                : "Crear cuenta"}
          </button>
        </form>

        <button
          type="button"
          onClick={switchMode}
          className="mt-4 w-full rounded-2xl border border-[#1eff7a]/30 bg-[#08140f] px-4 py-3 font-black text-[#67ff9a]"
        >
          {mode === "login"
            ? "No tengo cuenta, registrarme"
            : "Ya tengo cuenta, iniciar sesión"}
        </button>

        {mode === "login" && <PwaInstallButton />}

        {mode === "login" && (
          <Link
            href="/tienda"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-300/35 bg-cyan-300/10 px-4 py-3 font-black text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/15"
          >
            <span aria-hidden="true">🛒</span>
            Entrar a la tienda Fortnite
          </Link>
        )}

        <footer className="mt-5 border-t border-[#1eff7a]/15 pt-4 text-center text-xs leading-6 text-slate-400">
          <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <Link
              href="/aviso-de-privacidad"
              className="transition hover:text-[#67ff9a]"
            >
              Aviso de privacidad
            </Link>

            <span aria-hidden="true" className="text-[#1eff7a]/45">
              •
            </span>

            <Link
              href="/terminos-de-uso"
              className="transition hover:text-[#67ff9a]"
            >
              Términos de uso
            </Link>

            <span aria-hidden="true" className="text-[#1eff7a]/45">
              •
            </span>

            <Link
              href="/politica-de-cookies"
              className="transition hover:text-[#67ff9a]"
            >
              Política de cookies
            </Link>

            <span aria-hidden="true" className="text-[#1eff7a]/45">
              •
            </span>

            <Link
              href="/aviso-legal"
              className="transition hover:text-[#67ff9a]"
            >
              Aviso legal
            </Link>
          </nav>

          <p className="mt-2">
            © {new Date().getFullYear()} Ganker Games. Todos los derechos reservados.
          </p>
        </footer>
      </div>

      {restoreCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-[#1eff7a]/30 bg-[#04120d] p-6 text-white shadow-[0_0_45px_rgba(21,216,99,0.18)]">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-yellow-400/40 bg-yellow-400/10 text-3xl">
                ⚠️
              </div>

              <h2 className="mt-4 text-2xl font-black italic">
                Perfil en restauración
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                Este perfil fue marcado para borrarse, pero todavía está dentro
                del periodo de 30 días. Puedes restaurarlo con sus premios,
                recompensas, participaciones y configuraciones.
              </p>

              {restoreCandidate.restore_until && (
                <p className="mt-3 rounded-2xl border border-[#1eff7a]/20 bg-[#07140f] p-3 text-xs text-[#67ff9a]">
                  Disponible hasta:{" "}
                  {new Date(restoreCandidate.restore_until).toLocaleDateString("es-MX")}
                </p>
              )}
            </div>

            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={handleRestoreLogin}
                disabled={restoreLoading}
                className="rounded-2xl bg-[#15d863] px-4 py-4 font-black text-[#06110a] shadow-[0_0_24px_rgba(21,216,99,0.22)] disabled:opacity-60"
              >
                {restoreLoading ? "Restaurando..." : "Sí, restaurar mi perfil"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRestoreCandidate(null);
                  showMessage("Restauración cancelada. No se inició sesión.", "info");
                }}
                disabled={restoreLoading}
                className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 font-black text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
              >
                No quiero restaurarlo
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}