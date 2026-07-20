import { useEffect, useState } from "react";

export function useTypewriter(words) {
  const [wordIndex, setWordIndex] = useState(0);
  const [letterIndex, setLetterIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex];
    const delay = deleting ? 34 : 72;
    const timer = setTimeout(() => {
      if (!deleting && letterIndex === current.length) {
        setTimeout(() => setDeleting(true), 800);
        return;
      }
      if (deleting && letterIndex === 0) {
        setDeleting(false);
        setWordIndex((wordIndex + 1) % words.length);
        return;
      }
      setLetterIndex((value) => value + (deleting ? -1 : 1));
    }, delay);

    return () => clearTimeout(timer);
  }, [deleting, letterIndex, wordIndex, words]);

  return words[wordIndex].slice(0, letterIndex);
}
