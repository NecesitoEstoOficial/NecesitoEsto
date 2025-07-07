"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

import { Demanda } from "@/components/ModalDemandaUsuario"; // Asegúrate de la ruta correcta

type CreateDemandResponse = {
  success: boolean;
  message: string;
};

export const createDemandAction = async (demand: any): Promise<CreateDemandResponse> => {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error fetching user:", userError);
      return { success: false, message: userError.message };
    }

    const {
      empresa,
      responsable_solicitud,
      email_contacto,
      telefono,
      fecha_inicio,
      fecha_vencimiento,
      id_categoria,
      detalle,
      pais_id,
      rubro,
    } = demand;

    const user_id = user?.id;

    let categoria_id;
    let rubro_id;

    // Procesar categoría (puede ser ID existente o texto para nueva categoría)
    if (isNaN(Number(id_categoria))) {
      // Crear nueva categoría
      const { data: newCategoria, error: newCategoriaError } = await supabase
        .from("categorias")
        .insert({ categoria: id_categoria })
        .select("id")
        .single();

      if (newCategoriaError) {
        console.error("Error creating categoria:", newCategoriaError);
        return { success: false, message: newCategoriaError.message };
      }

      categoria_id = newCategoria.id;
    } else {
      // Usar categoría existente
      categoria_id = id_categoria;
    }

    // Procesar rubro (puede ser ID existente o texto para nuevo rubro)
    if (isNaN(Number(rubro))) {
      // Crear nuevo rubro asociado a la categoría
      const { data: newRubro, error: newRubroError } = await supabase
        .from("rubros")
        .insert({ 
          nombre: rubro, 
          categoria_id: categoria_id // Usamos el ID de la categoría (nueva o existente)
        })
        .select("id")
        .single();

      if (newRubroError) {
        console.error("Error creating rubro:", newRubroError);
        return { success: false, message: newRubroError.message };
      }

      rubro_id = newRubro.id;
    } else {
      // Usar rubro existente
      rubro_id = rubro;
    }

    // Insertar la demanda con los IDs correctos
    const { data, error: demandaError } = await supabase.from("demandas").insert({
      empresa,
      responsable_solicitud,
      email_contacto,
      telefono,
      fecha_inicio,
      fecha_vencimiento,
      id_categoria: categoria_id,
      pais_id,
      detalle,
      profile_id: user_id,
      rubro_id,
      estado: "pendiente",
    });

    if (demandaError) {
      console.error("Error creating demand:", demandaError);
      return { success: false, message: demandaError.message };
    }

    return { success: true, message: "Demanda creada correctamente." };
  } catch (error) {
    console.error("Error creating demand:", error);
    return { success: false, message: "Hubo un problema al procesar la solicitud." };
  }
};



export const getUserDemandas = async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  if (user) {
    const { data: demandsData, error: demandsError } = await supabase
      .from("demandas")
      .select("*")
      .eq("profile_id", user.id);

    if (demandsError) {
      throw new Error("Error al obtener las demandas: " + demandsError.message);
    }

    console.log('demandas por usuario', demandsData);

    return demandsData || [];
  }

  return [];
};

export async function getAllDemandas(idCategoria = null) {
  const supabase = await createClient();

  let query = supabase
    .from("demandas")
    .select(
      "id, empresa, responsable_solicitud, email_contacto, telefono, fecha_inicio, fecha_vencimiento, detalle, pais (nombre, bandera_url), categorias (id, categoria), rubros (id, nombre)"
    )
    .eq("estado", "aprobada") // Filtrar solo las demandas aprobadas
    .gt("fecha_vencimiento", new Date().toISOString()) // Excluir demandas vencidas
    .order("id", { ascending: false }); // Ordenar por id, de mayor a menor

  // Filtrar por categoría si se proporciona un `idCategoria`
  if (idCategoria) {
    query = query.eq("id_categoria", idCategoria);
  }

  const { data: demandas, error } = await query;

  if (error) {
    console.error("Error fetching demandas:", error);
    return [];
  }

  return demandas;
}




export async function getAllDemandasLimit() {
  const supabase = await createClient();

  const { data: demandas, error } = await supabase
    .from("demandas")
    .select("id, empresa, responsable_solicitud, email_contacto, telefono, fecha_inicio, fecha_vencimiento, detalle, pais (nombre, bandera_url), categorias (id, categoria), rubros (id, nombre)")
    .order("fecha_inicio", { ascending: false })
    .limit(9);

  if (error) {
    console.error("Error fetching demandas:", error);
    return [];
  }

  return demandas;
}

