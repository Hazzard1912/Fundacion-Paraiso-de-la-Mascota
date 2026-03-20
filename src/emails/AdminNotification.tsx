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

interface AdminNotificationEmailProps {
  adopterName: string;
  adopterEmail: string;
  adopterPhone: string;
  adopterAddress: string;
  adopterHasPets: string;
  adoptionReason: string;
  petName: string;
  petImage?: string;
}

export const AdminNotificationEmail = ({
  adopterName = "Juan Perez",
  adopterEmail = "juan@example.com",
  adopterPhone = "3001234567",
  adopterAddress = "Calle 123",
  adopterHasPets = "Sí",
  adoptionReason = "Siempre he querido tener un compañero.",
  petName = "Firulais",
  petImage = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400",
}: AdminNotificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Nueva solicitud de adopción para {petName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailLayout>
            <Section style={header}>
              <Heading style={h1}>🐾 Nueva Solicitud de Adopción</Heading>
              <Text style={subtitle}>Se ha recibido una nueva solicitud a través del sitio web.</Text>
            </Section>

            <Section style={section}>
              <Heading style={h2}>Datos del Adoptante</Heading>
              <Text style={text}><strong>Nombre:</strong> {adopterName}</Text>
              <Text style={text}><strong>Email:</strong> {adopterEmail}</Text>
              <Text style={text}><strong>Teléfono:</strong> {adopterPhone}</Text>
              <Text style={text}><strong>Dirección:</strong> {adopterAddress}</Text>
              <Text style={text}><strong>¿Tiene más mascotas?:</strong> {adopterHasPets}</Text>
              <Hr style={hr} />
              <Text style={text}><strong>Motivo de adopción:</strong></Text>
              <Text style={paragraph}>{adoptionReason}</Text>
            </Section>

            <Section style={section}>
              <Heading style={h2}>Mascota de Interés</Heading>
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
                  <Text style={{ ...text, fontWeight: "bold", fontSize: "18px" }}>{petName}</Text>
                </Column>
              </Row>
            </Section>
          </EmailLayout>
        </Container>
      </Body>
    </Html>
  );
};

export default AdminNotificationEmail;

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
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const header = {
  padding: "12px 48px 32px",
  textAlign: "center" as const,
};

const h1 = {
  color: "#4e342e",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
};

const h2 = {
  color: "#795548",
  fontSize: "20px",
  fontWeight: "bold",
  borderBottom: "1px solid #efebe9",
  paddingBottom: "10px",
  marginTop: "0",
};

const subtitle = {
  color: "#8d6e63",
  fontSize: "16px",
  margin: "10px 0 0",
};

const section = {
  padding: "0 48px 24px",
};

const text = {
  color: "#4e342e",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "8px 0",
};

const paragraph = {
  color: "#5d4037",
  fontSize: "14px",
  lineHeight: "22px",
  fontStyle: "italic",
  backgroundColor: "#fff8e1",
  padding: "15px",
  borderRadius: "4px",
};

const image = {
  borderRadius: "75px",
  objectFit: "cover" as const,
  marginBottom: "10px",
};

const hr = {
  borderColor: "#efebe9",
  margin: "20px 0",
};
