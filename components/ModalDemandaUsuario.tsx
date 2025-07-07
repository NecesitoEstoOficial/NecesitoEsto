import React, { useState, useEffect } from "react";
import { updateDemanda } from "@/actions/demanda-actions";

export interface Demanda {
  id: number;
  detalle: string;
  rubro_id: string;
  empresa: string;
  telefono: string;
  pais_id: string;
  id_categoria: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  pais: { nombre: string; bandera_url: string }; // Nuevo campo
  categorias: { id: string; categoria: string }; // Nuevo campo
  rubros: { id: string; nombre: string }; // Nuevo campo
}

interface ModalDemandaUsuarioProps {
  demanda: Demanda;
  closeModal: () => void;
}

const ModalDemandaUsuario: React.FC<ModalDemandaUsuarioProps> = ({ demanda, closeModal }) => {
  const [detalle, setDetalle] = useState(demanda.detalle);
  const [empresa, setEmpresa] = useState(demanda.empresa);
  const [telefono, setTelefono] = useState(demanda.telefono);
  const [fecha_inicio, setFechaInicio] = useState(demanda.fecha_inicio);
  const [fecha_vencimiento, setFechaVencimiento] = useState(demanda.fecha_vencimiento);
  const [mensajeExito, setMensajeExito] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedDemanda: Demanda = {
      id: demanda.id,
      detalle,
      empresa,
      telefono,
      fecha_inicio,
      fecha_vencimiento,
      pais_id: demanda.pais_id, // Mantener el mismo ID
      id_categoria: demanda.id_categoria, // Mantener el mismo ID
      rubro_id: demanda.rubro_id, // Mantener el mismo ID
      pais: demanda.pais, // Mantener el mismo objeto país
      categorias: demanda.categorias, // Mantener el mismo objeto categoría
      rubros: demanda.rubros, // Mantener el mismo objeto rubro
    };

    try {
      await updateDemanda(updatedDemanda);

      // Mostrar mensaje de éxito
      setMensajeExito("Editado correctamente");

      // Esperar 2 segundos antes de cerrar el modal
      setTimeout(() => {
        setMensajeExito("");
        closeModal(); // Cerrar el modal después de mostrar el mensaje
      }, 2000);
    } catch (error) {
      console.error("Error al actualizar la demanda:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full sm:w-[90%] md:w-[80%] max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Editar Demanda</h2>

        {/* Mensaje de éxito */}
        {mensajeExito && (
          <div className="bg-green-100 text-green-800 p-2 rounded mb-4 text-center">
            {mensajeExito}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Detalle - Solo lectura */}
          <div>
            <label className="block font-medium">Detalle:</label>
            <input
              type="text"
              className="w-full p-2 border rounded bg-gray-100"
              value={detalle}
              readOnly // Hacer el campo de solo lectura
            />
          </div>

          {/* Empresa y Teléfono - Solo lectura */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Empresa:</label>
              <input
                type="text"
                className="w-full p-2 border rounded bg-gray-100"
                value={empresa}
                readOnly // Hacer el campo de solo lectura
              />
            </div>

            <div>
              <label className="block font-medium">Teléfono:</label>
              <input
                type="text"
                className="w-full p-2 border rounded bg-gray-100"
                value={telefono}
                readOnly // Hacer el campo de solo lectura
              />
            </div>
          </div>

          {/* País, Categoría y Rubro - Solo lectura */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium">País:</label>
              <input
                type="text"
                className="w-full p-2 border rounded bg-gray-100"
                value={demanda.pais.nombre} // Usar directamente el nombre del país
                readOnly // Hacer el campo de solo lectura
              />
            </div>

            <div>
              <label className="block font-medium">Categoría:</label>
              <input
                type="text"
                className="w-full p-2 border rounded bg-gray-100"
                value={demanda.categorias.categoria} // Usar directamente el nombre de la categoría
                readOnly // Hacer el campo de solo lectura
              />
            </div>

            <div>
              <label className="block font-medium">Rubro:</label>
              <input
                type="text"
                className="w-full p-2 border rounded bg-gray-100"
                value={demanda.rubros.nombre} // Usar directamente el nombre del rubro
                readOnly // Hacer el campo de solo lectura
              />
            </div>
          </div>

          {/* Fechas - Editables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Fecha Inicio:</label>
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={fecha_inicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-medium">Fecha Vencimiento:</label>
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={fecha_vencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row justify-between gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-400 text-white rounded w-full sm:w-auto"
              onClick={closeModal}
            >
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded w-full sm:w-auto">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalDemandaUsuario;