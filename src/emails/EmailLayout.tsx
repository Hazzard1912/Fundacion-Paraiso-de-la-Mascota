import {
  Section,
  Text,
  Link,
  Hr,
  Img,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

// Nota: En emails reales, el logo DEBE ser una URL absoluta de producción (Cloudinary, Vercel, etc.)
// Para desarrollo podemos usar un placeholder o la URL donde planeas alojarlo.
export const EmailLayout = ({ children }: { children: React.ReactNode }) => {
  const logoUrl = "https://paraisodelamascota.org/images/logo.png";

  return (
    <>
      <Section style={headerLogo}>
        <Img
          src={logoUrl}
          width="150"
          alt="Fundación Paraíso de la Mascota"
          style={logo}
        />
      </Section>
      
      {children}

      <Hr style={hr} />
      <Section style={footer}>
        <Row>
          <Column align="center" style={footerIcons}>
            <Link href="https://instagram.com/paraisocali" style={socialLink}>Instagram</Link>
            <Link href="https://facebook.com/ParaisodelaMascotaCali" style={socialLink}>Facebook</Link>
          </Column>
        </Row>
        <Text style={footerText}>
          <strong>Fundación Paraíso de la Mascota</strong><br />
          🐾 Cali, Colombia.<br />
          Este correo fue enviado automáticamente desde nuestro sitio web oficial.
        </Text>
        <Link href="https://paraisodelamascota.org" style={link}>www.paraisodelamascota.org</Link>
      </Section>
    </>
  );
};

const headerLogo = {
  padding: "20px 0",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
  display: "block",
};

const hr = {
  borderColor: "#efebe9",
  margin: "20px 0",
};

const footer = {
  padding: "0 48px 48px",
  textAlign: "center" as const,
};

const footerIcons = {
  marginBottom: "15px",
};

const socialLink = {
  color: "#795548",
  fontSize: "12px",
  margin: "0 10px",
  textDecoration: "none",
};

const footerText = {
  color: "#a1887f",
  fontSize: "12px",
  margin: "20px 0 10px",
  lineHeight: "18px",
};

const link = {
  color: "#795548",
  fontSize: "12px",
  textDecoration: "underline",
};
