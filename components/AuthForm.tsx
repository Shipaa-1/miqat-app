"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) setError(error.message);
      else {
        router.push("/");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      else {
        router.push("/");
        router.refresh();
      }
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-16 bg-white p-8 border-t-4 border-brass"
    >
      <h1 className="text-xl font-bold text-forestDark mb-6">
        {mode === "signup" ? "إنشاء حساب جديد" : "تسجيل الدخول"}
      </h1>

      {mode === "signup" && (
        <div className="mb-4">
          <label className="block text-sm mb-1">الاسم الكامل</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-line rounded px-3 py-2 text-sm"
          />
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm mb-1">البريد الإلكتروني</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-line rounded px-3 py-2 text-sm"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm mb-1">كلمة المرور</label>
        <input
          required
          type="password"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-line rounded px-3 py-2 text-sm"
        />
      </div>

      {error && (
        <p className="text-sm text-red-700 mb-4 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <button
        disabled={loading}
        className="w-full bg-forest text-white py-3 rounded font-bold text-sm disabled:opacity-60"
      >
        {loading ? "جاري التنفيذ..." : mode === "signup" ? "إنشاء الحساب" : "دخول"}
      </button>
    </form>
  );
}
