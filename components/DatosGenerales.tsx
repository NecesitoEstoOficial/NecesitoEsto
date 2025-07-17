"use client";

import { useState, useEffect } from "react";
import { updateProfileAction } from "@/actions/profile-actions";
import { createClient } from "@/utils/supabase/client";

interface Profile {
  id?: string;
  nombre: string;
  apellido: string;
  provincia: string;
  municipio: string;
  localidad: string;
  direccion: string;
  codigo_postal: string;
  created_at: string;
  telefono:string;
  empresa: string; 
  pais_id: string; 
  id_categoria:string;
  rubro_id:string;
}

interface DatosGeneralesProps {
  data: Profile;
}

const DatosGenerales: React.FC<DatosGeneralesProps> = ({ data }) => {
  const sanitizedData = {
    ...data,
    pais_id: data.pais_id ?? "", // Si es null o undefined, usa ""
  };
  const [profile, setProfile] = useState<Profile>(sanitizedData);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [formattedFecha, setFormattedFecha] = useState<string>("");
  const [paises, setPaises] = useState<{ id: string; nombre: string }[]>([]);
  const [categorias, setCategorias] = useState<{ id: string; categoria: string }[]>([]);
  const [rubros, setRubros] = useState<{ id: string; nombre: string }[]>([]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [mostrarInputCategoria, setMostrarInputCategoria] = useState(false);
  const [nuevoRubro, setNuevoRubro] = useState("");
  const [mostrarInputRubro, setMostrarInputRubro] = useState(false);
  const [nuevoPais, setNuevoPais] = useState("");
  const [mostrarInputPais, setMostrarInputPais] = useState(false);



  useEffect(() => {
    setFormattedFecha(formatFecha(profile.created_at));
  }, [profile.created_at]);


  useEffect(() => {
    const fetchPaises = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("pais").select("id, nombre");
  
        if (error) {
          console.error("Error al obtener países:", error.message);
        } else {
          setPaises(data);
        }
      } catch (err: any) {
        console.error("Error al obtener países:", err.message);
      }
    };

    const fetchCategorias = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("categorias").select("id, categoria");
  
        if (error) {
          console.error("Error al obtener categorias:", error.message);
        } else {
          setCategorias(data);
        }
      } catch (err: any) {
        console.error("Error al obtener categorias:", err.message);
      }
    };

    const fetchRubros = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("rubros").select("id, nombre");
  
        if (error) {
          console.error("Error al obtener rubros:", error.message);
        } else {
          setRubros(data);
        }
      } catch (err: any) {
        console.error("Error al obtener rubros:", err.message);
      }
    };
  
    fetchPaises();
    fetchCategorias();
    fetchRubros();
  }, []);


  // En tu componente
  const sendProfileUpdateEmail = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.email) {
      console.error('No se pudo obtener el email del usuario');
      return;
    }

    try {
      const response = await fetch('/api/mail-perfil', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          email: user.email,
          nombre: profile.nombre,
          apellido: profile.apellido
        }),
      });
      // ... resto del código
    } catch (error) {
      console.error('Error al enviar correo:', error);
    }
  };

  const handleSave = async () => {
    try {
      const supabase = createClient();

      // 👇 Si se mostró el input y se ingresó un nuevo país
      if (mostrarInputPais && nuevoPais.trim() !== "") {
        const { data: nuevoPaisData, error: errorInsertPais } = await supabase
          .from("pais")
          .insert({ nombre: nuevoPais.trim() })
          .select("id")
          .single();

        if (errorInsertPais) {
          setError("Error al insertar nuevo país: " + errorInsertPais.message);
          return;
        }

        // Actualizar el profile con el nuevo país insertado
        setProfile((prev) => ({ ...prev, pais_id: nuevoPaisData.id }));
      }

      const formData = new FormData();
      Object.entries(profile).forEach(([key, value]) => {
        if (key !== "fecha_creacion" && key !== "id") formData.append(key, value as string);
      });

      if (mostrarInputCategoria) {
        formData.append("nueva_categoria", nuevaCategoria);
      }

      if (mostrarInputRubro) {
        formData.append("nuevo_rubro", nuevoRubro);
      }

      const result = await updateProfileAction(formData);
      console.log("Respuesta del backend:", result);

      if (result.success) {
        setSuccess(true);
        setError(null);
        await sendProfileUpdateEmail();
      }
    } catch (err: any) {
      setError(err.message);
      setSuccess(false);
    }
  };


  const formatFecha = (fecha: string | undefined | null): string => {
    if (!fecha) {
      console.log("Fecha no disponible: el valor es null o undefined");
      return "Fecha no disponible";
    }
  
    try {
      // Crear objeto Date directamente (maneja automáticamente el formato ISO)
      const fechaObj = new Date(fecha);
      
      if (isNaN(fechaObj.getTime())) {
        console.log("Fecha inválida:", fecha);
        return "Fecha inválida";
      }
  
      // Usar los métodos UTC para evitar problemas de zona horaria
      const dia = fechaObj.getUTCDate().toString().padStart(2, "0");
      const mes = (fechaObj.getUTCMonth() + 1).toString().padStart(2, "0");
      const anio = fechaObj.getUTCFullYear();
  
      return `${dia}/${mes}/${anio}`;
    } catch (error) {
      console.error("Error al formatear la fecha:", error);
      return "Fecha inválida";
    }
  };
  
  

  return (
    <div className="text-center pb-5 mt-40">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-500 mb-4">Perfil actualizado con éxito</div>}

      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {/* Campo Nombre */}
        <div className="flex flex-col mb-1">
          <label className="block mb-2 font-semibold">Nombre</label>
          <input
            type="text"
            value={profile.nombre}
            onChange={(e) => setProfile({ ...profile, nombre: e.target.value })}
            className="border border-slate-950 rounded-md p-3 shadow-sm focus:outline-none focus:ring focus:ring-blue-500 transition bg-white"
          />
        </div>

        {/* Campo Apellido */}
        <div className="flex flex-col mb-1">
          <label className="block mb-2 font-semibold">Apellido</label>
          <input
            type="text"
            value={profile.apellido}
            onChange={(e) => setProfile({ ...profile, apellido: e.target.value })}
            className="border border-slate-950 rounded-md p-3 shadow-sm focus:outline-none focus:ring focus:ring-blue-500 transition bg-white"
          />
        </div>

        {/* Campo Apellido */}
        <div className="flex flex-col mb-1">
          <label className="block mb-2 font-semibold">Empresa</label>
          <input
            type="text"
            value={profile.empresa}
            onChange={(e) => setProfile({ ...profile, empresa: e.target.value })}
            className="border border-slate-950 rounded-md p-3 shadow-sm focus:outline-none focus:ring focus:ring-blue-500 transition bg-white"
          />
        </div>

        {/* Campo Pais */}
        <div className="flex flex-col mb-1">
          <label className="block mb-2 font-semibold">País</label>
              <select
                value={profile.pais_id || ""}
                onChange={(e) => {
                  if (e.target.value === "nueva") {
                    setMostrarInputPais(true);
                    setProfile({ ...profile, pais_id: "" });
                  } else {
                    setMostrarInputPais(false);
                    setProfile({ ...profile, pais_id: e.target.value });
                  }
                }}
                className="border border-slate-950 rounded-md p-3 shadow-sm focus:outline-none focus:ring focus:ring-blue-500 transition bg-white"
              >
                <option value="">Seleccione un país</option>
                {paises.map((pais) => (
                  <option key={pais.id} value={pais.id}>
                    {pais.nombre}
                  </option>
                ))}
                <option value="nueva">+ Agregar nuevo pais</option>
              </select>

            {mostrarInputPais && (
              <input
                type="text"
                value={nuevoPais}
                onChange={(e) => setNuevoPais(e.target.value)}
                placeholder="Nuevo país"
                className="border border-slate-950 rounded-md p-3 shadow-sm mt-2 focus:outline-none focus:ring focus:ring-blue-500 transition bg-white"
              />
            )}
        </div>


        {/* Campo Provincia */}
        <div className="flex flex-col mb-1">
          <label className="block mb-2 font-semibold">Provincia</label>
          <input
            type="text"
            value={profile.provincia}
            onChange={(e) => setProfile({ ...profile, provincia: e.target.value })}
            className="border border-slate-950 rounded-md p-3 shadow-sm focus:outline-none focus:ring focus:ring-blue-500 transition bg-white"
          />
        </div>

        {/* Campo Municipio */}
        <div className="flex flex-col mb-1">
          <label className="block mb-2 font-semibold">Municipio</label>
          <input
            type="text"
            value={profile.municipio}
            onChange={(e) => setProfile({ ...profile, municipio: e.target.value })}
            className="border border-slate-950 rounded-md p-3 shadow-sm focus:outline-none focus:ring focus:ring-blue-500 transition bg-white"
          />
        </div>

        {/* Campo Localidad */}
        <div className="flex flex-col mb-1">
          <label className="block mb-2 font-semibold">Localidad</label>
          <input
            type="text"
            value={profile.localidad}
            onChange={(e) => setProfile({ ...profile, localidad: e.target.value })}
            className="border border-slate-950 rounded-md p-3 shadow-sm focus:outline-none focus:ring focus:ring-blue-500 transition bg-white"
          />
        </div>

        {/* Campo Dirección */}
        <div className="flex flex-col mb-1">
          <label className="block mb-2 font-semibold">Dirección</label>
          <input
            type="text"
            value={profile.direccion}
            onChange={(e) => setProfile({ ...profile, direccion: e.target.value })}
            className="border border-slate-950 rounded-md p-3 shadow-sm focus:outline-none focus:ring focus:ring-blue-500 transition bg-white"
          />
        </div>

        {/* Campo Código Postal */}
        <div className="flex flex-col mb-1">
          <label className="block mb-2 font-semibold">Código Postal</label>
          <input
            type="text"
            value={profile.codigo_postal}
            onChange={(e) => setProfile({ ...profile, codigo_postal: e.target.value })}
            className="border border-slate-950 rounded-md p-3 shadow-sm focus:outline-none focus:ring focus:ring-blue-500 transition bg-white"
          />
        </div>

        {/* Campo Telefono */}
        <div className="flex flex-col mb-1">
          <label className="block mb-2 font-semibold">Telefono</label>
          <input
            type="text"
            value={profile.telefono}
            onChange={(e) => setProfile({ ...profile, telefono: e.target.value })}
            className="border border-slate-950 rounded-md p-3 shadow-sm focus:outline-none focus:ring focus:ring-blue-500 transition bg-white"
          />
        </div>

        {/* Campo categoria */}
        <div className="flex flex-col mb-1">
          <label className="block mb-2 font-semibold">Categoria</label>
          <select
            className="border border-slate-950 rounded-md p-3 bg-white"
            value={profile.id_categoria || ""}
            onChange={(e) => {
              if (e.target.value === "nueva") {
                setMostrarInputCategoria(true);
                setProfile({ ...profile, id_categoria: "" });
              } else {
                setMostrarInputCategoria(false);
                setProfile({ ...profile, id_categoria: e.target.value });
              }
            }}
          >
            <option value="">Seleccione una categoría</option>
            {categorias
              .slice() // para no mutar el array original
              .sort((a, b) => a.categoria.localeCompare(b.categoria))
              .map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.categoria}
                </option>
            ))}
            <option value="nueva">+ Agregar nueva categoría</option>
          </select>

          {mostrarInputCategoria && (
            <input
              type="text"
              placeholder="Nueva categoría"
              value={nuevaCategoria}
              onChange={(e) => setNuevaCategoria(e.target.value)}
              className="border border-slate-950 rounded-md p-2 mt-2 bg-white"
            />
          )}

        </div>

        {/* Campo Rubro */}
        <div className="flex flex-col mb-1">
          <label className="block mb-2 font-semibold">Rubro</label>
          <select
            className="border border-slate-950 rounded-md p-3 bg-white"
            value={profile.rubro_id}
            onChange={(e) => {
              if (e.target.value === "nuevo") {
                setMostrarInputRubro(true);
                setProfile({ ...profile, rubro_id: "" });
              } else {
                setMostrarInputRubro(false);
                setProfile({ ...profile, rubro_id: e.target.value });
              }
            }}
          >
            <option value="">Seleccione un rubro</option>
            {rubros
              .slice()
              .sort((a, b) => a.nombre.localeCompare(b.nombre))
              .map((rubro) => (
                <option key={rubro.id} value={rubro.id}>
                  {rubro.nombre}
                </option>
            ))}
            <option value="nuevo">+ Agregar nuevo rubro</option>
          </select>

          {mostrarInputRubro && (
            <input
              type="text"
              placeholder="Nuevo rubro"
              value={nuevoRubro}
              onChange={(e) => setNuevoRubro(e.target.value)}
              className="border border-slate-950 rounded-md p-2 mt-2 bg-white"
            />
          )}

        </div>
      </div>

      {/* Mostrar la fecha de creación al final correctamente */}
      <div className="mt-6">
        <label className="block mb-2 font-semibold">Fecha de Creación</label>
        <p className="border border-slate-950 rounded-md p-3 bg-gray-100 shadow-sm bg-white">
          {formattedFecha}
        </p>
      </div>

      <button
        onClick={handleSave}
        className="mt-6 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500 transition"
      >
        Guardar Cambios
      </button>
    </div>
  );
};

export default DatosGenerales;
