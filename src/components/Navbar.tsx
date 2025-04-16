"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { ComboBox } from "@/components/ui/comboBox";
import { Slider } from "@/components/ui/slider";
import { useFont } from "@/contexts/FontContext";
import { Button } from "./ui/button";
import { Minus, Plus } from "lucide-react";

export default function Navbar() {
  const supabase = createClient();
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fontScale, setFontScale] = useState(1); // 1 = 100%
  const [spacing, setSpacing] = useState(2);

  // Give change to font spacing
  useEffect(() => {
    document.body.style.setProperty("letter-spacing", `${spacing}px`);
  }, [spacing]);

  // Give change to font size
  useEffect(() => {
    const clamped = Math.min(1.5, Math.max(0.8, fontScale));
    document.documentElement.style.setProperty(
      "--user-font-scale",
      clamped.toString()
    );
  }, [fontScale]);

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user);
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) console.error("Error:", error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-xl font-bold">PDF Refiner</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4 gap-4">
              <ComboBox />
              <div className="w-32">
                <Slider
                  min={2}
                  max={5}
                  step={0.1}
                  value={[spacing]}
                  onValueChange={(val) => setSpacing(val[0])}
                />
              </div>
              <div className="flex flex-row gap-2">
                <button
                  onClick={() =>
                    setFontScale((prev) =>
                      Math.max(0.8, parseFloat((prev - 0.1).toFixed(2)))
                    )
                  }
                  disabled={fontScale <= 0.8}
                  className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200"
                >
                  <Minus size={16} />
                </button>
                <span className="text-base">
                  {(fontScale * 100).toFixed(0)}%
                </span>
                <button
                  onClick={() =>
                    setFontScale((prev) =>
                      Math.min(1.5, parseFloat((prev + 0.1).toFixed(2)))
                    )
                  }
                  disabled={fontScale >= 1.5}
                  className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            {loading ? (
              <div className="w-24 h-9 bg-gray-100 rounded-md animate-pulse" />
            ) : !session ? (
              <button
                onClick={handleLogin}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Sign in with Google
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {user?.user_metadata?.avatar_url && (
                    <Image
                      src={user.user_metadata.avatar_url}
                      alt="User avatar"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {user?.user_metadata?.full_name || user?.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
