"use client"

import { useRouter } from 'next/navigation';
import "./success.css";


const SuccessPage = () => {
  const router = useRouter();

  const goToHome = () => {
    router.push('/');  // Redirige al inicio de la aplicación
  };

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-home"
          >
            <path d="M3 9l9-7 9 7v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <h1>¡Pago Exitoso!</h1>
        <p className='color'>El pago ha sido procesado correctamente. Se han enviado los detalles de la demanda a su correo electrónico.</p>
        <button onClick={goToHome} className="go-home-btn">
          Ir al Inicio
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;

