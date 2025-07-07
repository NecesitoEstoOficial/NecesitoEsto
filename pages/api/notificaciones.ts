import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/utils/supabase/client';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
    console.error('Faltan configurar las credenciales de Gmail.');
    return res.status(500).json({ message: 'Error de configuración del servidor' });
  }

  const today = new Date();
  const twoDaysLater = new Date();
  twoDaysLater.setDate(today.getDate() + 2);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const supabase = createClient();
  const { data: demandas, error } = await supabase
    .from('demandas')
    .select('id, detalle, fecha_vencimiento, email_contacto')
    .gte('fecha_vencimiento', formatDate(today))
    .lt('fecha_vencimiento', formatDate(twoDaysLater));

  if (error) {
    console.error('Error al obtener demandas:', error);
    return res.status(500).json({ message: 'Error al obtener demandas', error });
  }

  if (!demandas || demandas.length === 0) {
    return res.status(204).end();
  }

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  console.log(`Procesando ${demandas.length} demandas.`);

  for (const demanda of demandas) {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: demanda.email_contacto,
      subject: 'Tu demanda está por vencer',
      text: `Hola, tu demanda "${demanda.detalle}" está por vencer en 2 días. Te recomendamos renovar la fecha para que siga activa y aparezca en el portal demandas, puedes editar la fecha o bien eliminar la demanda si ya no es necesaria; Quedamos atentos a satisfacer tus necesidades. ¡No reenviar este mail!`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Correo enviado a ${demanda.email_contacto}`);
    } catch (error) {
      console.error(`Error al enviar correo a ${demanda.email_contacto}:`, error);
    }
  }

  return res.status(200).json({ message: 'Correos enviados con éxito' });
}