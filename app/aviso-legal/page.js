import LegalDocumentLayout, { LegalSection } from "@/components/LegalDocumentLayout";

export const metadata = {
  title: "Aviso legal | Ganker Games",
  description: "Información legal básica del sitio Ganker Games.",
};

export default function LegalNoticePage() {
  return (
    <LegalDocumentLayout
      eyebrow="Información del responsable"
      title="Aviso legal"
      description="Información general sobre el sitio, sus contenidos y el carácter independiente de Ganker Games."
      updatedAt="junio de 2026"
    >
      <LegalSection title="1. Responsable del sitio">
        <p>
          Responsable: <strong>Esteban Uriel Hernández Cuevas</strong>.<br />
          Nombre comercial: <strong>Ganker Games</strong>.<br />
          Domicilio operativo: Ciudad Juárez, Chihuahua, México.<br />
          Contacto: <strong>ezteban619@gmail.com</strong>.
        </p>
      </LegalSection>

      <LegalSection title="2. Objeto del sitio">
        <p>
          Ganker Games difunde información, noticias y contenido relacionado con videojuegos, además de ofrecer perfiles
          de comunidad, dinámicas, sorteos, premios, beneficios VIP y referencias de tienda.
        </p>
      </LegalSection>

      <LegalSection title="3. Naturaleza informativa">
        <p>
          Las noticias, precios, comparativas, imágenes y promociones pueden cambiar. Antes de realizar una compra o tomar
          una decisión, confirma la información en la plataforma o fuente correspondiente.
        </p>
      </LegalSection>

      <LegalSection title="4. Propiedad intelectual y marcas de terceros">
        <p>
          Los materiales originales de Ganker Games se encuentran protegidos por la normativa aplicable. Fortnite, Epic
          Games y las demás marcas mencionadas pertenecen a sus titulares. Ganker Games no es un canal oficial de Epic
          Games, Inc. ni representa a las empresas propietarias de los videojuegos citados.
        </p>
      </LegalSection>

      <LegalSection title="5. Enlaces externos">
        <p>
          Los enlaces externos se ofrecen como referencia. Ganker Games no controla el contenido, disponibilidad o
          prácticas de privacidad de sitios y plataformas de terceros.
        </p>
      </LegalSection>

      <LegalSection title="6. Datos personales">
        <p>
          El tratamiento de datos personales se describe en el Aviso de privacidad integral publicado dentro de esta
          plataforma.
        </p>
      </LegalSection>

      <LegalSection title="7. Legislación y contacto">
        <p>
          Este aviso se interpreta conforme a las leyes aplicables de los Estados Unidos Mexicanos. Para consultas escribe
          a <strong>ezteban619@gmail.com</strong>.
        </p>
      </LegalSection>
    </LegalDocumentLayout>
  );
}
