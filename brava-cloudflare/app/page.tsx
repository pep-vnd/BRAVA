import Home from '@/components/brava-home';
import { getCatalog } from '@/lib/dato-server';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const catalog = await getCatalog();
  const serviceId = process.env.EMAILJS_SERVICE_ID || '';
  const templateId = process.env.EMAILJS_TEMPLATE_ID || '';
  const publicKey = process.env.EMAILJS_PUBLIC_KEY || '';
  return (
    <Home
      catalog={catalog}
      emailConfig={{
        enabled:
          process.env.CONTACT_ENABLED === 'true' &&
          !!serviceId &&
          !!templateId &&
          !!publicKey,
        serviceId,
        templateId,
        publicKey,
      }}
    />
  );
}
