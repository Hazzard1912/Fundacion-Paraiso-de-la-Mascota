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

interface SponsorConfirmationEmailProps {
  sponsorName: string;
  petName: string;
  petImage?: string;
}

export const SponsorConfirmationEmail = ({
  sponsorName = "Amigo",
  petName = "una mascota",
  petImage,
}: SponsorConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>¡Gracias por querer apadrinar a {petName}! 💖</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailLayout>
            <Section style={header}>
              <Heading style={h1}>¡Gracias, {sponsorName}! 💖</Heading>
              <Text style={subtitle}>Tu interés en apadrinar a {petName} nos llena de alegría.</Text>
            </Section>

            <Section style={section}>
              {petImage && (
                <Img
                  src={petImage}
                  width="200"
                  height="200"
                  alt={petName}
                  style={image}
                />
              )}
              <Text style={text}>
                Muchas gracias por querer formar parte de la vida de <strong>{petName}</strong>. 
              </Text>
              <Text style={text}>
                El apadrinamiento es una de las formas más hermosas de ayudarnos a seguir cuidando de ellos mientras encuentran su hogar definitivo.
              </Text>
              <Text style={text}>
                Pronto te contactaremos para darte más información sobre cómo funciona el apadrinamiento y resolver cualquier duda que tengas.
              </Text>
            </Section>
          </EmailLayout>
        </Container>
      </Body>
    </Html>
  );
};

export default SponsorConfirmationEmail;

const main = { backgroundColor: "#f6f9fc", fontFamily: "-apple-system, sans-serif" };
const container = { backgroundColor: "#ffffff", margin: "0 auto", padding: "20px 0 48px", borderRadius: "8px" };
const header = { padding: "32px 48px", textAlign: "center" as const };
const h1 = { color: "#d81b60", fontSize: "24px" };
const subtitle = { color: "#8d6e63", fontSize: "16px" };
const section = { padding: "0 48px 24px", textAlign: "center" as const };
const text = { color: "#4e342e", fontSize: "14px", lineHeight: "24px", textAlign: "left" as const };
const image = { borderRadius: "12px", objectFit: "cover" as const, margin: "0 auto 20px" };
const hr = { borderColor: "#efebe9", margin: "20px 0" };
const footer = { padding: "0 48px", textAlign: "center" as const };
const footerText = { color: "#a1887f", fontSize: "12px" };
const link = { color: "#d81b60", fontSize: "12px", textDecoration: "underline" };