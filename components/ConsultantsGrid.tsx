"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Slot = { id: string; label: string; is_booked: boolean };
type Consultant = {
  id: string;
  name: string;
  specialty: string;
  category: string;
  price: number;
  initials: string;
  slots: Slot[];
};

const CATEGORIES = [
  { id: "all", label: "الكل" },
  { id: "business", label: "أعمال ومشاريع" },
  { id: "legal", label: "قانون" },
  { id: "career", label: "مهني ووظيفي" },
  { id: "mental", label: "صحة نفسية" },
  { id: "finance", label: "مال واستثمار" },
];

export default function ConsultantsGrid({
  consultants,
  isLoggedIn,
}: {
  consultants: Consultant[];
  isLoggedIn: boolean;
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [pendingSlot, setPendingSlot] = useState<{
    slot: Slot;
    consultant: Consultant;
  } | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    "idle"
  );
  const router = useRouter();
  const supabase = createClient();

  const filtered = consultants.filter(
    (c) => activeCategory === "all" || c.category === activeCategory
  );

  function handleSlotClick(consultant: Consultant, slot: Slot) {
    if (slot.is_booked) return;
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setPendingSlot({ slot, consultant });
    setStatus("idle");
  }

  async function confirmBooking() {
    if (!pendingSlot) return;
    setStatus("saving");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const { error } = await supabase
      .from("bookings")
      .insert({ user_id: user.id, slot_id: pendingSlot.slot.id });

    if (error) {
      setStatus("error");
    } else {
      setStatus("done");
      router.refresh();
    }
  }

  return (
    <>
      <div className="flex gap-2 flex-wrap px-[6%] max-w-[1280px] mx-auto pb-8">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-4 py-2 rounded-full text-sm border transition-all ${
              activeCategory === c.id
                ? "bg-forest border-forest text-white"
                : "bg-white border-line hover:border-forest"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 px-[6%] pb-16 max-w-[1280px] mx-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <div key={c.id} className="bg-white border border-line border-t-[3px] border-t-brass p-5">
            <div className="flex items-start gap-3">
              <div className="w-[52px] h-[52px] rounded-full bg-paper2 border border-line flex items-center justify-center font-bold text-forestDark shrink-0">
                {c.initials}
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{c.name}</h3>
                <p className="text-sm text-muted mt-1">{c.specialty}</p>
              </div>
              <div className="text-left">
                <div className="font-bold text-forestDark text-sm">{c.price} ر.س</div>
                <div className="text-xs text-muted">/الجلسة</div>
              </div>
            </div>
            <div className="h-px bg-line my-4" />
            <div className="flex flex-wrap gap-2">
              {c.slots.map((s) => (
                <button
                  key={s.id}
                  disabled={s.is_booked}
                  onClick={() => handleSlotClick(c, s)}
                  className={`slot-btn text-sm px-3 py-2 rounded border ${
                    s.is_booked
                      ? "bg-paper2 border-line text-muted line-through cursor-not-allowed"
                      : "bg-paper border-line hover:border-brass"
                  }`}
                >
                  {s.label}
                </button>
              ))}
              {c.slots.length === 0 && (
                <span className="text-sm text-muted">لا توجد مواعيد متاحة حاليًا</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {pendingSlot && (
        <div className="fixed inset-0 bg-[rgba(30,42,34,0.55)] flex items-center justify-center z-40 p-5">
          <div className="bg-white max-w-md w-full p-7 border-t-4 border-brass">
            {status !== "done" ? (
              <>
                <h3 className="text-lg font-bold text-forestDark mb-4">تأكيد الحجز</h3>
                <div className="flex justify-between text-sm border-b border-line pb-3 mb-3">
                  <div>
                    <div className="font-bold">{pendingSlot.consultant.name}</div>
                    <div className="text-muted text-xs">{pendingSlot.slot.label}</div>
                  </div>
                  <div>{pendingSlot.consultant.price} ر.س</div>
                </div>
                {status === "error" && (
                  <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 mb-3">
                    حصل خطأ أثناء الحجز، جرّب مرة تانية.
                  </p>
                )}
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => setPendingSlot(null)}
                    className="flex-1 border border-line rounded py-3 text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={confirmBooking}
                    disabled={status === "saving"}
                    className="flex-1 bg-forest text-white rounded py-3 text-sm font-bold disabled:opacity-60"
                  >
                    {status === "saving" ? "جاري الحجز..." : "تأكيد الحجز"}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-3">
                <div className="w-[70px] h-[70px] rounded-full border-[3px] border-forest text-forest flex items-center justify-center mx-auto mb-4 text-3xl">
                  ✓
                </div>
                <h3 className="text-forestDark font-bold mb-2">تم تأكيد حجزك</h3>
                <p className="text-sm text-muted mb-5">
                  تقدر تشوف تفاصيل الجلسة في صفحة "حجوزاتي".
                </p>
                <button
                  onClick={() => setPendingSlot(null)}
                  className="w-full bg-forest text-white py-3 rounded font-bold text-sm"
                >
                  تم
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
