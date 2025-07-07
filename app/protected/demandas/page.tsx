import { getUserDemandas } from "@/actions/demanda-actions";

export default async function UserDemandsPage() {
  let demands = [];

  try {
    demands = await getUserDemandas();
  } catch (error: any) {
    return <p>{error.message}</p>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-medium mb-4">Mis Demandas</h1>

      {demands.length === 0 ? (
        <p>No tienes demandas creadas.</p>
      ) : (
        <ul className="list-disc pl-5">
          {demands.map((demand) => (
            <li key={demand.id} className="mb-4">
              <h2 className="text-xl font-semibold">{demand.empresa}</h2>
              <p>Responsable: {demand.responsable_solicitud}</p>
              <p>Email de contacto: {demand.email_contacto}</p>
              <p>Teléfono: {demand.telefono}</p>
              <p>
                Fecha de inicio:{" "}
                {new Date(demand.fecha_inicio).toLocaleDateString()}
              </p>
              <p>
                Fecha de vencimiento:{" "}
                {new Date(demand.fecha_vencimiento).toLocaleDateString()}
              </p>
              {/* <p>Rubro(s): {demand.rubro_demanda?.join(", ")}</p> */}
              <p>Detalle: {demand.detalle}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
