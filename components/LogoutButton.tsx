"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm px-4 py-2 border border-line rounded"
    >
      تسجيل الخروج
    </button>
  );
}
