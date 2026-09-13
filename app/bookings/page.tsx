import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";

export default async function BookingsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, created_at, slots(label, consultants(name, price, specialty))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <Header />
      <div className="max-w-[720px] mx-auto px-[6%] py-12">
        <h1 className="text-2xl font-bold text-forestDark mb-8">حجوزاتي</h1>

        {!bookings || bookings.length === 0 ? (
          <p className="text-muted">لسه ما حجزت أي جلسة.</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((b: any) => (
              <div key={b.id} className="bg-white border border-line border-t-[3px] border-t-brass p-5">
                <div className="flex justify-between">
                  <div>
                    <div className="font-bold">{b.slots?.consultants?.name}</div>
                    <div className="text-sm text-muted mt-1">
                      {b.slots?.consultants?.specialty}
                    </div>
                    <div className="text-sm text-forestDark mt-2">{b.slots?.label}</div>
                  </div>
                  <div className="font-bold text-forestDark">
                    {b.slots?.consultants?.price} ر.س
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
