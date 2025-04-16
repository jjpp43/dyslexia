"use client";

import { usePdf } from "@/contexts/PdfContext";
import { useEffect, useState } from "react";

export default function RefinedPage() {
  const { parsedData } = usePdf();
  const [cleanedPages, setCleanedPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredSentence, setHoveredSentence] = useState<string | null>(null);

  // Save the response on the local storage
  useEffect(() => {
    if (cleanedPages.length > 0) {
      localStorage.setItem("cleanedPages", JSON.stringify(cleanedPages));
    }
  }, [cleanedPages]);

  // Make sure to remove the response from the storage to save a new one.
  useEffect(() => {
    if (parsedData?.length > 0) {
      localStorage.removeItem("cleanedPages");
    }
  }, [parsedData]);
  useEffect(() => {
    const saved = localStorage.getItem("cleanedPages");

    if (saved) {
      setCleanedPages(JSON.parse(saved));
      setLoading(false);
      return;
    }

    const fetchAIData = async () => {
      if (!parsedData) return;
      setLoading(true);

      // Helper function to break pages into chunks of size 'batchSize'
      const chunkArray = (arr: any[], batchSize: number) =>
        Array.from({ length: Math.ceil(arr.length / batchSize) }, (_, i) =>
          arr.slice(i * batchSize, i * batchSize + batchSize)
        );

      const results: any[] = [];

      // We'll process 2 pages at a time in parallel to avoid API overload
      for (const batch of chunkArray(parsedData, 2)) {
        try {
          // Fetch results for each page in this batch in parallel
          const responses = await Promise.all(
            batch.map((page) =>
              fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pageData: page }),
              }).then((res) => res.json())
            )
          );

          // Push cleaned result (or fallback if missing)
          responses.forEach((data) => {
            if (Array.isArray(data.result)) {
              results.push(data.result);
            } else {
              results.push([
                { type: "paragraph", sentences: [["[Invalid AI result]"]] },
              ]);
            }
          });
        } catch (error) {
          console.error("Batch failed:", error);
          // Fallback for entire batch
          batch.forEach(() => {
            results.push([
              { type: "paragraph", sentences: [["[Batch processing error]"]] },
            ]);
          });
        }
      }

      setCleanedPages(results);
      setLoading(false);
    };

    fetchAIData();
  }, [parsedData]);

  // Loading UI while waiting for Gemini's response
  const renderSentence = (sentence: any, key: string) => {
    const isHovered = hoveredSentence === key;
    // Merge parts into plain text for TTS
    const plainText =
      typeof sentence === "string"
        ? sentence
        : sentence.map((part: any) => part.text).join("");

    const speak = () => {
      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.lang = "en-US"; // Optional: Customize language
      window.speechSynthesis.cancel(); // Stop current speech
      window.speechSynthesis.speak(utterance);
    };

    return (
      <span
        key={key}
        onMouseEnter={() => setHoveredSentence(key)}
        onMouseLeave={() => setHoveredSentence(null)}
        onClick={speak} // 🔊 Play sentence when clicked
        className={`inline-block rounded px-1 ${
          isHovered ? "bg-red-300 transition" : "transition"
        } mr-1`}
      >
        {typeof sentence === "string"
          ? sentence
          : sentence.map((part: any, i: number) => (
              <span
                key={i}
                className={`${part.bold ? "font-bold" : ""} ${
                  part.italic ? "italic" : ""
                }`}
              >
                {part.text}
              </span>
            ))}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-lg">Processing with AI...</div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 overflow-y-auto">
      <div className="mx-32 py-10 border-2">
        {cleanedPages.map((page, pageIndex) => (
          <div key={pageIndex}>
            <h2 className="font-semibold mb-6">Page {pageIndex + 1}</h2>
            {/* Iterate through each block in the page (title, subtitle, paragraph) */}
            {page.map((block: any, idx: number) => (
              <div key={idx} className="mb-12">
                {/* Each block contains multiple paragraphs (array of sentence arrays) */}
                {block.sentences?.map((paragraph: any[], pIdx: number) => (
                  // Render each paragraph with bottom margin and proper line height
                  <p
                    key={pIdx}
                    className="paragraph mb-4 leading-7 cursor-pointer"
                  >
                    {/* Render each sentence inside the paragraph */}
                    {paragraph.map((sentence, sIdx) =>
                      renderSentence(
                        sentence,
                        `page${pageIndex}-block${idx}-p${pIdx}-s${sIdx}` // Unique key for each sentence
                      )
                    )}
                  </p>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
