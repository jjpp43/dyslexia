import { NextRequest, NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { json } from "stream/consumers";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("❌ Missing API_KEY in environment variables.");
}

export async function POST(req: NextRequest) {
  try {
    const { pageData } = await req.json();

    if (!pageData) {
      return NextResponse.json(
        { error: "No page data provided" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 1,
        maxOutputTokens: 3000,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    const prompt = `
You are an assistant that processes text from a PDF page.

You are given:
- width and height of the page
- a list of text blocks, with position (x, y) and fontSize

Your job:
- Reconstruct the natural reading order
- Merge words into full sentences
- Identify whether text is a 'title', 'subtitle', or 'paragraph' based on fontSize and position
- Keep the structure and meaning intact

IMPORTANT: 
For each block, instead of returning a single string, split the content into sentences.

Return like this:
[
  { 
    "type": "title",
    "sentences": [ ["This is the title."] ]
  },
  { 
    "type": "paragraph",
    "sentences": [
      ["This is the first sentence.", "And this is the second."],
      ["Another sentence in a new paragraph."]
    ]
  }
]

OR if there is mixed formatting like bold or italic in a sentence:
[
  {
    "type": "title",
    "sentences": [
      [
        { "text": "This ", "bold": true },
        { "text": "is a title." }
      ]
    ]
  }
]

DO NOT return any other explanations, only JSON like above.

Here is the data:
${JSON.stringify(pageData)}
`;

    console.log("Sending to Gemini...");

    const result = await model.generateContent(prompt);
    const responseText = result.response?.text();
    if (!responseText) {
      return NextResponse.json(
        { error: "Empty response from Gemini" },
        { status: 500 }
      );
    }

    let cleanedText = responseText.trim();

    // Remove ```json or ``` from start
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/```json|```/, "");
    }

    // Remove ``` from end
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.slice(0, -3);
    }

    let jsonResult;

    try {
      jsonResult = JSON.parse(cleanedText);
      console.log("RESULT: ", jsonResult);
    } catch (e) {
      console.error("Failed to parse AI output:", cleanedText);
      return NextResponse.json({ error: "Invalid AI output" }, { status: 500 });
    }

    return NextResponse.json({ result: jsonResult });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { error: "Failed to process AI" },
      { status: 500 }
    );
  }
}
