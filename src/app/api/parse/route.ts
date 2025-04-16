import { NextRequest, NextResponse } from "next/server";
import PDFParser from "pdf2json";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const buffer = Buffer.from(await file.arrayBuffer());

  const pdfParser = new PDFParser();

  return new Promise((resolve, reject) => {
    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      console.log("✅ PDF Data Ready", pdfData);

      const pages = (pdfData as any)?.Pages;

      if (!pages) {
        console.error("❌ No pages found in PDF data");
        return resolve(
          NextResponse.json(
            { error: "No readable content found" },
            { status: 400 }
          )
        );
      }

      // Reformat clean output with positions
      const refinedPages = pages.map((page: any) => ({
        width: page.Width,
        height: page.Height,
        texts: page.Texts.map((text: any) => ({
          text: decodeURIComponent(text.R[0].T),
          x: text.x, // horizontal pos
          y: text.y, // vertical pos
          fontSize: text.R[0].TS?.[1] || null, // sometimes available
        })),
      }));

      resolve(NextResponse.json({ pages: refinedPages }));
    });

    pdfParser.on("pdfParser_dataError", (errData) => {
      console.error("❌ PDF2JSON Parse Error:", errData);
      reject(
        NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 })
      );
    });

    pdfParser.parseBuffer(buffer);
  });
}
