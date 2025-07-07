// components/AlertaBienvenida.tsx

"use client";

import React from "react";
import { useRouter } from "next/navigation";

const AlertaBienvenida = ({ onClose }: { onClose: () => void }) => {

    const router = useRouter();

    const handleContinuar = () => {
        router.push("/"); // Redirige a la página principal
    };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col justify-center items-center z-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md">
        <h1 className="text-3xl font-bold mb-4">¡Bienvenido!</h1>
        <p className="text-lg mb-6">Tu información se guardó correctamente. Estás listo para comenzar.</p>
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          onClick={handleContinuar}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default AlertaBienvenida;
