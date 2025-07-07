"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction, getPaises, getCategorias, getRubros } from "@/actions/profile-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import AlertaBienvenida from "@/components/AlertaBienvenida";
import { createClient } from "@/utils/supabase/client";
import Select from "react-select";

export function InitialProfileForm() {
  const [status, setStatus] = useState<"success" | "destructive" | "default">("default");
  const [message, setMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [paises, setPaises] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [rubros, setRubros] = useState<any[]>([]);
  const [isCustomCategoria, setIsCustomCategoria] = useState(false);
  const [isCustomRubro, setIsCustomRubro] = useState(false);
  const [customCategoria, setCustomCategoria] = useState("");
  const [customRubro, setCustomRubro] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [isCustomPais, setIsCustomPais] = useState(false);
  const [customPais, setCustomPais] = useState("");

  const router = useRouter();
  const [showBienvenida, setShowBienvenida] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    empresa: "",
    telefono: "",
    provincia: "",
    municipio: "",
    localidad: "",
    direccion: "",
    codigo_postal: "",
    pais_id: "",
    id_categoria: "",
    rubro: "",
    nueva_categoria: "",
    nuevo_rubro: "",
    nuevo_pais: "",
  });
  

  useEffect(() => {
    getPaises().then(setPaises).catch(console.error);
    getCategorias().then(setCategorias).catch(console.error);
    getRubros().then(setRubros).catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!aceptaTerminos) {
      setStatus("destructive");
      setMessage("Debes aceptar los términos y condiciones para continuar.");
      setShowAlert(true);
      return; // ← Evita que el formulario se envíe
    }
  
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value);
    });
  
    if (isCustomCategoria && customCategoria) {
      form.append("nueva_categoria", customCategoria);
    }
  
    if (isCustomRubro && customRubro) {
      form.append("nuevo_rubro", customRubro);
    }

    if (isCustomPais && customPais) {
      form.append("nuevo_pais", customPais);
    }

  
    form.append("terminos", "1");

    // Convertir FormData a un objeto simple para mostrarlo en la consola
    const formObj: any = {};
    form.forEach((value, key) => {
      formObj[key] = value;
    });

    // Mostrar el objeto con los datos
    console.log("Datos enviados al servidor: ", formObj);
  
    const result = await updateProfileAction(form);
  
    setStatus(result.success ? "success" : "destructive");
    setMessage(result.message);
    setShowAlert(true);
  
    if (result.success) {
      setFormData({
        nombre: "",
        apellido: "",
        empresa: "",
        telefono: "",
        provincia: "",
        municipio: "",
        localidad: "",
        direccion: "",
        codigo_postal: "",
        pais_id: "",
        id_categoria: "",
        rubro: "",
        nueva_categoria: "",
        nuevo_rubro: "",
        nuevo_pais: "",
      });
      setCustomCategoria("");
      setCustomRubro("");
      setCustomPais("");
      setIsCustomCategoria(false);
      setIsCustomRubro(false);
      setIsCustomPais(false);
      setAceptaTerminos(false);
    }

    // Llamar a la API de bienvenida
    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user?.email) {
        console.error("No se pudo obtener el email del usuario.");
        return;
      }

      const email = user.email;

      await fetch('/api/bienvenida', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formObj.nombre,
          email: email,
        }),
      });
    } catch (error) {
      console.error("Error al enviar correo de bienvenida:", error);
    }
  };
  
  

  return (
    <div className="max-w-2xl mx-auto p-6 mt-24 mb-32">
      <h2 className="text-2xl font-bold mb-6 text-center">Completa tu perfil inicial antes de comenzar!</h2>
      
      {showAlert && (
        <Alert
          variant={status}
          title={status === "success" ? "Éxito" : "Error"}
          description={message}
          onClose={() => {
            setShowAlert(false);
            if (status === "success") {
              setShowBienvenida(true); // MOSTRAR CARTEL
            }
          }}
        />
      )}

      {showBienvenida && (
        <AlertaBienvenida
          onClose={() => {
            setShowBienvenida(false);
            // Aquí puedes hacer un redirect si querés: router.push("/") o similar
          }}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Columna 1 */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="nombre">Nombre*</Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="apellido">Apellido*</Label>
              <Input
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="empresa">Empresa*</Label>
              <Input
                id="empresa"
                name="empresa"
                value={formData.empresa}
                onChange={handleChange}
                required
              />
            </div>

            
          </div>

          {/* Columna 2 */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="pais_id">País*</Label>
              <select
                id="pais_id"
                name="pais_id"
                value={formData.pais_id}
                onChange={(e) => {
                  const value = e.target.value;
                  setIsCustomPais(value === "otro");
                  setFormData(prev => ({ ...prev, pais_id: value }));
                }}
                required
                className="w-full p-2 border rounded-md"
              >
                <option value="">Seleccione...</option>
                {paises.map((pais) => (
                  <option key={pais.id} value={pais.id}>
                    {pais.nombre}
                  </option>
                ))}
                <option value="otro">Otro...</option>
              </select>

              {isCustomPais && (
                <div className="mt-2">
                  <Input
                    type="text"
                    placeholder="Ingrese nuevo pais"
                    value={formData.nuevo_pais}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, nuevo_pais: e.target.value }))
                    }
                    required
                    className="border p-2 mb-2 mt-2 border-solid border-slate-950"
                  />
                </div>
              )}

            </div>


            <div>
              <Label htmlFor="telefono">Teléfono*</Label>
              <Input
                id="telefono"
                name="telefono"
                type="tel"
                value={formData.telefono}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Campos adicionales */}
        <div className="space-y-3">
          <Label htmlFor="direccion">Dirección*</Label>
          <Input
            id="direccion"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            required
          />

            <div>
              <Label htmlFor="municipio">Municipio*</Label>
              <Input
                id="municipio"
                name="municipio"
                value={formData.municipio}
                onChange={handleChange}
                required
              />
            </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="provincia">Provincia*</Label>
              <Input
                id="provincia"
                name="provincia"
                value={formData.provincia}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="localidad">Localidad*</Label>
              <Input
                id="localidad"
                name="localidad"
                value={formData.localidad}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="codigo_postal">Código Postal*</Label>
              <Input
                id="codigo_postal"
                name="codigo_postal"
                value={formData.codigo_postal}
                onChange={handleChange}
                required
              />
            </div>

          </div>

        </div>

        <div className="space-y-3">
        <div>
                {/* Selección de Categoría */}
                <Label htmlFor="id_categoria">
                  Categoría <strong className="text-gray-400 text-xs">(Selecciona o crea una nueva)</strong>
                </Label>
                <select
                  name="id_categoria"
                  value={formData.id_categoria}
                  onChange={(e) => {
                    if (e.target.value === "otro") {
                      setIsCustomCategoria(true);
                      handleChange({ target: { name: "id_categoria", value: "" } } as any);
                    } else {
                      setIsCustomCategoria(false);
                      handleChange(e);
                    }
                  }}
                  required={!isCustomCategoria} // ← Aquí se desactiva el required si escribes una categoría nueva
                  className="w-full p-2 border border-solid border-slate-950"
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias
                    .slice() // para no mutar el array original
                    .sort((a, b) => a.categoria.localeCompare(b.categoria))
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.categoria}
                      </option>
                  ))}
                  <option value="otro">Otro (Agregar nueva categoría)</option>
                </select>

                
                {isCustomCategoria && (
                  <input
                    type="text"
                    placeholder="Ingrese nueva categoría"
                    value={formData.nueva_categoria}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, nueva_categoria: e.target.value }))
                    }
                    required
                    className="border p-2 mb-2 mt-2 border-solid border-slate-950"
                  />
                )}
            </div>

            
            <div>
                {/* Selección de Rubro */}
                <Label htmlFor="rubro">
                  Rubro <strong className="text-gray-400 text-xs">(Escribe tu rubro para buscar el adecuado)</strong>
                </Label>
                  <select
                    name="rubro"
                    value={formData.rubro}
                    onChange={(e) => {
                      if (e.target.value === "otro") {
                        setIsCustomRubro(true);
                        handleChange({ target: { name: "rubro", value: "" } } as any);
                      } else {
                        setIsCustomRubro(false);
                        handleChange(e);
                      }
                    }}
                    required={!isCustomRubro}
                    className="w-full p-2 border border-solid border-slate-950"
                  >
                  <option value="">Selecciona un rubro</option>
                  {rubros
                    .slice()
                    .sort((a, b) => a.nombre.localeCompare(b.nombre))
                    .map((rubro) => (
                      <option key={rubro.id} value={rubro.id}>
                        {rubro.nombre}
                      </option>
                  ))}
                  <option value="otro">Otro (Agregar nuevo rubro)</option>
                </select>

                
                {isCustomRubro && (
                  <input
                    type="text"
                    placeholder="Ingrese nuevo rubro"
                    value={formData.nuevo_rubro}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, nuevo_rubro: e.target.value }))
                    }
                    required
                    className="border p-2 mb-2 mt-2 border-solid border-slate-950"
                  />
                )}
            </div>

            {/* Checkbox Términos y Condiciones */}
            <div className="flex items-center space-x-2 mt-6">
              <input
                id="terminos"
                type="checkbox"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
                className="w-4 h-4"
                required
              />
              <Label htmlFor="terminos">
                Acepto los <a href="/terminos" className="text-blue-600 underline" target="_blank">Términos y Condiciones</a> *
              </Label>
            </div>


        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Guardar Información Inicial
        </button>
      </form>
    </div>
  );
}