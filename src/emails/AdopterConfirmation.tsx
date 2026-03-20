import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Img,
} from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface AdopterConfirmationEmailProps {
  adopterName: string;
  petName: string;
  petImage?: string;
}

export const AdopterConfirmationEmail = ({
  adopterName = "Amigo",
  petName = "una mascota",
  petImage,
}: AdopterConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>¡Gracias por tu interés en adoptar a {petName}! 🐾</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailLayout>
            <Section style={header}>
              <Heading style={h1}>¡Gracias, {adopterName}! 🐾</Heading>
              <Text style={subtitle}>Tu solicitud para adoptar a {petName} ha sido recibida.</Text>
            </Section>

            <Section style={section}>
              {petImage && (
                <Img
                  src={petImage}
                  width="100%"
                  height="auto"
                  alt={petName}
                  style={image}
                />
              )}
              <Text style={text}>
                Estamos muy felices de que quieras brindarle un hogar a <strong>{petName}</strong>. 
              </Text>
              <Text style={text}>
                Nuestro equipo revisará tu información y nos pondremos en contacto contigo lo antes posible para contarte los siguientes pasos del proceso.
              </Text>
              <Text style={text}>
                Ten en cuenta que somos una fundación y los tiempos de respuesta pueden variar, ¡gracias por tu paciencia!
              </Text>
            </Section>
          </EmailLayout>
        </Container>
      </Body>
    </Html>
  );
};

export default AdopterConfirmationEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 0",
  marginBottom: "64px",
  borderRadius: "8px",
};

const header = {
  padding: "12px 48px 32px",
  textAlign: "center" as const,
};

const h1 = {
  color: "#4e342e",
  fontSize: "24px",
  fontWeight: "bold",
};

const subtitle = {
  color: "#8d6e63",
  fontSize: "16px",
};

const section = {
  padding: "0 48px 24px",
};

const text = {
  color: "#4e342e",
  fontSize: "14px",
  lineHeight: "24px",
};

const image = {
  borderRadius: "12px",
  objectFit: "cover" as const,
  marginBottom: "20px",
};
