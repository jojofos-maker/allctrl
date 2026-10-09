import { TimeCtrl } from "./time-ctrl";
import { authenticated } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export default async function Home() {
  const { user } = await authenticated();
  if (!user) redirect("/login");
  return <><div className="account-bar"><span>{user.email}</span><a href="/transfer">Historikk og sikkerhetskopi</a><form action="/auth/signout" method="post"><button>Logg ut</button></form></div><TimeCtrl key={user.id} userId={user.id} /></>;
}
