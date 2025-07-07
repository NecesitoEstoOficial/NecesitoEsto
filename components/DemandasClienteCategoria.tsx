'use client';
import { useState } from "react";
import ModalDetallesPago from "@/components/ModalDetallesPago";

export default function DemandasClienteCategoria({
  demandas,
  idCategoria,
  userId,
}: {
  demandas: any[];
  idCategoria: number;
  userId: string | null;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [demandaSeleccionada, setDemandaSeleccionada] = useState(null);

  // Filtrar demandas según la categoría seleccionada
  const demandasFiltradas = demandas.filter(
    (demanda) => demanda.id_categoria === idCategoria
  );

  const abrirModal = (demanda: any) => {
    setDemandaSeleccionada(demanda);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {demandasFiltradas.length > 0 ? (
          demandasFiltradas.map((demanda) => (
            <div
              key={demanda.id}
              className="border border-slate-950 rounded-lg p-6 flex flex-col gap-4"
            >
              <h3 className="font-bold text-lg">{demanda.detalle}</h3>
              <p>
                <strong>Rubro:&nbsp; </strong> {demanda.rubro_demanda}
              </p>
              <p>
                <strong>Fecha de inicio:&nbsp; </strong>{" "}
                {new Date(demanda.fecha_inicio).toLocaleDateString()}
              </p>
              <p>
                <strong>Fecha de vencimiento:&nbsp; </strong>{" "}
                {new Date(demanda.fecha_vencimiento).toLocaleDateString()}
              </p>
              <button
                onClick={() => abrirModal(demanda)}
                className="bg-blue-500 text-white text-center py-2 rounded-lg hover:bg-blue-600"
              >
                Saber más
              </button>
            </div>
          ))
        ) : (
          <p>No hay demandas disponibles para esta categoría.</p>
        )}
      </div>

      {/* Renderizar el modal cuando sea necesario */}
      {demandaSeleccionada && ( <ModalDetallesPago isOpen={modalOpen} onClose={cerrarModal} demanda={demandaSeleccionada} userId={userId}/> )}
    </>
  );
}
