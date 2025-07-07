"use client";

import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    motivo: "",
    mensaje: "",
  });

  const [isSending, setIsSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    toast.info("Enviando mensaje...");

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Mensaje enviado con éxito 🎉");
        setFormData({ nombre: "", apellido: "", email: "", motivo: "", mensaje: "" });
      } else {
        toast.error("Hubo un problema al enviar el mensaje 😢");
      }
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      toast.error("Error al enviar el mensaje 🚨");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex mt-[110px] md:mt-[110px] md:items-center px-[50px] md:px-0 justify-center mb-[50px]">
      <form
        onSubmit={handleSubmit}
        className="p-6 w-full max-w-md border-2 border-slate-950 rounded-md bg-white shadow-lg"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Contáctanos</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium text-left">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-b-2 border-slate-950 p-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-left">Apellido (opcional)</label>
          <input
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-b-2 border-slate-950 p-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-left">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-b-2 border-slate-950 p-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-left">Motivo</label>
          <input
            type="text"
            name="motivo"
            value={formData.motivo}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-b-2 border-slate-950 p-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-left">Mensaje</label>
          <textarea
            name="mensaje"
            value={formData.mensaje}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-b-2 border-slate-950 p-2"
            rows={4}
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white w-full p-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          disabled={isSending}
        >
          {isSending ? "Enviando..." : "Enviar"}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default ContactPage;
