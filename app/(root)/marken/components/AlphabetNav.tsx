import React from 'react';

interface AlphabetNavProps {
  selectedLetter: string;
  onLetterClick: (letter: string) => void;
  availableLetters: string[];
}

export const AlphabetNav: React.FC<AlphabetNavProps> = ({ 
  selectedLetter, 
  onLetterClick, 
  availableLetters 
}) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 mb-12">
      <button
        onClick={() => onLetterClick('all')}
        className={`text-xs tracking-wider transition-colors ${
          selectedLetter === 'all' 
            ? 'text-black font-medium' 
            : 'text-gray-400 hover:text-black'
        }`}
      >
        *
      </button>
      {alphabet.map((letter) => (
        <button
          key={letter}
          onClick={() => onLetterClick(letter)}
          disabled={!availableLetters.includes(letter)}
          className={`text-xs tracking-wider transition-colors ${
            selectedLetter === letter
              ? 'text-black font-medium'
              : availableLetters.includes(letter)
              ? 'text-gray-600 hover:text-black'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          {letter}
        </button>
      ))}
    </div>
  );
};