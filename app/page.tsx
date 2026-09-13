import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import ConsultantsGrid from "@/components/ConsultantsGrid";

export default async function HomePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: consultants } = await supabase
    .from("consultants")
    .select("id, name, specialty, category, price, initials, slots(id, label, is_booked)")
    .order("name");

  return (
    <>
      <Header />

      <section className="grid md:grid-cols-2 gap-10 items-center px-[6%] py-16 max-w-[1280px] mx-auto">
        <div>
          <h1 className="text-3xl md:text-[44px] font-extrabold leading-tight text-forestDark max-w-lg">
            لكل سؤال يحتاج وقتًا، هناك من يستحق أن يسمعه
          </h1>
          <p className="mt-5 text-muted max-w-md">
            اختر خبيرًا من مجاله، وحدد الموعد الذي يناسبك من جدوله المتاح. جلسة
            واحدة، مباشرة، بلا وسيط ولا انتظار طويل.
          </p>
          {!user && (
            <p className="mt-4 text-sm text-brassDark">
              سجّل دخولك أو أنشئ حسابًا عشان تقدر تحجز جلسة.
            </p>
          )}
        </div>
      </section>

      <div className="px-[6%] max-w-[1280px] mx-auto pb-2">
        <h2 className="text-xl font-bold text-forestDark">استشاريون متاحون هذا الأسبوع</h2>
        <p className="text-sm text-muted mt-1">
          كل بطاقة تعرض أوقاتًا فعلية متبقية في جدول الخبير — اضغط على الوقت لحجزه.
        </p>
      </div>

      <ConsultantsGrid consultants={consultants ?? []} isLoggedIn={!!user} />

      <footer className="text-center text-muted text-sm py-9">
        منصة ميقات — جميع الحجوزات والمواعيد الظاهرة هنا بيانات حقيقية متصلة بقاعدة البيانات.
      </footer>
    </>
  );
}
