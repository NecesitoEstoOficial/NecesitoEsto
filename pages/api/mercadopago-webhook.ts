import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Log de la llegada del webhook
      console.log('Webhook recibido:', req.body); // Esto te ayudará a ver qué datos está recibiendo

      const { type, data } = req.body;

      if (type === 'payment') {
        const paymentId = data.id;

        // Obtén los detalles del pago desde Mercado Pago
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_MP_ACCESS_TOKEN}`,
          },
        });

        const paymentData = await response.json();

        console.log('Pago recibido desde Mercado Pago:', paymentData); // Ver qué datos recibes desde Mercado Pago

        if (paymentData.status === 'approved' || paymentData.status === 'success') {
          const demandaId = parseInt(paymentData.external_reference, 10);

          // Extraer datos necesarios
          const { status: payment_status, transaction_amount, metadata: { demanda_id } = {} as { demanda_id?: number } } = paymentData; 

          if (isNaN(demandaId)) {
            console.error('El external_reference no es un número válido:', paymentData.external_reference);
            return res.status(400).json({ message: 'external_reference inválido.' });
          }

          // Buscar el registro en la tabla "pagos"
          const { data: existingPayment, error: fetchError } = await supabase
            .from('pagos')
            .select('*')
            .eq('demanda_id', demandaId)
            .order('fecha_pago', { ascending: false }) // Ordenar por fecha_pago descendente (el más reciente primero)
            .limit(1); // Tomar solo el más reciente

          if (fetchError) {
            console.error('Error buscando el registro de pago:', fetchError);
            return res.status(500).json({ message: 'Error buscando el registro de pago.' });
          }

          if (!existingPayment) {
            console.log('No se encontró un registro con demanda_id:', demandaId);
            return res.status(404).json({ message: 'Registro de pago no encontrado.' });
          }

          // Obtener el nombre del pagador
          const nombrePagador = existingPayment?.[0]?.nombre_pagador;

          // Actualizar el estado de pago en la tabla "pagos"
          const { error: updateError } = await supabase
            .from('pagos')
            .update({
              estado_pago: paymentData.status,
              id_preferencia: paymentData.preference_id,
              id_transaccion: paymentId,
            })
            .eq('demanda_id', demandaId);

          if (updateError) {
            console.error('Error actualizando el estado del pago:', updateError);
            return res.status(500).json({ message: 'Error actualizando el estado del pago.' });
          }

          // Ahora obtenemos los datos de la demanda
          const { data: demandaData, error: demandaError } = await supabase
            .from('demandas')
            .select('*')
            .eq('id', demandaId)
            .single();

          if (demandaError) {
            console.error('Error obteniendo datos de la demanda:', demandaError);
            return res.status(500).json({ message: 'Error obteniendo los datos de la demanda.' });
          }

          if (!demandaData) {
            console.log('No se encontró una demanda con id:', demandaId);
            return res.status(404).json({ message: 'Demanda no encontrada.' });
          }

          // Traer los nombres del rubro y la categoría
          const { data: rubroData, error: rubroError } = await supabase
            .from('rubros')
            .select('nombre')
            .eq('id', demandaData.rubro_id)
            .single();

          if (rubroError) {
            console.error('Error obteniendo el rubro:', rubroError);
            return res.status(500).json({ message: 'Error obteniendo el rubro.' });
          }

          const { data: categoriaData, error: categoriaError } = await supabase
            .from('categorias')
            .select('categoria')
            .eq('id', demandaData.id_categoria)
            .single();

          if (categoriaError) {
            console.error('Error obteniendo la categoría:', categoriaError);
            return res.status(500).json({ message: 'Error obteniendo la categoría.' });
          }

          // Configuración de nodemailer
          const transporter = nodemailer.createTransport({
            service: 'gmail', // Puedes usar el servicio que prefieras
            auth: {
              user: process.env.GMAIL_USER, // Tu correo electrónico de envío
              pass: process.env.GMAIL_PASSWORD, // Tu contraseña de correo electrónico o un app password
            },
          });

          // Obtener el correo del pagador desde los datos de la tabla "pagos"
          const correoPagador = existingPayment?.[0]?.correo_pagador;// Asegúrate de que 'correo_pagador' sea el campo correcto

          // Configuración del correo
          const mailOptions = {
            from: process.env.GMAIL_USER,
            to: correoPagador, // Usamos el correo de la demanda
            subject: `Pago aprobado para la demanda de Necesito Esto!`,
            html: `
              <p style="font-size: 18px; color: #333; font-weight: bold; background-color: #f0f8ff; padding: 10px; border-radius: 5px;">
                Hola ${nombrePagador},
              </p>

              <p>📌 El pago para la demanda: <strong>${demandaData.detalle}</strong> ha sido aprobado con éxito. Aquí están los detalles:</p>

              <ul style="list-style-type: none; padding: 0;">
                <li style="margin: 10px 0;"><strong>🏢 Empresa:</strong> ${demandaData.empresa}</li>
                <li style="margin: 10px 0;"><strong>👨‍💼 Responsable:</strong> ${demandaData.responsable_solicitud}</li>
                <li style="margin: 10px 0;"><strong>📧 Email:</strong> ${demandaData.email_contacto}</li>
                <li style="margin: 10px 0;"><strong>📞 Teléfono:</strong> ${demandaData.telefono}</li>
                <li style="margin: 10px 0;"><strong>🧩 Rubro Demanda:</strong> ${rubroData?.nombre || "No disponible"}</li>
                <li style="margin: 10px 0;"><strong>🏷️ Categoría:</strong> ${categoriaData?.categoria || "No disponible"}</li>
                <li style="margin: 10px 0;"><strong>🔎 Detalle de la demanda:</strong> ${demandaData.detalle}</li>
              </ul>

              <p style="font-size: 18px; color: #ff7f50; font-weight: bold;">
                ¡Gracias por usar nuestros servicios!
              </p>

              <p style="font-size: 20px; color: #333;">
                Necesito <span style="margin: 10px 0; color: #007bff; font-weight: bold;">Esto!</span>
              </p>
            `,
          };

          // Enviar el correo
          await transporter.sendMail(mailOptions);
          console.log('Correo de confirmación enviado correctamente.');

        } else {
          console.log('Estado de pago no es aprobado o exitoso:', paymentData.status);
        }
      }
      res.status(200).json({ message: 'Webhook procesado correctamente.' });
    } catch (error) {
      console.error('Error procesando el webhook:', error);
      res.status(500).json({ message: 'Error procesando el webhook.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
