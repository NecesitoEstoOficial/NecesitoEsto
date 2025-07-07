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
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(today.getDate() - 2);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const supabase = createClient();
  
  // Obtener demandas vencidas hace más de 2 días
  const { data: demandasVencidas, error: fetchError } = await supabase
    .from('demandas')
    .select('id, detalle, fecha_vencimiento, email_contacto')
    .lt('fecha_vencimiento', formatDate(twoDaysAgo));

  if (fetchError) {
    console.error('Error al obtener demandas vencidas:', fetchError);
    return res.status(500).json({ message: 'Error al obtener demandas vencidas', error: fetchError });
  }

  if (!demandasVencidas || demandasVencidas.length === 0) {
    return res.status(200).json({ message: 'No hay demandas vencidas para eliminar' });
  }

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  console.log(`Procesando ${demandasVencidas.length} demandas vencidas.`);

  let deletedCount = 0;
  let emailErrors = 0;

  for (const demanda of demandasVencidas) {
    try {
      // Eliminar la demanda
      const { error: deleteError } = await supabase
        .from('demandas')
        .delete()
        .eq('id', demanda.id);

      if (deleteError) {
        console.error(`Error al eliminar demanda ${demanda.id}:`, deleteError);
        continue;
      }

      deletedCount++;

      // Enviar correo de notificación
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: demanda.email_contacto,
        subject: 'Tu demanda ha sido eliminada',
        html: `
          <p>Hola,</p>
          <p>Tu demanda "<strong>${demanda.detalle}</strong>" con fecha de vencimiento <strong>${demanda.fecha_vencimiento}</strong> ha sido eliminada automáticamente del sistema por haber superado el período de gracia de 2 días después de su vencimiento.</p>
          <p>Si aún necesitas registrar esta demanda, puedes crear una nueva sin problemas en nuestro portal.</p>
          <p>Quedamos atentos a satisfacer tus necesidades.</p>
          <p><em>¡No reenviar este mail!</em></p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Demanda ${demanda.id} eliminada y correo enviado a ${demanda.email_contacto}`);
    } catch (error) {
      emailErrors++;
      console.error(`Error al procesar demanda ${demanda.id}:`, error);
    }
  }

  return res.status(200).json({ 
    message: 'Proceso completado', 
    totalDemandas: demandasVencidas.length,
    eliminadas: deletedCount,
    erroresEmail: emailErrors
  });
}