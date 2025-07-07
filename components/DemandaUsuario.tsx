import { useEffect, useState } from 'react';
import { fetchDemandas, deleteDemanda  } from '@/actions/demanda-actions'; // Ajusta la ruta a tu función
import  ModalDemandaUsuario  from '@/components/ModalDemandaUsuario'; // Ajusta la ruta a tu función
import Link from 'next/link';
import Swal from "sweetalert2"; // Importamos SweetAlert2
import { PencilIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid'; // Asegúrate de importar los íconos

const DemandaUsuario = ({ userId }: { userId: string }) => {
  const [demandas, setDemandas] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDemanda, setSelectedDemanda] = useState<any | null>(null);

  // Fetch demandas al montar el componente
  useEffect(() => {
    const getDemandas = async () => {
      const data = await fetchDemandas(userId);
      setDemandas(data);
    };

    getDemandas();
  }, [userId]);

  const handleEdit = (demanda: any) => {
    setSelectedDemanda(demanda);
    setIsModalOpen(true);
  };

  // Recargar las demandas después de la edición o eliminación
  const reloadDemandas = async () => {
    const data = await fetchDemandas(userId);
    setDemandas(data);
  };

  const handleDelete = async (demandaId: string) => {
    // Mostrar alerta de confirmación
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción ocultará la demanda, pero no eliminará los pagos asociados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
  
    // Si el usuario confirma, proceder con la eliminación
    if (result.isConfirmed) {
      const success = await deleteDemanda(demandaId); // Llamamos a la función para cambiar el estado
  
      if (success) {
        // Mostrar mensaje de éxito
        Swal.fire({
          title: "Eliminado",
          text: "La demanda ha sido eliminada correctamente.",
          icon: "success",
          timer: 2000,
        });
  
        // Recargar la lista de demandas
        reloadDemandas();
      } else {
        // Mostrar mensaje de error si hubo un problema
        Swal.fire({
          title: "Error",
          text: "Hubo un problema al eliminar la demanda. Intenta de nuevo.",
          icon: "error",
        });
      }
    }
  };

  return (
    <div className="flex flex-col items-center pb-5 mt-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Mis Demandas</h2>
      

      {demandas.length === 0 ? (
        <p className="text-lg text-gray-600">No tienes demandas creadas aún.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {demandas.map((demanda) => {
            const fechaVencimiento = new Date(demanda.fecha_vencimiento);
            const hoy = new Date();
            const diferenciaDias = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

            let advertencia = null;
            if (diferenciaDias < 0) {
              advertencia = "Demanda vencida. Renueva la fecha para que aparezca en el portal de demandas.";
            } else if (diferenciaDias <= 2) {
              advertencia = "La demanda está por vencer. Renueva la fecha editando la demanda.";
            }

            return (
              <div key={demanda.id} className="bg-white shadow-lg rounded-xl p-5 border border-gray-200 hover:shadow-xl transition duration-300 flex flex-col h-[300px]">
                <p className="text-lg font-semibold">[{demanda.id}] </p>
                <h3 className="text-lg font-semibold text-gray-800 truncate">{demanda.detalle}</h3>
                <p className="text-gray-500 text-sm">Categoría: {demanda.categorias?.categoria || "Sin Categoría"}</p>
                <p className="text-gray-500 text-sm">Rubro: {demanda.rubros?.nombre || "Sin Rubro"}</p>
                <p className="text-gray-500 text-sm">Empresa: {demanda.empresa}</p>
                <p className="text-gray-500 text-sm">Vencimiento: {fechaVencimiento.toLocaleDateString()}</p>

                {advertencia && (
                  <div className="mt-2 bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-5 w-5" />
                    <span className="text-sm">{advertencia}</span>
                  </div>
                )}

                <div className="flex justify-between mt-auto">
                  <button
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                    onClick={() => handleEdit(demanda)}
                  >
                    <PencilIcon className="h-5 w-5" /> Editar
                  </button>
                  <button
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition duration-300"
                    onClick={() => handleDelete(demanda.id)}
                  >
                    <TrashIcon className="h-5 w-5" /> Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Link href="/demandas/new">
        <button className="mt-6 bg-green-600 text-white text-lg px-6 py-3 rounded-lg shadow-md hover:bg-green-700 transition duration-300">
          + Crear Nueva Demanda
        </button>
      </Link>

      {isModalOpen && selectedDemanda && (
        <ModalDemandaUsuario demanda={selectedDemanda} closeModal={() => { setIsModalOpen(false); reloadDemandas(); }} />
      )}
    </div>
  );
};

export default DemandaUsuario;
