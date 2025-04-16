"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type FontContextType = {
  selectedFont: string;
  setSelectedFont: (font: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
};

const FontContext = createContext<FontContextType | undefined>(undefined);

export const useFont = () => {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error("useFont must be used within a FontProvider");
  }
  return context;
};

export const FontProvider = ({ children }: { children: ReactNode }) => {
  const [selectedFont, setSelectedFont] = useState("atkinson");
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    // Handle special case for OpenDyslexic
    const fontClass =
      selectedFont === "open-dyslexic"
        ? "font-openDyslexic"
        : `font-${selectedFont}`;
    document.body.className = fontClass;
    document.body.style.fontSize = `${fontSize}px`;
  }, [selectedFont, fontSize]);

  return (
    <FontContext.Provider
      value={{ selectedFont, setSelectedFont, fontSize, setFontSize }}
    >
      {children}
    </FontContext.Provider>
  );
};
