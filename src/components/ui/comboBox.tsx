"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFont } from "@/contexts/FontContext";

const fonts = [
  {
    value: "atkinson",
    label: "Atkinson Hyperlegible",
    fontFamily: "var(--font-atkinson)",
  },
  {
    value: "roboto",
    label: "Roboto",
    fontFamily: "var(--font-roboto)",
  },
  {
    value: "open-dyslexic",
    label: "OpenDyslexic",
    fontFamily: "var(--font-open-dyslexic)",
  },
  {
    value: "verdana",
    label: "Verdana",
    fontFamily: "var(--font-verdana)",
  },
];

export function ComboBox() {
  const [open, setOpen] = React.useState(false);
  const { selectedFont, setSelectedFont } = useFont();

  const selectedFontStyle =
    fonts.find((font) => font.value === selectedFont)?.fontFamily || "inherit";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between relative"
        >
          <span
            className="w-[150px] overflow-hidden text-left ml-1"
            style={{ fontFamily: selectedFontStyle }}
          >
            {selectedFont
              ? fonts.find((font) => font.value === selectedFont)?.label
              : "Select font..."}
          </span>
          <ChevronsUpDown className="absolute ml-2 h-4 w-4 opacity-50 shrink-0 right-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search font..." />
          <CommandEmpty>No font found.</CommandEmpty>
          <CommandGroup>
            {fonts.map((font) => (
              <CommandItem
                key={font.value}
                value={font.value}
                onSelect={(currentValue) => {
                  setSelectedFont(
                    currentValue === selectedFont ? "" : currentValue
                  );
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedFont === font.value ? "opacity-100" : "opacity-0"
                  )}
                />
                <span
                  className="text-base"
                  style={{ fontFamily: font.fontFamily }}
                >
                  {font.label}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
