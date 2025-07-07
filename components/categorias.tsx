// components/table-query.tsx
"use client";

import React from 'react';
import Link from "next/link";
import Image from "next/image";

interface Categoria {
  id: number;
  categoria: string;
  imagen: string;
}

export default function Table({ categorias }: { categorias: Categoria[] }) {
  if (!categorias || categorias.length === 0) {
    return <div>No hay categorías para mostrar.</div>;
  }

  return (
    <section className="py-12  w-full flex justify-center">
      <div className="w-full max-w-screen-xl text-center">
        {/*<h2 className="text-3xl font-bold mb-8">Categorías</h2>*/}
        <div className="flex flex-wrap justify-center gap-8">
          {categorias.map((categoria) => (
            <div key={categoria.id} className="flex flex-col items-center p-4">
              <Link href={`/`}>
                <img
                  src={`${categoria.imagen}`}
                  alt={categoria.categoria}
                  className="w-24 h-24 object-cover rounded-md transition-transform transform hover:scale-105"
                />
              </Link>
              <p className="mt-4 text-lg font-semibold">{categoria.categoria}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
