import Link from "next/link";
import { EnvVarWarning } from "@/components/env-var-warning";
import {
  HomeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/solid";
import HeaderAuth from "@/components/header-auth";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import FloatingButton from "@/components/FloatingButton";
import AuthModal from "@/components/AuthModal"; // Importa el modal


export const Header = ({ user }: { user: any }) => {
  return (
    <header className="header w-full border-b border-gray-300 py-4 bg-white fixed top-0 left-0 z-50">
      {/* Logo y nombre (centrado en móvil, a la izquierda en desktop) */}
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-6 gap-4">
        <div className="header__left flex items-center justify-center md:justify-start w-full md:w-auto">
          <img
            src="/logoprincipalsf.png"
            alt="Logo de Necesito Esto!"
            width={77}
            height={77}
          />
          <Link href="/">
            <h3 className="text-3xl font-bold ml-2">
              Necesito <span className="text-blue-600">Esto!</span>
            </h3>
          </Link>
        </div>

        {/* Navegación para desktop (iconos con nombres y FloatingButton dentro del nav) */}
        <div className="hidden md:flex md:justify-center md:items-center md:gap-8">
          <nav>
            <ul className="flex gap-8">
              <li className="flex flex-col items-center cursor-pointer">
                <Link className="ito" href="/">
                  <HomeIcon className="w-6 h-6 mx-auto" />
                  <p>Inicio</p>
                </Link>
              </li>
              <li className="flex flex-col items-center cursor-pointer">
                <Link className="ito" href={`/nosotros`}>
                  <UserGroupIcon className="w-6 h-6 mx-auto" />
                  <p>Nosotros</p>
                </Link>
              </li>
              <li className="flex flex-col items-center cursor-pointer">
                <Link className="ito" href={`/demandas`}>
                  <BriefcaseIcon className="w-6 h-6 mx-auto" />
                  <p>Demandas</p>
                </Link>
              </li>
              <li className="flex flex-col items-center cursor-pointer">
                <Link className="ito" href={`/contact`}>
                  <ChatBubbleBottomCenterTextIcon className="w-6 h-6 mx-auto" />
                  <p>Contacto</p>
                </Link>
              </li>
              {/* FloatingButton dentro del nav en desktop */}
              <li className="flex flex-col items-center cursor-pointer">
                <FloatingButton />
              </li>
            </ul>
          </nav>
        </div>

        {/* Sección de autenticación (solo en desktop) */}
        <div className="hidden md:flex md:w-auto">
          <nav>
            <ul className="flex gap-4">
              <li className="flex flex-col items-center">
                {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth user={user} />}
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Navegación para móvil (iconos en la parte inferior, estilo Instagram) */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 md:hidden">
        <nav>
          <ul className="flex justify-around py-3">
            <li className="flex flex-col items-center cursor-pointer">
              <Link className="ito" href="/">
                <HomeIcon className="w-6 h-6 mx-auto" />
              </Link>
            </li>
            <li className="flex flex-col items-center cursor-pointer">
              <Link className="ito" href={`/nosotros`}>
                <UserGroupIcon className="w-6 h-6 mx-auto" />
              </Link>
            </li>
            <li className="flex flex-col items-center cursor-pointer">
              <Link className="ito" href={`/demandas`}>
                <BriefcaseIcon className="w-6 h-6 mx-auto" />
              </Link>
            </li>
            <li className="flex flex-col items-center cursor-pointer">
              <Link className="ito" href={`/contact`}>
                <ChatBubbleBottomCenterTextIcon className="w-6 h-6 mx-auto" />
              </Link>
            </li>
            <li className="flex flex-col items-center cursor-pointer">
              {!hasEnvVars ? <EnvVarWarning /> : user ? <HeaderAuth user={user} /> : <AuthModal />}
            </li>
          </ul>
        </nav>
      </div>

      {/* Botón flotante (solo en móvil) */}
      <div className="fixed bottom-20 rigth-4 md:hidden hidden">
        <FloatingButton />
      </div>
    </header>
  );
};