import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Hr,
  Img,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface AdminSponsorNotificationEmailProps {
  sponsorName: string;
  sponsorEmail: string;
  sponsorPhone: string;
  petName: string;
  petImage?: string;
  message?: string;
}

export const AdminSponsorNotificationEmail = ({
  sponsorName = "Carlos Ruiz",
  sponsorEmail = "carlos@example.com",
  sponsorPhone = "3000000000",
  petName = "Luna",
  petImage = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400",
  message = "Hola, quiero saber más sobre cómo apadrinar.",
}: AdminSponsorNotificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Nueva solicitud de apadrinamiento para {petName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailLayout>
            <Section style={header}>
              <Heading style={h1}>💖 Nueva Solicitud de Apadrinamiento</Heading>
              <Text style={subtitle}>Alguien quiere convertirse en padrino/madrina.</Text>
            </Section>

            <Section style={section}>
              <Heading style={h2}>Datos del Interesado</Heading>
              <Text style={text}><strong>Nombre:</strong> {sponsorName}</Text>
              <Text style={text}><strong>Email:</strong> {sponsorEmail}</Text>
              <Text style={text}><strong>Teléfono:</strong> {sponsorPhone}</Text>
              <Hr style={hr} />
              <Text style={text}><strong>Mensaje adicional:</strong></Text>
              <Text style={paragraph}>{message || "Sin mensaje adicional."}</Text>
            </Section>

            <Section style={section}>
              <Heading style={h2}>Mascota Elegida</Heading>
              <Row>
                <Column align="center">
                  {petImage && (
                    <Img
                      src={petImage}
                      width="150"
                      height="150"
                      alt={petName}
                      style={image}
                    />
                  )}
                  <Text style={{ ...text, fontWeight: "bold" }}>{petName}</Text>
                </Column>
              </Row>
            </Section>
          </EmailLayout>
        </Container>
      </Body>
    </Html>
  );
};

export default AdminSponsorNotificationEmail;

const main = { backgroundColor: "#f6f9fc", fontFamily: "-apple-system, sans-serif" };
const container = { backgroundColor: "#ffffff", margin: "0 auto", padding: "20px 0 48px", borderRadius: "8px" };
const header = { padding: "32px 48px", textAlign: "center" as const };
const h1 = { color: "#d81b60", fontSize: "24px" };
const h2 = { color: "#4e342e", fontSize: "18px", borderBottom: "1px solid #efebe9", paddingBottom: "10px" };
const subtitle = { color: "#8d6e63", fontSize: "16px" };
const section = { padding: "0 48px 24px" };
const text = { color: "#4e342e", fontSize: "14px", margin: "8px 0" };
const paragraph = { color: "#5d4037", fontSize: "14px", fontStyle: "italic", backgroundColor: "#fce4ec", padding: "10px", borderRadius: "4px" };
const image = { borderRadius: "75px", objectFit: "cover" as const, marginBottom: "10px" };
const hr = { borderColor: "#efebe9", margin: "20px 0" };
const footer = { padding: "0 48px", textAlign: "center" as const };
const footerText = { color: "#a1887f", fontSize: "12px" };