export async function getDemandaById(id: string) { 
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("demandas")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching demanda:", error);
    return null;
  }

  return data;
}



export async function fetchDemandasPorCategoria(idCategoria: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("demandas")
    .select("*")
    .eq("id_categoria", idCategoria);

  if (error) throw new Error(error.message);
  return data;
}


export const fetchDemandas = async (userId: string) => {
  const supabase = await createClient();

  // Obtener el usuario
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Si no hay un usuario autenticado, redirigir al login
  if (!user) {
    return redirect("/sign-in");
  }

  // Si el usuario está autenticado, podemos proceder a obtener las demandas
  try {
    const { data, error } = await supabase
      .from("demandas")
      .select(`
        id, empresa, responsable_solicitud, email_contacto, telefono, fecha_inicio, fecha_vencimiento, detalle, 
        pais (nombre, bandera_url), 
        categorias (id, categoria), 
        rubros (id, nombre)
      `)
      .eq("profile_id", userId) 
      .eq("status", true); // Solo obtener demandas activas

    if (error) {
      console.error("Error al obtener demandas:", error.message);
      return [];
    }

    return data || [];  // Devuelve las demandas obtenidas, o un array vacío si no hay datos

  } catch (error) {
    console.error("Error al obtener demandas:", error);
    return [];
  }
};


export const updateDemanda = async (demanda: Demanda) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("demandas")
      .update({
        detalle: demanda.detalle,
        empresa: demanda.empresa,
        telefono: demanda.telefono,
        fecha_inicio: demanda.fecha_inicio,
        fecha_vencimiento: demanda.fecha_vencimiento,
        pais_id: demanda.pais_id,
        id_categoria: demanda.id_categoria,
        rubro_id: demanda.rubro_id
      })
      .eq("id", demanda.id);

    if (error) {
      console.error("Error al actualizar demanda:", error.message);
      throw new Error(error.message);
    }

    return data;
  } catch (err) {
    console.error("Error en updateDemanda:", err);
    throw err;
  }
};



// Delete function

export const deleteDemanda = async (demandaId: string) => {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("demandas")
      .update({ status: false }) // Cambiamos el status a false en lugar de eliminar
      .eq("id", demandaId);

    if (error) {
      console.error("Error al eliminar la demanda:", error.message);
      return false;
    }

    return true; // Éxito
  } catch (error) {
    console.error("Error inesperado al eliminar la demanda:", error);
    return false;
  }
};





export async function getDemandasByCategoria(idCategoria: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("demandas")
    .select(`
      id, 
      detalle, 
      fecha_inicio, 
      fecha_vencimiento, 
      categorias (id, categoria), 
      rubros (id, nombre)
    `)
    .eq("id_categoria", idCategoria);

  if (error) {
    console.error("Error obteniendo demandas por categoría:", error);
    return [];
  }

  return data;
}



export async function getCategorias() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categorias") // Nombre de la tabla en tu base de datos
    .select("*");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data;
}


export async function getPaises() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pais") // Nombre de la tabla en tu base de datos
    .select("*");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data;
}




export async function getRubros() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rubros") // Nombre de la tabla en tu base de datos
    .select("*");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data;
}

export async function getRubrosByCategoria(idCategoria: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rubros")
    .select("*")
    .eq("categoria_id", idCategoria); // Filtrar por categoría

  if (error) {
    console.error("Error obteniendo rubros por categoría:", error);
    return [];
  }

  return data;
}


export async function getDemandasByRubro(idRubro: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("demandas")
    .select(`
      id, 
      detalle, 
      fecha_inicio, 
      fecha_vencimiento, 
      categorias (id, categoria), 
      rubros (id, nombre)
    `)
    .eq("rubro_id", idRubro);

  if (error) {
    console.error("Error obteniendo demandas por rubro:", error);
    return [];
  }

  return data;
}


export const getCupon = async (codigo: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cupones')
    .select('*')
    .eq('codigo', codigo)
    .single();

  if (error) {
    console.error('Error fetching coupon:', error);
    return { success: false, data: null };
  }

  return { success: true, data };
};
