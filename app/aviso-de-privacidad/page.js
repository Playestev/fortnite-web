import LegalDocumentLayout, { LegalList, LegalSection } from "@/components/LegalDocumentLayout";

export const metadata = {
  title: "Aviso de privacidad | Ganker Games",
  description: "Aviso de privacidad integral de Ganker Games.",
};

export default function PrivacyNoticePage() {
  return (
    <LegalDocumentLayout
      eyebrow="Protección de datos personales"
      title="Aviso de privacidad integral"
      description="Este documento explica qué datos personales tratamos, para qué los utilizamos y cómo puedes ejercer tus derechos."
      updatedAt="junio de 2026"
    >
      <LegalSection title="1. Identidad y domicilio del responsable">
        <p>
          El responsable del tratamiento de los datos personales es <strong>Esteban Uriel Hernández Cuevas</strong>,
          quien opera el proyecto digital <strong>Ganker Games</strong>, con domicilio operativo en Ciudad Juárez,
          Chihuahua, México. Para asuntos relacionados con privacidad y datos personales puedes escribir a
          <strong> ezteban619@gmail.com</strong>.
        </p>
      </LegalSection>

      <LegalSection title="2. Datos personales que podemos tratar">
        <p>Según las funciones que utilices, podemos tratar las siguientes categorías de información:</p>
        <LegalList>
          <li>Datos de cuenta y perfil: nombre, apellidos, usuario de Ganker Games, correo electrónico, fecha de nacimiento, nacionalidad, país y foto de perfil.</li>
          <li>Datos opcionales de contacto y perfil: número telefónico o WhatsApp, redes sociales, etiquetas, intereses, preferencias de privacidad y notificaciones.</li>
          <li>Datos de comunidad: comentarios, reacciones, estado de presencia, actividad visible y contenido que decidas publicar dentro de tu perfil.</li>
          <li>Datos de sorteos y dinámicas: usuario participante, condición VIP, participaciones, premios, información de contacto proporcionada para la dinámica, calificación de servicio y comentario.</li>
          <li>Datos técnicos y de seguridad: identificadores de sesión, registros técnicos necesarios, dirección IP transformada mediante hash, huella técnica del dispositivo transformada mediante hash, fecha de registro y caché técnica de la PWA.</li>
        </LegalList>
        <p>
          No solicitamos intencionalmente datos personales sensibles. Evita publicar información médica, biométrica,
          religiosa, política o cualquier otro dato sensible en comentarios, perfiles o formularios.
        </p>
      </LegalSection>

      <LegalSection title="3. Finalidades primarias del tratamiento">
        <LegalList>
          <li>Crear y administrar tu cuenta, autenticar tu acceso y permitir la recuperación del perfil.</li>
          <li>Mostrar tu perfil y tu participación en la comunidad conforme a tus preferencias de privacidad.</li>
          <li>Gestionar sorteos, dinámicas, participaciones ponderadas, premios y beneficios VIP.</li>
          <li>Prevenir duplicidades, fraude, abuso de enlaces personalizados y actividades contrarias a las reglas.</li>
          <li>Atender dudas, solicitudes, reportes y ejercicios de derechos relacionados con tu información.</li>
          <li>Mantener la seguridad, continuidad y funcionamiento técnico de la plataforma.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="4. Finalidades secundarias y opciones para limitar el uso">
        <p>
          Cuando lo autorices mediante la configuración correspondiente, podremos enviarte avisos sobre noticias,
          sorteos, dinámicas, premios o actualizaciones de Ganker Games por correo o WhatsApp. Puedes desactivar estas
          opciones desde tu perfil o solicitarlo por correo electrónico.
        </p>
      </LegalSection>

      <LegalSection title="5. Perfiles públicos y contenido visible">
        <p>
          Algunas funciones permiten mostrar información dentro de la comunidad, como tu usuario, foto, etiquetas,
          estado o actividad. Puedes modificar varias opciones desde la configuración de privacidad. No publiques datos
          que no deseas hacer visibles a otras personas.
        </p>
      </LegalSection>

      <LegalSection title="6. Proveedores tecnológicos y enlaces externos">
        <p>
          Para operar la plataforma utilizamos proveedores tecnológicos que pueden actuar como encargados del
          tratamiento, incluyendo servicios de autenticación, base de datos, almacenamiento y alojamiento web. Entre
          ellos se encuentran Supabase y Vercel. Estos proveedores tratan información únicamente para prestar sus
          servicios técnicos conforme a sus propios términos y medidas de seguridad.
        </p>
        <p>
          También pueden existir enlaces a WhatsApp, Discord, Facebook, Epic Games u otros sitios externos. Cuando
          ingresas a esas plataformas, su tratamiento de datos se rige por sus respectivos avisos y políticas.
        </p>
      </LegalSection>

      <LegalSection title="7. Transferencias de datos">
        <p>
          No vendemos tus datos personales ni los compartimos con terceros para que los utilicen con fines publicitarios
          propios. Podremos comunicar información cuando sea necesaria para operar la plataforma mediante encargados,
          cumplir una obligación legal o atender un requerimiento de autoridad competente. Cuando corresponda, se
          solicitará el consentimiento aplicable.
        </p>
      </LegalSection>

      <LegalSection title="8. Conservación y seguridad">
        <p>
          Conservamos la información durante el tiempo necesario para mantener tu cuenta, operar las funciones que
          solicitas, administrar premios y atender obligaciones legales o de seguridad. Si solicitas borrar tu perfil,
          podrá existir un periodo de restauración de hasta 30 días antes de la eliminación definitiva, salvo que alguna
          obligación legal justifique conservar cierta información por un plazo adicional.
        </p>
        <p>
          Aplicamos medidas administrativas y técnicas razonables para reducir riesgos de pérdida, alteración, acceso no
          autorizado o uso indebido. Ningún sistema conectado a internet puede garantizar seguridad absoluta.
        </p>
      </LegalSection>

      <LegalSection title="9. Derechos ARCO, revocación y limitación del uso">
        <p>
          Puedes solicitar acceso, rectificación, cancelación u oposición respecto de tus datos personales, así como
          revocar tu consentimiento o limitar determinados usos. Envía tu solicitud a <strong>ezteban619@gmail.com</strong>.
        </p>
        <p>Incluye:</p>
        <LegalList>
          <li>Tu nombre y un medio para recibir respuesta.</li>
          <li>La información necesaria para acreditar tu identidad o representación.</li>
          <li>Una descripción clara del derecho que deseas ejercer y de los datos relacionados.</li>
          <li>Cualquier elemento que facilite localizar tu información.</li>
        </LegalList>
        <p>
          Se comunicará la determinación correspondiente dentro del plazo legal aplicable y, cuando resulte procedente,
          se hará efectiva dentro del periodo establecido por la normativa vigente.
        </p>
      </LegalSection>

      <LegalSection title="10. Personas menores de edad">
        <p>
          Si eres menor de edad, utiliza la plataforma únicamente con autorización y supervisión de tu madre, padre o
          tutor. No publiques datos de contacto, ubicación precisa ni información personal innecesaria. Ganker Games podrá
          limitar o eliminar cuentas cuando sea necesario para proteger a personas menores de edad.
        </p>
      </LegalSection>

      <LegalSection title="11. Cookies, almacenamiento local y PWA">
        <p>
          Utilizamos almacenamiento local, identificadores de sesión y caché técnica estrictamente necesaria para iniciar
          sesión, guardar preferencias, mejorar el rendimiento y permitir la instalación de la app como PWA. Consulta la
          Política de cookies para conocer más detalles.
        </p>
      </LegalSection>

      <LegalSection title="12. Cambios al aviso de privacidad">
        <p>
          Las modificaciones importantes se publicarán en esta misma página y podrán comunicarse mediante los canales
          oficiales de Ganker Games. La fecha de actualización se mostrará al inicio del documento.
        </p>
      </LegalSection>
    </LegalDocumentLayout>
  );
}
