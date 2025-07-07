import { signOutAction } from "@/actions/auth-actions/actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";
import {
  UserIcon,ArrowRightStartOnRectangleIcon
} from "@heroicons/react/24/solid";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

export default async function AuthButton({ user }: { user: any }) {
  // Check environment variables (ensure this is called async if needed)
  if (!hasEnvVars) {
    return (
      <div className="flex gap-4 items-center">
        <Badge variant={"default"} className="font-normal pointer-events-none">
          Please update .env.local file with anon key and url
        </Badge>
        <div className="flex gap-2">
          
          <Button
            asChild
            size="sm"
            variant={"outline"}
            disabled
            className="opacity-75 cursor-none pointer-events-none"
          >
            <Link href="/sign-in">Iniciar Sesión</Link>
          </Button>
          <Button
            asChild
            size="sm"
            variant={"default"}
            disabled
            className="opacity-75 cursor-none pointer-events-none"
          >
            <Link href="/sign-up">Cerrar Sesión</Link>
          </Button>
          <li className="flex flex-col items-center cursor-pointer">
            
          </li>
        </div>
      </div>
    );
  }

  // Create Supabase client and get user data

  return user ? (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex flex-col items-center cursor-pointer">
        <UserIcon className="h-6 w-6 text-black" />
        <span className="hidden xl:block text-sm">Perfil</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-4 py-2 text-sm text-gray-700">
          <p className="font-semibold">Hola, {user.email}</p>
        </div>
        <DropdownMenuItem asChild>
          <Link href="/profile" className="w-full text-left">
            <UserIcon className="h-6 w-6 text-black" />
              Ir a Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
            <button type="submit" className="w-full flex items-center gap-2 text-left text-red-600" onClick={signOutAction}>
              <ArrowRightStartOnRectangleIcon className="h-6 w-6 text-black" />
              Cerrar Sesión
            </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href="/sign-in">Iniciar Sesión</Link>
      </Button>
      <Button asChild size="sm" variant="default">
        <Link href="/sign-up">Crear Cuenta</Link>
      </Button>
    </div>
  );
}