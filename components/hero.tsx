"use client";

import Image from 'next/image';
import React from 'react';
import { ChevronDownIcon  } from "@heroicons/react/24/solid";
import { useState, useEffect } from 'react';

export default function Hero() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative w-full">
      <div className="w-full h-[350px] md:h-[900px] relative overflow-hidden">
        <Image
          src="/banner.jpg"
          alt="Hero"
          fill
          className="object-cover object-center"
          quality={100}
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      <div className="absolute top-[60%] md:top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:-translate-y-1/2 text-white text-center w-full px-4">
        <h1 className="text-2xl md:text-4xl font-bold mb-4">
          ¡El Momento es Ahora!
        </h1>
        <p className="text-sm md:text-lg max-w-2xl mx-auto mb-4">
          Publica lo que estás necesitando y encuentra la mejor solución. NecesitoEsto te ayudara a que conozcan tu demanda!!
        </p>

        {/* Flechas animadas en móvil (más pequeñas y desplazadas) */}
        {!isScrolled && (
          <>
            {/* En móvil solo una flecha más pequeña y más abajo */}
            <div className="mt-12 flex justify-center items-center md:hidden">
              <ChevronDownIcon className="w-6 h-6 animate-bounce text-white" />
            </div>

            {/* En escritorio tres flechas apiladas */}
            <div className="mt-8 hidden md:flex flex-col justify-center items-center space-y-4">
              <ChevronDownIcon className="w-8 h-8 animate-bounce text-white" />
              <ChevronDownIcon className="w-8 h-8 animate-bounce text-white" />
              <ChevronDownIcon className="w-8 h-8 animate-bounce text-white" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}



