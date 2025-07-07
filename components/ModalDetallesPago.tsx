import React, { useState, useEffect } from 'react';
import { Wallet, initMercadoPago } from '@mercadopago/sdk-react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'; // Import PayPal
import axios from 'axios';
import { createClient } from '@/utils/supabase/client';
import { ShareIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { getCupon  } from '@/actions/demanda-actions';

interface Demanda {
  id: string;
  detalle: string;
  email_contacto:string;
  rubro_demanda: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  precio: number;  // Ensure the type is correct
  pais: {
    nombre: string;  // Ensure 'nombre' is the field for country name
    bandera_url: string;  // Ensure 'bandera_url' is the flag URL
  };
  categorias: {
    categoria: string;
  }
  rubros: {
    nombre: string;
  }
}

interface ModalDetallesPagoProps {
  isOpen: boolean;
  onClose: () => void;
  demanda: Demanda;  // Use the correct type for demanda
  userId: string | null;
}

const ModalDetallesPago: React.FC<ModalDetallesPagoProps> = ({ isOpen, onClose, demanda, userId }) => {
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isCreatingPreference, setIsCreatingPreference] = useState(false);
  const [error, setError] = useState<string | null>(null); // For error handling
  const [nombrePagador, setNombrePagador] = useState<string>('');
  const [correoPagador, setCorreoPagador] = useState<string>('');
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [precioDemandaUSD] = useState(10); // Precio fijo de 10 USD
  const [finalPrice, setFinalPrice] = useState(precioDemandaUSD);
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [usdToArs] = useState(1200); // USD to ARS rate
  const supabase = createClient();
  const [demandaGratis, setDemandaGratis] = useState<boolean>(false); // Estado para verificar demanda gratis
  const [cargando, setCargando] = useState(false);
  const [alertaVisible, setAlertaVisible] = useState(false);
  const [esCreadorDemanda, setEsCreadorDemanda] = useState(false);


  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        console.warn("⚠️ No se proporcionó userId.");
        return;
      }
  
      console.log("🔍 Consultando perfil para userId:", userId);
  
      const { data, error } = await supabase
        .from('profile')
        .select('id, nombre, email, demanda_gratis')
        .eq('id', userId); 
  
      if (error) {
        console.error('❌ Error al obtener perfil:', error);
        return;
      }
  
      console.log("📦 Resultado completo del perfil:", data);
  
      if (data && data.length === 1) {
        const userData = data[0];
        console.log("✅ Usuario encontrado:", userData);
  
        setNombrePagador(userData.nombre || '');
        setCorreoPagador(userData.email || '');
        setDemandaGratis(userData.demanda_gratis || false);
  
        if (demanda && userData.email === demanda.email_contacto) {
          console.log("✅ Es el creador de la demanda.");
          setEsCreadorDemanda(true);
        } else {
          setEsCreadorDemanda(false);
        }
      } else if (data && data.length > 1) {
        console.warn("⚠️ Múltiples perfiles encontrados con el mismo userId:", data);
      } else {
        console.warn("⚠️ No se encontró ningún perfil con el userId:", userId);
      }
    };
  
    fetchUserProfile();
  }, [userId, demanda]);
  

  // useEffect to update final price when couponDiscount or precioDemandaUSD changes
  useEffect(() => {
    if (couponDiscount > 0) {
      const newFinalPrice = precioDemandaUSD * (1 - couponDiscount / 100);
      setFinalPrice(newFinalPrice);
      console.log("Precio actualizado con cupón:", newFinalPrice);
    } else {
      setFinalPrice(precioDemandaUSD);
    }
  }, [couponDiscount, precioDemandaUSD]);

  // Calculamos el precio final en ARS
  const finalPriceArg = (finalPrice * usdToArs).toFixed(0);


  // Initialize Mercado Pago on component mount
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY as string;
    if (publicKey) {
      initMercadoPago(publicKey, { locale: 'es-AR' });
    }
  
    const fetchUserProfile = async () => {
      if (!userId) return;
  
      console.log("🔍 Consultando perfil para userId:", userId);
  
      const { data, error } = await supabase
        .from('profile')
        .select('id, nombre, email, demanda_gratis')
        .eq('id', userId);
  
      if (error) {
        console.error('❌ Error fetching user profile:', error);
        return;
      }
  
      if (data?.length === 1) {
        const usuario = data[0];
        console.log("✅ Usuario encontrado:", usuario);
  
        setNombrePagador(usuario.nombre || '');
        setCorreoPagador(usuario.email || '');
        setDemandaGratis(usuario.demanda_gratis || false);
  
        if (demanda && usuario.email === demanda.email_contacto) {
          setEsCreadorDemanda(true);
          console.log("🎯 Es el creador de la demanda");
        } else {
          setEsCreadorDemanda(false);
        }
      } else {
        console.warn("⚠️ Usuario no encontrado o múltiples resultados");
      }
    };
  
    fetchUserProfile();
  }, [userId, demanda]);
  

  // Function to create the payment preference on the server
  const createPreference = async (price: number) => {
    try {
      // console.log('Demanda to create preference:', {
      //   id: demanda.id,
      //   detalle: demanda.detalle,
      //   precio: price,
      //   nombre_pagador: nombrePagador,
      //   correo_pagador: correoPagador,
      // });

      // Check that all required data is present
      if (!demanda.id || !demanda.detalle || !nombrePagador || !correoPagador) {
        setError('Missing necessary data to create the preference.');
        return null;
      }

      setIsCreatingPreference(true);
      const response = await axios.post('/api/create_preference', {
        id: demanda.id,
        title: demanda.detalle,
        quantity: 1,  // Adjust quantity as needed
        price: price,  // Use the actual price of the demanda
        nombre_pagador: nombrePagador,
        correo_pagador: correoPagador,
      });

      return response.data.id;
    } catch (error) {
      console.error('Error creating preference:', error);
      setError('Error creating preference :(');  // Error handling
      return null;
    } finally {
      setIsCreatingPreference(false);
    }
  };

  // Manejo del click de pagar
  const handlePagarClick = async () => {
    console.log("Precio final en ARS antes de crear preferencia:", finalPriceArg); // Log para ver el precio
    // Convertimos finalPriceArg de string a number
    const priceInNumber = parseInt(finalPriceArg, 10);
    const id = await createPreference(priceInNumber); // Pasamos el precio final en ARS como número
    if (id) {
      setPreferenceId(id);
    }
  };
  

  // Handle the click for showing payment methods
  const handleShowPaymentMethods = () => {
    setShowPaymentMethods(true);  // Cambiar estado para mostrar métodos de pago
  };

  // Manejo del cupón
  const handleCouponChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Evento de cambio detectado:", event.target.value); // ✅ Depuración
  
    const code = event.target.value;
    setCouponCode(code);
  
    if (!code) {
      setCouponDiscount(0);
      setFinalPrice(precioDemandaUSD);
      console.log("Precio sin cupón:", precioDemandaUSD);
      return;
    }
  
    try {
      const response = await getCupon(code);
  
      console.log("Respuesta del cupón:", response); // ✅ Verifica si llega la respuesta
  
      if (response.success && response.data) {
        const cupon = response.data;
  
        if (cupon.activo && cupon.usos_realizados < cupon.usos_maximos && new Date(cupon.fecha_expiracion) > new Date()) {
          const discount = cupon.descuento / 100;
          const newFinalPrice = precioDemandaUSD * (1 - discount);
  
          setCouponDiscount(cupon.descuento);
          setFinalPrice(newFinalPrice);
  
          console.log(`Precio con cupón aplicado (${cupon.descuento}% de descuento):`, newFinalPrice);
        } else {
          setCouponDiscount(0);
          setFinalPrice(precioDemandaUSD);
          console.log("Cupón inválido, precio original:", precioDemandaUSD);
        }
      } else {
        setCouponDiscount(0);
        setFinalPrice(precioDemandaUSD);
        console.log("Cupón no encontrado, precio original:", precioDemandaUSD);
      }
    } catch (error) {
      console.error('Error al validar el cupón:', error);
      setCouponDiscount(0);
      setFinalPrice(precioDemandaUSD);
    }
  };
  
  
  const manejarDemanda = async () => {
    setCargando(true); // Activa el estado de carga y cambia el botón

    try {
      const respuesta = await fetch("/api/envioDemandaGratis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idDemanda: demanda.id,
          detalle: demanda.detalle,
          rubroNombre: demanda.rubros?.nombre || "No disponible",
          categoriaNombre: demanda.categorias?.categoria || "No disponible",
          nombrePagador,
          correoPagador,
        }),
      });

      if (respuesta.ok) {
        setAlertaVisible(true);

        // Ocultar la alerta después de 3 segundos
        setTimeout(() => {
          setAlertaVisible(false);
        }, 3000);
      } else {
        console.error("Error al procesar la demanda");
      }
    } catch (error) {
      console.error("Error al enviar la demanda:", error);
    } finally {
      setCargando(false); // Desactiva el estado de carga después de la petición
    }
  };
  
  

  if (!isOpen) return null;  // Do not render the modal if it's not open

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60 backdrop-blur-sm">
  <div className="bg-white p-8 rounded-lg shadow-lg max-w-5xl w-full h-[650px] relative">
    {/* Botón de cerrar */}
    <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-lg">
      ✕
    </button>

    {/* Contenido en dos columnas */}
    <div className="grid grid-cols-2 gap-6">
      {/* Columna izquierda: Detalles de la demanda */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-black">Detalles de la Demanda :</h2>

        <h3 className="font-bold text-lg text-black">{demanda.detalle}</h3>

        <p className="text-black"><strong>Pais:</strong>
        
          {demanda.pais?.bandera_url && (
            <Image
              src={demanda.pais.bandera_url}
              alt={`Bandera de ${demanda.pais.nombre}`}
              width={20}
              height={10}
              className="ml-2 inline"
            />
          )}
        </p>

        
        <p className="text-black"><strong>Categoría:&nbsp;</strong> {demanda.categorias?.categoria || 'Sin categoría'}</p>
        <p className="text-black"><strong>Rubro:</strong> {demanda.rubros?.nombre || "Sin rubro"}</p>
        <p className="text-black"><strong>Fecha de inicio:</strong> {new Date(demanda.fecha_inicio).toLocaleDateString()}</p>
        <p className="text-black"><strong>Fecha de vencimiento:</strong> {new Date(demanda.fecha_vencimiento).toLocaleDateString()}</p>

        {/* Botón para compartir */}
        <div className="mt-4">
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center"
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin + window.location.pathname);
              alert('¡Enlace copiado al portapapeles!');
            }}
          >
            <ShareIcon className="h-5 w-5 mr-2" />
            Compartir
          </button>
        </div>

        <div className="flex justify-end mt-9">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 p-4 rounded-lg shadow-md w-90">
            <div className="flex items-center">
              <span className="text-2xl mr-2">💡</span>
              <h4 className="font-bold">¡Oportunidad única!</h4>
            </div>
            <p className="mt-2 text-sm">
              Su nuevo negocio está en su mano. Realice ahora un pago único y le enviaremos los datos para que se contacte en forma directa y brinde su solución de servicio o cotización de forma inmediata.  
              <strong>Decida ahora antes que su competencia.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Columna derecha: Opciones de pago */}
      <div className="flex flex-col items-center justify-start">
        {/* Cupón y precio final */}
        <div className="bg-gray-100 p-4 rounded-xl shadow-md border-t-4 border-blue-500">
          <p className="text-xl font-semibold text-gray-800">Cupón de Descuento</p>
          <div className="flex items-center justify-center space-x-2">
            <input 
              type="text" 
              value={couponCode} 
              onChange={handleCouponChange} 
              className="p-2 border rounded-lg shadow-sm w-2/3 focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Ingresa tu cupón"
            />
          </div>
        </div>


        {/* Mostrar el precio final en USD y ARS */}
        <div className="mt-4 text-center">
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">Precios Disponibles</h3>

          <div className="flex justify-center space-x-6 bg-gradient-to-r from-blue-500 to-green-400 p-4 rounded-xl shadow-lg mb-4">
            {/* Precio en USD */}
            <div className="text-white">
              <h4 className="text-xl">Precio en USD</h4>
              <p className="text-2xl font-bold">{finalPrice.toFixed(2)} USD</p>
            </div>

            {/* Precio en ARS */}
            <div className="text-white">
              <h4 className="text-xl">Precio en ARS</h4>
              <p className="text-2xl font-bold">{(finalPrice * usdToArs).toFixed(0)} ARS</p>
            </div>
          </div>
        </div>


        {/* Si el usuario tiene demanda gratis, mostramos el mensaje */}
        {esCreadorDemanda ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mt-4">
            ❌ No puedes pagar por tu propia demanda, Prueba con mirar otras Demandas.
          </div>
        ) : demandaGratis ? (
          <div className="alert alert-success p-4 text-green-700 bg-green-100 rounded-lg mt-10">
            🎉 ¡Felicidades! No necesitas pagar nada, realiza el contacto directo con el responsable de la publicación <br />
            <button 
              className="bg-blue-600 text-white py-3 px-6 rounded-lg w-full text-center mt-3"
              onClick={manejarDemanda}
              disabled={cargando}
            >
              {cargando ? "Obteniendo Demanda Espera un Momento... ⏳" : "Obtener información sobre la demanda"}
            </button>
          </div>
        ) : (
          !showPaymentMethods && (
            <button
              className="bg-blue-600 text-white py-3 px-6 rounded-lg w-full text-center mt-10"
              onClick={handleShowPaymentMethods}
            >
              Realizar Pago PPO
            </button>
          )
        )}



        {/* Métodos de pago */}
        {showPaymentMethods && (
          <div className="mt-6 w-full space-y-4">
            {!preferenceId && (
              <button
                className="flex items-center justify-center bg-blue-500 text-white py-3 px-6 rounded-lg w-full hover:bg-blue-600 transition duration-300"
                onClick={handlePagarClick}
                disabled={isCreatingPreference}
              >
                {isCreatingPreference ? 'Creando preferencia...' : (
                  <>
                    <img src="/mercado-pago.png" alt="Mercado Pago" className="w-6 h-6 mr-2" />
                    Pagar con Mercado Pago
                  </>
                )}
              </button>
            )}
            {preferenceId && <Wallet initialization={{ preferenceId }} />}

            {/* Botón de PayPal */}
            <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '', currency: 'USD' }}>
              <PayPalButtons
                createOrder={(data, actions) => {
                  return actions.order.create({
                    intent: 'CAPTURE',
                    purchase_units: [{ amount: { value: `${finalPrice}`, currency_code: 'USD' }, description: demanda.detalle }],
                  });
                }}
                onApprove={async (data, actions) => {
                  if (actions.order) {
                    const details = await actions.order.capture();
                    await axios.post('/api/guardar_pago', {
                      demanda_id: demanda.id,
                      detalle_demanda: demanda.detalle,
                      nombre_pagador: nombrePagador,
                      correo_pagador: correoPagador,
                      numero_pago: details.id,
                      monto: finalPrice,
                      fecha_pago: new Date().toISOString(),
                      estado_pago: 'aprobado',
                      id_transaccion: details.id,
                      moneda: 'USD',
                    });

                    window.location.href = '/success';
                    onClose();
                  }
                }}
              />
            </PayPalScriptProvider>
          </div>
        )}

        {/* Mensaje de alerta con efecto de opacidad */}
        {alertaVisible && (
          <div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      bg-green-600 text-white p-4 rounded-lg text-lg font-bold shadow-lg
                      transition-opacity duration-500 opacity-100 animate-fadeIn"
          >
            ✅ Demanda entregada correctamente, Revisa tu Correo los datos de la demanda fueron enviado allí.
          </div>
        )}
      </div>
    </div>
  </div>
</div>

  );
};

export default ModalDetallesPago;

