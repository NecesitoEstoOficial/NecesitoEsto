// pages/api/bienvenida.ts

import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { nombre, email } = req.body;

  if (!nombre || !email) {
    return res.status(400).json({ message: 'Faltan datos del usuario' });
  }

  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
    console.error('Faltan configurar las credenciales de Gmail.');
    return res.status(500).json({ message: 'Error de configuración del servidor' });
  }

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Necesito Esto™" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: '🎉 ¡Bienvenido a Necesito Esto™!',
    html: `
      <h2>Hola ${nombre},</h2>
      <p>¡Gracias por unirte a <strong>Necesito Esto™</strong>!</p>
      <p>Estamos felices de tenerte a bordo. Queremos darte un obsequio especial:</p>
      <ul>
        <li><strong>Todas tus demandas serán publicadas de forma totalmente gratuita.</strong></li>
        <li><strong>También podrás contactar gratuitamente a quienes buscan soluciones como las que tú ofreces.</strong></li>
      </ul>
      <p>Es una gran oportunidad para hacer crecer tu negocio y conectar con nuevos clientes de forma fácil y segura.</p>
      <p>Desde ya, te deseamos mucho éxito en tu camino con nosotros.</p>
      <p><em>El equipo de Necesito Esto™</em></p>
      <hr />
      <p style="font-size: 12px; color: gray;">Por favor, no respondas este correo. Si tienes dudas, contactanos a <a href="mailto:necesito.esto.2024@gmail.com">necesito.esto.2024@gmail.com</a>.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Correo de bienvenida enviado a ${email}`);
    return res.status(200).json({ message: 'Correo de bienvenida enviado con éxito' });
  } catch (error) {
    console.error(`Error al enviar el correo de bienvenida:`, error);
    return res.status(500).json({ message: 'Error al enviar el correo de bienvenida', error });
  }
}
