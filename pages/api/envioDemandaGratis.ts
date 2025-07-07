import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

// Inicializar Supabase con las credenciales públicas
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const { idDemanda, detalle, rubroNombre, categoriaNombre, nombrePagador, correoPagador } = req.body;

    if (!idDemanda) {
      return res.status(400).json({ message: 'ID de demanda es requerido' });
    }

    // Obtener datos de la demanda desde Supabase
    const { data: demandaData, error } = await supabase
        .from('demandas')
        .select(`
        id, 
        empresa, 
        responsable_solicitud, 
        email_contacto, 
        telefono, 
        detalle
        `)
        .eq('id', idDemanda)
        .single();

    if (error || !demandaData) {
      return res.status(404).json({ message: 'Demanda no encontrada' });
    }

    // Configurar Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    // Configurar el correo
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: correoPagador,
      subject: `✅ Pago aprobado para la demanda de Necesito Esto!`,
      html: `
        <p style="font-size: 18px; color: #333; font-weight: bold; background-color: #f0f8ff; padding: 10px; border-radius: 5px;">
          Hola ${nombrePagador},
        </p>

        <p>📌 El pago para la demanda: <strong>${detalle}</strong> ha sido aprobado con éxito. Aquí están los detalles:</p>

        <ul style="list-style-type: none; padding: 0;">
          <li style="margin: 10px 0;"><strong>🏢 Empresa:</strong> ${demandaData.empresa}</li>
          <li style="margin: 10px 0;"><strong>👨‍💼 Responsable:</strong> ${demandaData.responsable_solicitud}</li>
          <li style="margin: 10px 0;"><strong>📧 Email:</strong> ${demandaData.email_contacto}</li>
          <li style="margin: 10px 0;"><strong>📞 Teléfono:</strong> ${demandaData.telefono}</li>
          <li style="margin: 10px 0;"><strong>🧩 Rubro Demanda:</strong> ${rubroNombre || "No disponible"}</li>
          <li style="margin: 10px 0;"><strong>🏷️ Categoría:</strong> ${categoriaNombre || "No disponible"}</li>
          <li style="margin: 10px 0;"><strong>🔎 Detalle de la demanda:</strong> ${detalle}</li>
        </ul>

        <p style="font-size: 18px; color: #ff7f50; font-weight: bold;">
          ¡Gracias por usar nuestros servicios!
        </p>

        <p style="font-size: 20px; color: #333;">
          Necesito <span style="margin: 10px 0; color: #007bff; font-weight: bold;">Esto!</span>
        </p>

        <br />
        
        <p>¡No reenviar este mail!</p>
      `,
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);
    console.log('Correo enviado correctamente.');

    // Insertar registro en la tabla pagos
    const { error: pagoError } = await supabase.from('pagos').insert([
      {
        demanda_id: idDemanda,
        detalle_demanda: detalle,
        nombre_pagador: nombrePagador,
        correo_pagador: correoPagador,
        numero_pago: null, // Dejar vacío
        monto: 0.00,
        fecha_pago: new Date().toISOString(),
        estado_pago: 'aprobado',
        metodo_pago: 'Gratis',
        id_transaccion: null, // Puede ser null si no se usa
        moneda: 'USD', // O la moneda que estés manejando
      },
    ]);

    if (pagoError) {
      console.error('Error insertando el pago:', pagoError);
      return res.status(500).json({ message: 'Error registrando el pago' });
    }

    res.status(200).json({ message: 'Correo enviado correctamente' });

  } catch (error) {
    console.error('Error procesando la solicitud:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}
