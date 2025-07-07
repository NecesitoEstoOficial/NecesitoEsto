// pages/index.js
import Hero from "@/components/hero";
import Pasos from "@/components/pasos";
import Pais from "@/components/paises";
import SliderDemandas  from "@/components/SliderDemandas";
import { getAllDemandasLimit } from "@/actions/demanda-actions";
import { fetchCategorias } from "@/actions/categorias-actions";
import { fetchPaises } from "@/actions/paises-actions";
import Seccion from "@/components/seccionmain";
import { Roboto } from 'next/font/google'
import { createClient } from "@/utils/supabase/server";
 
const roboto = Roboto({
  weight: '400',
  subsets: ['latin'],
})

export default async function Index() {

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id || null;
  
  const demandas = await getAllDemandasLimit(); 
  const categorias = await fetchCategorias();
  const paises = await fetchPaises();

  return (
    <>
    
      <main className={roboto.className}>
        <Hero />
        <div className="container">
          <div className="flex flex-col justify-center h-auto md:h-[500px] md:text-base text-lg mt-[25px] md:mt-[-70px]">
              <h1 className="text-2xl font-bold text-center mt-[20px] md:mt-[200px] hover:underline mb-3">Nuevas Publicaciones</h1>
              <SliderDemandas demandas={demandas} userId={userId}/>     
          </div>

          <div className="">
            <Pasos />
          </div>
        </div>
        <Seccion />
        
        <Pais paises={paises || []} /> 

        
      </main>
      
      
    </>
  );
}

