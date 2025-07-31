"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCheck() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        router.replace("/dashboard");
      } else {
        router.replace("/");
      }
    };
    checkSession();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-white text-lg">Checking authentication...</p>
    </div>
  );
}
