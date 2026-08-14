import { useEffect, useState } from 'react';

interface UseTypewriterOptions {
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

const useTypewriter = (phrases: string[], options: UseTypewriterOptions = {}) => {
  const { typingSpeed = 80, deletingSpeed = 40, pauseDuration = 1500 } = options;
  const [text, setText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (phrases.length === 0) return;
    const currentPhrase = phrases[phraseIndex % phrases.length];

    if (!isDeleting && text === currentPhrase) {
      const pause = setTimeout(() => setIsDeleting(true), pauseDuration);
      return () => clearTimeout(pause);
    }

    if (isDeleting && text === '') {
      const next = setTimeout(() => {
        setIsDeleting(false);
        setPhraseIndex((i) => i + 1);
      }, 0);
      return () => clearTimeout(next);
    }

    const timeout = setTimeout(
      () => {
        setText(currentPhrase.slice(0, isDeleting ? text.length - 1 : text.length + 1));
      },
      isDeleting ? deletingSpeed : typingSpeed,
    );
    return () => clearTimeout(timeout);
  }, [text, isDeleting, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseDuration]);

  return text;
};

export default useTypewriter;
