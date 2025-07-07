
import { createClient } from "@/utils/supabase/server";
import { Header } from "@/components/header";

export default async function HeaderWithAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <Header user={user} />;
}
