"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { headers as getHeaders } from 'next/headers';

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  // Utiliza await para esperar que se resuelva la promesa de headers()
  const headersResolved = await headers();
  
  // Ahora puedes acceder al encabezado 'origin'
  const origin = headersResolved.get("origin");

  const callbackUrl = formData.get("callbackUrl")?.toString();


  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    // Redirect con confirmation email
    // return encodedRedirect(
    //   "success",
    //   "/sign-up",
    //   "Thanks for signing up! Please check your email for a verification link.",
    // );
    return encodedRedirect(
        "success",
        "/update-profile",
        "",
      );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Error de inicio de sesión:", error.message);
    return { error: "Correo o contraseña incorrectos".normalize("NFC") };

  }

  return redirect("/");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const headers = await getHeaders(); // Await to resolve the promise 
  const origin = headers.get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return { status: "error", message: "Password and confirm password are required" };
  }

  if (password !== confirmPassword) {
    return { status: "error", message: "Passwords do not match" };
  }

  // Actualiza la contraseña
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { status: "error", message: "Password update failed" };
  }

  // ✅ IMPORTANTE: Cerrar sesión completamente
  await supabase.auth.signOut();

  return { status: "success", message: "Password updated. Please log in with your new password." };
};



export const signOutAction = async () => {
  console.log("Ejecutando signOutAction...");
  const supabase = await createClient();
  await supabase.auth.signOut();
  console.log("Sesión cerrada");
  return redirect("/sign-in");
};

