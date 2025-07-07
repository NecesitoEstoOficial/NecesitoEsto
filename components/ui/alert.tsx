// components/ui/alert.tsx
import React, { useState } from "react";

interface AlertProps {
  variant?: "default" | "destructive" | "success";
  title: string;
  description: string;
  onClose?: () => void; // Función para cerrar la alerta
}

export const Alert: React.FC<AlertProps> = ({ variant = "default", title, description, onClose }) => {
  const [isVisible, setIsVisible] = useState(true); // Estado para controlar la visibilidad

  if (!isVisible) return null; // Si no está visible, no renderiza nada

  let backgroundColor, borderColor, textColor;

  switch (variant) {
    case "destructive":
      backgroundColor = "bg-red-50";
      borderColor = "border-red-400";
      textColor = "text-red-700";
      break;
    case "success":
      backgroundColor = "bg-green-50";
      borderColor = "border-green-400";
      textColor = "text-green-700";
      break;
    default:
      backgroundColor = "bg-blue-50";
      borderColor = "border-blue-400";
      textColor = "text-blue-700";
      break;
  }

  const handleClose = () => {
    setIsVisible(false); // Oculta la alerta
    if (onClose) onClose(); // Llama a la función onClose si está definida
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className={`p-6 border rounded-lg shadow-lg ${backgroundColor} ${borderColor} ${textColor}`}>
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="mt-2">{description}</p>
        <button
          onClick={handleClose}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          OK
        </button>
      </div>
    </div>
  );
};