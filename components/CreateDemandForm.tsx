"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { createDemandAction, getCategorias, getPaises, getRubros } from "@/actions/demanda-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from "react-select";
import { Alert } from "@/components/ui/alert";
import dynamic from 'next/dynamic';
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import { useRouter } from "next/navigation";


// Carga dinámica del DatePicker para evitar problemas SSR
const DatePicker  = dynamic(
  () => import('react-date-picker').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => <input type="text" className="border p-2" disabled value="Cargando selector de fecha..." />
  }
);


type CreateDemandResponse = {
  success: boolean;
  message: string;
};

export function CreateDemandForm() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [paises, setPaises] = useState<any[]>([]);
  const [rubros, setRubros] = useState<any[]>([]);
  const [demand, setDemand] = useState<any>({
    empresa: "",
    responsable_solicitud: "",
    email_contacto: "",
    telefono: "",
    fecha_inicio: "",
    fecha_vencimiento: "",
    detalle: "",
    profile_id: "",
    id_categoria: "",
    pais_id: "",
    rubro: "",
  });
  const [loading, setLoading] = useState(true);
  const [customCategoria, setCustomCategoria] = useState("");
  const [isCustomCategoria, setIsCustomCategoria] = useState(false);
  const [customRubro, setCustomRubro] = useState("");
  const [isCustomRubro, setIsCustomRubro] = useState(false);
  const [checkedTerminos, setCheckedTerminos] = useState(false);
  const router = useRouter();


  useEffect(() => {
    console.log("Estado actualizado:", status, success);
  }, [status, success]);

  useEffect(() => {
    if (searchParams) {
      const statusParam = searchParams.get("status");
      const successParam = searchParams.get("success");

      if (statusParam && successParam) {
        setStatus(statusParam);
        setSuccess(decodeURIComponent(successParam));
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
  
      if (error) {
        return (
          <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
            {error.message}
          </div>
        );
      }
  
      if (user) {
        // 1. Obtener el perfil (incluyendo pais_id)
        const { data: profileData, error: profileError } = await supabase
          .from("profile")
          .select("*")
          .eq("id", user.id)
          .single();
  
        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else {
          setProfile(profileData || {});

          // Verificar el estado de los términos y condiciones
          const isTerminosAceptados = profileData?.terminos === true;
          setCheckedTerminos(isTerminosAceptados);
  
          // 2. Obtener el nombre del país SOLO si el perfil tiene pais_id
          let nombrePais = "País no especificado";
          if (profileData?.pais_id) {
            const { data: paisData, error: paisError } = await supabase
              .from("pais")
              .select("nombre")
              .eq("id", profileData.pais_id)
              .single();
            
            if (!paisError && paisData) {
              nombrePais = paisData.nombre;
            }
          }
  
          // 3. Actualizar el estado "demand" con todos los datos
          setDemand((prev: any) => ({
            ...prev,
            profile_id: user.id,
            responsable_solicitud: `${profileData.nombre || ""} ${profileData.apellido || ""}`.trim(),
            email_contacto: profileData.email || "",
            telefono: profileData.telefono || "",
            empresa: profileData.empresa || "",
            pais_id: profileData.pais_id || "",
            nombre_pais: nombrePais, // Nuevo campo para mostrar el nombre
          }));
        }
        setUser(user);
      }
      setLoading(false);
    };

    const fetchPaises = async () => {
      try {
        const paisesData = await getPaises();
        setPaises(paisesData);
      } catch (error) {
        console.error("Error al obtener países:", error);
      }
    };

    const fetchCategorias = async () => {
      try {
        const categoriasData = await getCategorias();
        // Ordenar alfabeticamente por la propiedad 'categoria'
        const categoriasOrdenadas = categoriasData.sort((a, b) =>
          a.categoria.localeCompare(b.categoria)
        );
        setCategorias(categoriasOrdenadas);
      } catch (error) {
        console.error("Error al obtener categorías:", error);
      }
    };
    

    const fetchRubros = async () => {
      try {
        const rubrosData = await getRubros();
        // Ordenar alfabeticamente por la propiedad 'nombre'
        const rubrosOrdenados = rubrosData.sort((a, b) =>
          a.nombre.localeCompare(b.nombre)
        );
        setRubros(rubrosOrdenados);
      } catch (error) {
        console.error("Error al obtener rubros:", error);
      }
    };
    

    fetchRubros();
    fetchPaises();
    fetchCategorias();
    fetchUser();
  }, []);

  if (loading) {
    return <p className="text-2xl font-bold mb-4 text-black text-center">Cargando Formulario de Crear Necesidad...</p>;
  }

  const isVencimientoValido = () => {
    const inicio = new Date(demand.fecha_inicio);
    const vencimiento = new Date(demand.fecha_vencimiento);
  
    // Diferencia en milisegundos
    const diff = vencimiento.getTime() - inicio.getTime();
    const diffDias = diff / (1000 * 60 * 60 * 24); // Convertir a días
  
    return diffDias >= 30;
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckedTerminos(e.target.checked);
  };
  

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDemand((prev: any) => ({
      ...prev,
      [name]: name === "id_categoria" || name === "pais_id" ? parseInt(value) : value,
    }));
  };

  const handleDemandChange = (key: string, value: any) => {
    let formattedValue = value;

    // Si el valor es un objeto Date, conviértelo a una cadena en formato YYYY-MM-DD
    if (value instanceof Date) {
      formattedValue = value.toISOString().split("T")[0];
    }

    setDemand((prev: any) => ({
      ...prev,
      [key]: formattedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setSuccess(null);


    // Validar si el checkbox de términos y condiciones está marcado
    if (!checkedTerminos) {
      setStatus("error");
      setSuccess("Debes aceptar los términos y condiciones para poder crear la demanda.");
      return;
    }

    // Validar la fecha de vencimiento
    if (!isVencimientoValido()) {
      setStatus("error");
      setSuccess("La fecha de vencimiento debe ser al menos 30 días después de la fecha de inicio.");
      return;
    }

    try {
      const response: CreateDemandResponse = await createDemandAction(demand);
      console.log("Respuesta del servidor:", response);

      if (response.success) {
        setStatus("success");
        setSuccess(
          "Su demanda fue creada correctamente y pasará a evaluarse. " +
          "En unos minutos recibirá un correo electrónico con el resultado de la evaluación."
        );

        // Redirigir después de 2.5 segundos
        setTimeout(() => {
          router.push("/demandas"); // Ajusta esta ruta a donde quieres llevar al usuario
        }, 2500);
      } else {
        setStatus("error");
        setSuccess(response.message || "Error al crear la demanda.");
      }
    } catch (error) {
      setStatus("error");
      setSuccess("Hubo un problema al procesar la solicitud.");
      console.error("Error en la solicitud:", error);
    }
  };

  return (
    <>
      <div>
        {status && success && (
          <Alert
            variant={status === "success" ? "success" : "destructive"}
            title={status === "success" ? "Éxito" : "Error"}
            description={success}
            onClose={() => {
              setStatus(null);
              setSuccess(null);
              setDemand({
                empresa: "",
                responsable_solicitud: "",
                email_contacto: "",
                telefono: "",
                fecha_inicio: "",
                fecha_vencimiento: "",
                detalle: "",
                profile_id: user?.id || "",
                id_categoria: "",
                pais_id: "",
                rubro: "",
              });
              setCustomRubro("");
              setIsCustomRubro(false);
            }}
          />
        )}
      </div>

      <form
        className="flex flex-col max-w-3xl mx-auto mt-20"
        method="post"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="empresa">Empresa</Label>
          <Input
            className="border border-solid border-slate-950"
            name="empresa"
            value={demand.empresa || "Completar datos de perfil para que aparezcan aquí"}
            readOnly 
          />

          <Label htmlFor="pais">País</Label>
          <Input
            name="pais"
            value={demand.nombre_pais || "Cargando..."}
            readOnly
            className="border border-solid border-slate-950 bg-gray-100"
          />

          <Label htmlFor="responsable_solicitud">Responsable de la solicitud</Label>
          <Input
            name="responsable_solicitud"            
            value={demand.responsable_solicitud || "Completar datos de perfil para que aparezcan aquí"}
            readOnly 
            className="border border-solid border-slate-950"
          />

          <Label htmlFor="email_contacto">Email de contacto</Label>
          <Input
            name="email_contacto"
            type="email"
            value={profile?.email || "Completar datos de perfil para que aparezcan aquí"}
            readOnly 
            className="border border-solid border-slate-950"
          />

          <Label htmlFor="telefono">Teléfono de contacto</Label>
          <Input
            name="telefono"
            type="tel"
            value={demand.telefono || "Completar datos de perfil para que aparezcan aquí"}
            readOnly 
            className="border border-solid border-slate-950"
          />

          <Label htmlFor="fecha_inicio">Fecha de inicio</Label>
          <DatePicker
            onChange={(date) => handleDemandChange("fecha_inicio", date)}
            value={demand.fecha_inicio ? new Date(demand.fecha_inicio) : null}
            className="border border-solid border-slate-950"
          />

          <Label htmlFor="fecha_vencimiento">Fecha de vencimiento</Label>
          <DatePicker
            onChange={(value) => handleDemandChange("fecha_vencimiento", value)}
            value={demand.fecha_vencimiento ? new Date(demand.fecha_vencimiento) : null}
            className="border"
            minDate={demand.fecha_inicio ? new Date(new Date(demand.fecha_inicio).getTime() + 30 * 24 * 60 * 60 * 1000) : new Date()}
          />


          <Label htmlFor="id_categoria">Categoría <strong className="text-gray-400 text-x">(Selecciona o crea una nueva)</strong></Label>
          <Select
            name="id_categoria"
            options={[
              ...categorias.map((categoria) => ({ 
                value: categoria.id, 
                label: categoria.categoria 
              })),
              { value: "otro", label: "Otro (Agregar nueva categoría)" },
            ]}
            onChange={(selectedOption) => {
              if (selectedOption?.value === "otro") {
                setIsCustomCategoria(true);
                handleDemandChange("id_categoria", "");
              } else {
                setIsCustomCategoria(false);
                handleDemandChange("id_categoria", selectedOption?.value ?? "");
              }
            }}
            className="mb-2 border border-solid border-slate-950"
            placeholder="Selecciona una categoría"
          />

          {isCustomCategoria && (
            <input
              type="text"
              placeholder="Ingrese nueva categoría"
              value={customCategoria}
              onChange={(e) => {
                setCustomCategoria(e.target.value);
                handleDemandChange("id_categoria", e.target.value);
              }}
              className="border p-2 mb-2 border-solid border-slate-950"
            />
          )}

          <Label htmlFor="rubro">Rubro <strong className="text-gray-400 text-x">(Escribe tu rubro para buscar el adecuado)</strong></Label>
          <Select
            name="rubro"
            options={[
              ...rubros.map((rubro) => ({ value: rubro.id, label: rubro.nombre })),
              { value: "otro", label: "Otro (Agregar nuevo rubro)" },
            ]}
            onChange={(selectedOption) => {
              if (selectedOption?.value === "otro") {
                setIsCustomRubro(true);
                handleDemandChange("rubro", "");
              } else {
                setIsCustomRubro(false);
                handleDemandChange("rubro", selectedOption?.value ?? "");
              }
            }}
            className="mb-2 border border-solid border-slate-950"
            placeholder="Selecciona un rubro"
          />

          {isCustomRubro && (
            <input
              type="text"
              placeholder="Ingrese nuevo rubro"
              value={customRubro}
              onChange={(e) => {
                setCustomRubro(e.target.value);
                handleDemandChange("rubro", e.target.value);
              }}
              className="border p-2 mb-2 border-solid border-slate-950"
            />
          )}

          <Label htmlFor="detalle">Detalle</Label>
          <textarea
            name="detalle"
            placeholder=" Describa el detalle de la demanda"
            required
            value={demand.detalle}
            onChange={handleChange}
            className="border border-solid border-slate-950"
            rows={4}
          />

          {/* Checkbox para términos y condiciones */}
          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="terminos"
                disabled={profile?.terminos === true} // Deshabilitar si ya está marcado
                checked={checkedTerminos}
                onChange={handleCheckboxChange}
              />
              <Label htmlFor="terminos">
                Acepto los <a href="/terminos" className="text-blue-600 underline" target="_blank">términos y condiciones</a>
              </Label>
            </label>
          </div>

          

          <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded mt-4 mb-2">
            Crear Demanda
          </button>
        </div>
      </form>
    </>
  );
}