"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { usePdf } from "@/contexts/PdfContext";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const supabase = createClient();
  const [session, setSession] = useState<any>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { setParsedData } = usePdf(); // to store globally

  const handleUpload = async () => {
    if (!file || !session) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.pages) {
        setParsedData(data.pages);
        router.push("/refined");
      } else {
        console.error("Parsing failed:", data.error);
      }
    } catch (err) {
      console.error("❌ Error while uploading:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!session) {
        handleLogin();
        return;
      }
      const pdf = acceptedFiles[0];
      if (pdf?.type === "application/pdf") {
        setFile(pdf);
      }
    },
    [session]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) console.error("Error:", error.message);
  };

  // const handleUpload = async () => {
  //   if (!file || !session) return;
  //   const pages = await parsePdf(file);
  //   setParsedData(pages);
  //   router.push("/refined");
  // };
  return (
    <div className="h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-extrabold text-gray-900 sm:text-4xl">
            Upload your PDF
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Drag and drop your PDF file here, or click to select a file
          </p>
        </div>

        <div className="mt-10">
          <div
            {...getRootProps()}
            className={`mx-auto max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
              isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
            }`}
          >
            <div className="space-y-1 text-center">
              <input {...getInputProps()} />
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-gray-500">
                {file
                  ? `Selected: ${file.name}`
                  : "Drop a PDF here, or click to select"}
              </p>
            </div>
          </div>

          {file && (
            <div className="mt-5 text-center">
              <button
                onClick={handleUpload}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Processing..." : "Process PDF"}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
