import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => {
          try {
            const cookie = await cookieStore;
            return cookie.get(name)?.value;
          } catch (error) {
            return undefined;
          }
        },
        set: async (name: string, value: string, options: any) => {
          try {
            const cookie = await cookieStore;
            cookie.set({ name, value, ...options });
          } catch (error) {
            // Handle error
          }
        },
        remove: async (name: string, options: any) => {
          try {
            const cookie = await cookieStore;
            cookie.set({ name, value: "", ...options });
          } catch (error) {
            // Handle error
          }
        },
      },
    }
  );
};
