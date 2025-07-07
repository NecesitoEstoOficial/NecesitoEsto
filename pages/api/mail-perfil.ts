import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { nombre, apellido, email } = req.body;

  if (!nombre || !email) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  // Validar formato del correo electrónico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Correo electrónico inválido' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email, // Enviar al usuario, no a ti mismo
      subject: `⚠️ Actualización de perfil en Necesito Esto! `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Estimado/a ${nombre} ${apellido || ''}</h2>
          <p>Le informamos que se han realizado cambios en su perfil.</p>
          <p style="color: #ef4444; font-weight: bold;">
            Si no ha realizado estos cambios, por favor contacte con nuestro soporte inmediatamente.
          </p>
          <p>Atentamente,</p>
          <p>El equipo de Necesito Esto!</p>
          <br />
          <p>¡No reenviar este mail!</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Correo enviado con éxito' });
  } catch (error) {
    console.error('Error enviando correo:', error);
    res.status(500).json({ message: 'Error enviando el correo' });
  }
}