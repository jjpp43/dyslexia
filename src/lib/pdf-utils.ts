export function extractParagraphsFromTextBlocks(
  texts: { text: string; x: number; y: number; fontSize?: number }[],
  lineThreshold = 0.5,
  paragraphGap = 2
) {
  const lines: { y: number; words: { text: string; x: number }[] }[] = [];

  // Step 1: Group into lines based on y
  texts.forEach((block) => {
    const existingLine = lines.find(
      (line) => Math.abs(line.y - block.y) < lineThreshold
    );

    if (existingLine) {
      existingLine.words.push({ text: block.text, x: block.x });
    } else {
      lines.push({ y: block.y, words: [{ text: block.text, x: block.x }] });
    }
  });

  // Step 2: Sort lines top to bottom, words left to right
  lines.sort((a, b) => a.y - b.y);
  lines.forEach((line) => line.words.sort((a, b) => a.x - b.x));

  // Step 3: Join words per line
  const mergedLines = lines.map((line) => ({
    y: line.y,
    text: joinWordsWithSmartSpacing(line.words),
  }));

  // Step 4: Group lines into paragraphs based on vertical distance
  const paragraphs: string[][] = [];
  let currentParagraph: string[] = [];

  mergedLines.forEach((line, i) => {
    if (i > 0 && line.y - mergedLines[i - 1].y > paragraphGap) {
      paragraphs.push(currentParagraph);
      currentParagraph = [];
    }

    const sentences = line.text.match(/[^.!?]+[.!?]+/g) || [line.text];
    currentParagraph.push(...sentences.map((s) => s.trim()));
  });

  if (currentParagraph.length) paragraphs.push(currentParagraph);

  return paragraphs; // => [ [sentences], [sentences], ... ]
}
export function joinWordsWithSmartSpacing(
  words: { text: string; x: number }[],
  spacingThreshold = 1.5
) {
  return words.reduce((line, word, idx) => {
    if (idx === 0) return word.text;

    const prev = words[idx - 1];
    const gap = word.x - prev.x;

    if (gap > spacingThreshold) {
      return line + " " + word.text;
    } else {
      return line + word.text;
    }
  }, "");
}
