"use client";

import { Suspense } from "react";
import { CreateDemandForm } from "@/components/CreateDemandForm";

export default function NewDemandPage() {
  return (
    <Suspense fallback={<div>Cargando formulario...</div>}>
      <CreateDemandForm />
    </Suspense>
  );
}