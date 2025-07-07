// components/table-query.tsx
"use client";

import React from 'react';
import Link from "next/link";
import Image from 'next/image';

interface Categoria {
  id: number;
  nombre: string;
  bandera_url: string;
}

export default function Table({ paises }: { paises: Categoria[] }) {
  if (!paises || paises.length === 0) {
    return <div>No hay categorías para mostrar.</div>;
  }

  return (
    <section className="py-12 w-full flex justify-center">
        <div className="w-full max-w-screen-xl text-center">
            <h2 className="text-3xl font-bold mb-8">
            Necesito <span className="azul">!Esto</span> también en otros países
            </h2>
            <div className="flex flex-wrap justify-center gap-8">
            {paises.map((paises) => (
                <Link key={paises.id} href={`/`} className="flex items-center gap-2">
                <img
                    src={`${paises.bandera_url}`}
                    alt={paises.nombre}
                    className="w-5 h-3"
                />
                <p className="text-lg font-semibold">{paises.nombre}</p>
                </Link>
            ))}
            </div>
        </div>
    </section>


  );
}
