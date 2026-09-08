export type EmailConfig = {
  enabled: boolean;
  serviceId: string;
  templateId: string;
  publicKey: string;
};
export type Inquiry = {
  name: string;
  email: string;
  phone: string;
  message: string;
  area: string;
  kind: string;
  title: string;
  price: string;
  zone: string;
  url: string;
};

export function emailPayload(config: EmailConfig, inquiry: Inquiry) {
  return {
    service_id: config.serviceId,
    template_id: config.templateId,
    user_id: config.publicKey,
    template_params: {
      nombre: inquiry.name,
      email: inquiry.email,
      telefono: inquiry.phone,
      mensaje: `[${inquiry.kind}]\n${inquiry.message}${inquiry.area ? `\nZona de la vivienda: ${inquiry.area}` : ''}`,
      propiedad: inquiry.title || inquiry.kind,
      precio: inquiry.price,
      zona: inquiry.zone || inquiry.area,
      url: inquiry.url,
    },
  };
}

export async function sendInquiry(
  config: EmailConfig,
  inquiry: Inquiry,
  request: typeof fetch = fetch,
) {
  if (!config.enabled) throw new Error('Contact disabled');
  const response = await request(
    'https://api.emailjs.com/api/v1.0/email/send',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload(config, inquiry)),
      signal: AbortSignal.timeout(15000),
    },
  );
  if (!response.ok) throw new Error('Send failed');
}
