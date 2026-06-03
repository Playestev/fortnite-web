import LegalDocumentLayout, { LegalList, LegalSection } from "@/components/LegalDocumentLayout";

export const metadata = {
  title: "Política de cookies | Ganker Games",
  description: "Información sobre cookies, almacenamiento local y caché técnica de Ganker Games.",
};

export default function CookiesPage() {
  return (
    <LegalDocumentLayout
      eyebrow="Almacenamiento técnico"
      title="Política de cookies y tecnologías similares"
      description="Explicamos qué almacenamiento utiliza Ganker Games para funcionar como sitio web y como PWA instalable."
      updatedAt="junio de 2026"
    >
      <LegalSection title="1. Qué son las cookies y tecnologías similares">
        <p>
          Las cookies, el almacenamiento local, los identificadores de sesión y la caché del navegador son tecnologías
          que permiten recordar información técnica o preferencias durante el uso de una página o app web.
        </p>
      </LegalSection>

      <LegalSection title="2. Tecnologías estrictamente necesarias que utilizamos">
        <LegalList>
          <li>Identificadores de sesión y mecanismos equivalentes para mantener el inicio de sesión y proteger tu cuenta.</li>
          <li>Almacenamiento local para recordar avisos técnicos o determinadas preferencias del sitio.</li>
          <li>Caché técnica administrada por el service worker de la PWA para mejorar la carga y permitir la instalación de la app.</li>
          <li>Registros técnicos mínimos para seguridad, prevención de abuso y continuidad del servicio.</li>
        </LegalList>
        <p>
          Estas tecnologías son necesarias para prestar las funciones solicitadas. Desactivarlas desde el navegador puede
          impedir el inicio de sesión, la instalación de la PWA o el funcionamiento correcto de ciertas secciones.
        </p>
      </LegalSection>

      <LegalSection title="3. Analítica, publicidad y marketing">
        <p>
          En la versión actual de Ganker Games no declaramos cookies propias de publicidad personalizada ni herramientas
          de analítica opcionales. Si se agregan posteriormente, esta política se actualizará y se implementarán los
          controles que correspondan antes de activarlas cuando resulte necesario.
        </p>
      </LegalSection>

      <LegalSection title="4. Sitios externos">
        <p>
          Los enlaces a servicios externos, como WhatsApp, Discord, Facebook, Epic Games u otras plataformas, pueden
          utilizar sus propias cookies cuando los visites. Consulta las políticas de esos terceros para conocer sus
          prácticas.
        </p>
      </LegalSection>

      <LegalSection title="5. Cómo administrar el almacenamiento">
        <p>
          Puedes borrar cookies, caché y almacenamiento local desde la configuración de tu navegador. También puedes
          desinstalar la PWA desde las opciones de tu celular o computadora. Al borrar datos del sitio es posible que debas
          iniciar sesión nuevamente.
        </p>
      </LegalSection>

      <LegalSection title="6. Cambios a esta política">
        <p>
          Actualizaremos esta página si se incorporan nuevas tecnologías, herramientas de medición o cambios relevantes.
        </p>
      </LegalSection>
    </LegalDocumentLayout>
  );
}
