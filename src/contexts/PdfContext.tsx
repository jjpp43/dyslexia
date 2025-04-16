"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface PdfContextType {
  parsedData: any;
  setParsedData: (data: any) => void;
}

const PdfContext = createContext<PdfContextType | undefined>(undefined);

export const PdfProvider = ({ children }: { children: ReactNode }) => {
  const [parsedData, setParsedData] = useState<any>(null);

  return (
    <PdfContext.Provider value={{ parsedData, setParsedData }}>
      {children}
    </PdfContext.Provider>
  );
};

export const usePdf = () => {
  const context = useContext(PdfContext);
  if (context === undefined) {
    throw new Error("usePdf must be used within a PdfProvider");
  }
  return context;
};
