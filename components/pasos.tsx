const pasos = [
  {
    id: 1,
    imgSrc: "/pasos/paso1.png", // Ruta de la imagen de conversación
    title: "Publica Gratis lo que Necesitas",
    description:
      "Detalla tu demanda de forma clara y precisa para que las búsquedas de las personas o empresas que tengan la posibilidad de satisfacer tu necesidad puedan contactarse en forma directa y acercar una propuesta que sea la solución que estás buscando."
  },
  {
    id: 2,
    imgSrc: "/pasos/paso2.png", // Ruta de la imagen de documentos
    title: "Búsqueda de posibles candidatos que puedan satisfacer tu demanda.",
    description:
      "Tu demanda será publicada en distintos medios, redes sociales, empresas y prestadores de servicios, buscando quienes puedan satisfacer tu demanda. Realizando el interesado un único pago por oferta, le enviamosla información del representante para que se contacte en forma directa y ofrezca su solución o cotización."
  },
  {
    id: 3,
    imgSrc: "/pasos/paso3.png", // Ruta de la imagen de usuario con check
    title: "Generación del Negocio",
    description:
      "Interesado por la demanda, se envía la información del responsable de la publicación al interesado para que este realice el contacto directo comenzando la espectiva negociación. (Detalles, precios, presupuestos, etc.) La plataforma solo llevará estadisticas de conformidad entre la partes, no interviniendo en las negociacionesque puedan realizarse."
  }
];


export default function Pasos() {
  return (
    <section className="text-center py-20"> {/* Sección más grande con padding */}
      <h2 className="text-3xl font-semibold text-gray-800 mb-6"> {/* Título más grande */}
        CUAL ES EL FUNCIONAMIENTO DE  "NECESITO <span className="text-blue-700">ESTO!</span>"?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
        {pasos.map((paso) => (
          <div key={paso.id} className="flex flex-col items-center text-center">
            {/* Imagen de 250px x 250px */}
            <div className="mb-6">
              <img
                src={paso.imgSrc}
                alt={paso.title}
                className="w-[300px] h-[300px] object-contain" // Imagen más grande
              />
            </div>
            <h3 className="text-lg font-bold text-teal-600 mb-2">{paso.title}</h3>
            <p className="text-gray-600 max-w-sm">{paso.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
