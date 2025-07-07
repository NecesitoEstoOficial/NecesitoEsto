import React from "react";

export default function Nosotros() {
  return (
    <div className="container mx-auto px-4 py-12 mt-20 mb-20 pb-20">
      {/* Título principal */}
      <h1 className="text-4xl font-bold text-center mb-8">
        Conoce Más Sobre Nosotros
      </h1>

      {/* Texto informativo */}
      <div className="max-w-4xl mx-auto text-lg text-gray-700">
        <p className="mb-6">
        En nuestra empresa, nos dedicamos a ofrecer soluciones innovadoras y de alta calidad para nuestros clientes. Con años de experiencia en el sector industrial, trabajamos para brindar los mejores productos y servicios. Nos enfocamos en la satisfacción del cliente y en la mejora continua, buscando siempre las mejores prácticas y las tecnologías más avanzadas
        </p>
        <p className="mb-6">
          Nuestra misión es transformar ideas en soluciones concretas que ayuden a nuestros clientes a alcanzar sus objetivos.
        </p>
        <p>
          En este sentido la creación de la nueva plataforma “Necesito Esto” permitirá agilizar en las empresas las gestiones al momento de satisfacer necesidades y ser una herramienta útil disponible en su ámbito de trabajo.
        </p>
        <p>
          Además, valoramos la transparencia, la honestidad y la responsabilidad en todos nuestros procesos.
          Nos aseguramos de que cada uno de nuestros clientes reciba un servicio personalizado, adaptado a sus necesidades. Gracias a esto, hemos logrado construir relaciones de confianza duraderas con nuestros socios y clientes, quienes nos eligen una y otra vez.        
        </p>
      </div>
    </div>
  );
}
