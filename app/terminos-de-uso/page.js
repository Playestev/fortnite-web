import LegalDocumentLayout, { LegalList, LegalSection } from "@/components/LegalDocumentLayout";

export const metadata = {
  title: "Términos de uso | Ganker Games",
  description: "Términos y condiciones de uso de Ganker Games.",
};

export default function TermsPage() {
  return (
    <LegalDocumentLayout
      eyebrow="Reglas de la plataforma"
      title="Términos de uso"
      description="Al crear una cuenta, instalar la PWA o utilizar las funciones de Ganker Games aceptas estas reglas."
      updatedAt="junio de 2026"
    >
      <LegalSection title="1. Identificación del proyecto">
        <p>
          Ganker Games es un proyecto digital operado por <strong>Esteban Uriel Hernández Cuevas</strong>, con domicilio
          operativo en Ciudad Juárez, Chihuahua, México. Para soporte o dudas puedes escribir a
          <strong> ezteban619@gmail.com</strong>.
        </p>
      </LegalSection>

      <LegalSection title="2. Objeto del servicio">
        <p>
          La plataforma permite acceder a contenidos gamer, perfiles de comunidad, dinámicas, sorteos, premios,
          beneficios VIP, referencias de tienda y funciones relacionadas con Ganker Games. Algunas secciones pueden
          modificarse, suspenderse o ampliarse conforme evolucione el proyecto.
        </p>
      </LegalSection>

      <LegalSection title="3. Registro y seguridad de la cuenta">
        <LegalList>
          <li>Debes proporcionar información veraz y mantenerla actualizada.</li>
          <li>Eres responsable de proteger tu contraseña y de las actividades realizadas desde tu cuenta.</li>
          <li>No puedes crear cuentas para suplantar a otra persona, evadir sanciones o alterar dinámicas.</li>
          <li>Debes informar cualquier acceso no autorizado o problema de seguridad.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="4. Personas menores de edad">
        <p>
          Las personas menores de edad solo pueden utilizar la plataforma con autorización y supervisión de su madre,
          padre o tutor. La persona adulta responsable deberá revisar estos términos y el Aviso de privacidad. Ganker
          Games podrá restringir funciones o solicitar verificaciones adicionales cuando sea necesario proteger a una
          persona menor de edad.
        </p>
      </LegalSection>

      <LegalSection title="5. Normas de convivencia y uso permitido">
        <p>No se permite:</p>
        <LegalList>
          <li>Usar la plataforma para actividades ilícitas, fraudulentas o contrarias a derechos de terceros.</li>
          <li>Publicar amenazas, acoso, discriminación, contenido sexual, violento o información personal de terceros sin autorización.</li>
          <li>Manipular sorteos, utilizar automatizaciones abusivas, compartir enlaces privados de forma indebida o intentar obtener participaciones no autorizadas.</li>
          <li>Intentar vulnerar la seguridad, copiar bases de datos, acceder a cuentas ajenas o interferir con el funcionamiento del sitio.</li>
          <li>Usar logos, textos o materiales de Ganker Games para hacerse pasar por un canal oficial.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="6. Perfiles públicos y contenido de usuarios">
        <p>
          Eres responsable del contenido que publiques, incluyendo fotos, etiquetas, comentarios e intereses. Al subir
          contenido autorizas a Ganker Games a mostrarlo dentro de la plataforma únicamente para operar la función en la
          que participaste. Debes contar con los derechos necesarios y evitar publicar información sensible o privada.
        </p>
      </LegalSection>

      <LegalSection title="7. Sorteos, dinámicas y premios">
        <LegalList>
          <li>Cada dinámica puede incluir requisitos, fechas, categorías, límites y mecanismos de participación específicos.</li>
          <li>Las participaciones VIP podrán tener ponderaciones especiales cuando así se indique en las reglas aplicables.</li>
          <li>Los ganadores serán determinados conforme al mecanismo informado para cada dinámica y podrán requerir validación de identidad o contacto.</li>
          <li>Cuando un premio no pueda entregarse por causas ajenas a Ganker Games, se buscará una alternativa razonable de valor comparable cuando resulte aplicable.</li>
          <li>El uso de datos para sorteos se rige por el Aviso de privacidad.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="8. Beneficios VIP, precios y referencias de tienda">
        <p>
          Los beneficios VIP, precios, referencias y promociones pueden cambiar. Antes de cualquier compra o contratación
          se informarán las condiciones aplicables. Salvo indicación expresa, Ganker Games no ofrece cobros recurrentes
          automáticos. Si en el futuro se habilita una membresía con renovación automática, se informará previamente y se
          ofrecerá un mecanismo de cancelación conforme a la normativa aplicable.
        </p>
      </LegalSection>

      <LegalSection title="9. Fortnite, Epic Games y otras marcas">
        <p>
          Fortnite, Epic Games y las demás marcas, imágenes, nombres o elementos de terceros pertenecen a sus respectivos
          titulares. Ganker Games es un proyecto independiente y no mantiene afiliación, patrocinio ni vínculo oficial con
          Epic Games, Inc. salvo que se indique expresamente lo contrario en una comunicación específica.
        </p>
      </LegalSection>

      <LegalSection title="10. Propiedad intelectual de Ganker Games">
        <p>
          El logotipo, los textos originales, diseños propios, identidad visual y materiales creados por Ganker Games se
          encuentran protegidos por la normativa aplicable. No puedes reproducirlos, explotarlos comercialmente o
          presentarlos como propios sin autorización.
        </p>
      </LegalSection>

      <LegalSection title="11. Enlaces y plataformas externas">
        <p>
          La plataforma puede incluir enlaces a sitios externos como redes sociales, comunidades, servicios de pago o
          páginas oficiales de videojuegos. Ganker Games no controla sus contenidos, disponibilidad ni políticas. El uso
          de esos servicios queda sujeto a sus propios términos.
        </p>
      </LegalSection>

      <LegalSection title="12. Disponibilidad y limitación razonable de responsabilidad">
        <p>
          Procuramos mantener información útil y el servicio disponible, pero pueden existir errores, interrupciones,
          cambios de terceros o mantenimientos. La información gamer, precios y promociones debe confirmarse en las fuentes
          correspondientes antes de tomar decisiones.
        </p>
      </LegalSection>

      <LegalSection title="13. Suspensión, eliminación y restauración de perfiles">
        <p>
          Podremos suspender o eliminar perfiles que incumplan estas reglas, afecten la seguridad o perjudiquen a la
          comunidad. Cuando la plataforma lo permita, un perfil eliminado por su titular podrá restaurarse durante el
          periodo indicado en la interfaz antes de su eliminación definitiva.
        </p>
      </LegalSection>

      <LegalSection title="14. Modificaciones">
        <p>
          Estos términos podrán actualizarse para reflejar cambios legales o funcionales. La versión vigente se publicará
          en esta página con su fecha de actualización.
        </p>
      </LegalSection>

      <LegalSection title="15. Legislación y contacto">
        <p>
          Estos términos se interpretarán conforme a las leyes aplicables de los Estados Unidos Mexicanos. Para aclaraciones,
          soporte o solicitudes relacionadas con la plataforma escribe a <strong>ezteban619@gmail.com</strong>.
        </p>
      </LegalSection>
    </LegalDocumentLayout>
  );
}
