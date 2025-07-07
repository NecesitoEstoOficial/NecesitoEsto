"use client";

import { Suspense } from "react";
import { InitialProfileForm } from "@/components/CreateProfileForm";

export default function NewDemandPage() {
  return (
    <Suspense fallback={<div>Cargando formulario...</div>}>
      <InitialProfileForm />
    </Suspense>
  );
}