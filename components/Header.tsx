import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

export default async function Header() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="flex items-center justify-between px-[6%] py-5 border-b border-line sticky top-0 bg-paper z-20">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-[42px] h-[42px] rounded-full bg-forest text-white flex items-center justify-center font-bold text-lg border-2 border-brass">
          م
        </div>
        <span className="text-2xl font-bold text-forestDark">ميقات</span>
      </Link>
      <nav className="flex items-center gap-6">
        {user ? (
          <>
            <Link href="/bookings" className="text-sm opacity-80 hover:opacity-100">
              حجوزاتي
            </Link>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm opacity-80 hover:opacity-100">
              تسجيل الدخول
            </Link>
            <Link
              href="/signup"
              className="text-sm px-4 py-2 border border-forest rounded text-forestDark"
            >
              إنشاء حساب
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
