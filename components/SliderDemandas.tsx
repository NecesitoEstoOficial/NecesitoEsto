'use client';
import { useTheme } from "next-themes";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useState } from "react";
import ModalDetallesPago from "@/components/ModalDetallesPago";
import { MoveRight } from "lucide-react";
import Image from "next/image";

export default function SliderDemandas({ demandas, userId }: { demandas: any[]; userId: string | null }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [demandaSeleccionada, setDemandaSeleccionada] = useState<any>(null);
  const { theme } = useTheme();

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    appendDots: (dots: React.ReactNode) => (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "15px",
        }}
        className={theme === "dark" ? "text-white" : "text-black"} // Cambiar color según el tema
      >
        {dots}
      </div>
    ),
    nextArrow: (
      <div
        className={`custom-arrow ${
          theme === "dark" ? "text-white" : "text-black"
        }`}
      >
        ➡
      </div>
    ),
    prevArrow: (
      <div
        className={`custom-arrow ${
          theme === "dark" ? "text-white" : "text-black"
        }`}
      >
        ⬅
      </div>
    ),
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 600,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  const abrirModal = (demanda: any) => {
    setDemandaSeleccionada(demanda);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <div className="relative z-10 bg-white"> {/* Fondo sólido y z-index adecuado */}
        <Slider {...settings} className="gap-2 mr-4 mb-10">
          {demandas.length > 0 ? (
            demandas.map((demanda) => (
              <div key={demanda.id} className="mr-4 p-3">
                <div className="border border-solid border-slate-950 h-80 p-4 rounded-lg relative text-center">
                  <div className="flex items-center justify-between mb-4 flex-start">
                    <p className="text-lg font-semibold">[{demanda.id}] </p>
                    <h3 className="font-bold text-lg truncate">{demanda.detalle}</h3>
                    {demanda.pais && demanda.pais.bandera_url && (
                      <img
                        src={`${demanda.pais.bandera_url}`}
                        alt={`Bandera de ${demanda.pais.nombre}`}
                        className="w-5 h-3 ml-2"
                      />
                    )}
                  </div>
                  <p className="text-gray-700 flex flex-start">
                    <strong>Categoría:&nbsp;</strong> {demanda.categorias?.categoria || 'Sin categoría'}
                  </p>
                  <p className="text-gray-700 flex flex-start">
                    <strong>Rubro:&nbsp;</strong> {demanda.rubros?.nombre || "Sin rubro"}
                  </p>
                  <p className="flex flex-start">
                    <strong>Inicio:&nbsp; </strong>{" "}
                    {new Date(demanda.fecha_inicio).toLocaleDateString()}
                  </p>
                  <p className="flex flex-start">
                    <strong>Vencimiento:&nbsp; </strong>{" "}
                    {new Date(demanda.fecha_vencimiento).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => abrirModal(demanda)}
                    className="bg-blue-500 flex flex-start bottom-4 left-2 w-auto h-9 absolute mx-auto text-white text-center p-4 items-center rounded-lg hover:bg-blue-600"
                  >
                    Saber más
                  </button>
                  <img
                    src="/nuevo.png"
                    alt="Superposición"
                    className="absolute bottom-2 right-2 w-9 h-9 opacity-80 pointer-events-none"
                  />
                </div>
              </div>
            ))
          ) : (
            <p>No hay demandas disponibles.</p>
          )}
        </Slider>
      </div>

      {/* Renderizar el modal cuando sea necesario */}
      <ModalDetallesPago
        isOpen={modalOpen}
        onClose={cerrarModal}
        demanda={demandaSeleccionada}
        userId={userId}
      />
    </>
  );
}