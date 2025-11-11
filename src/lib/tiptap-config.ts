import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import CharacterCount from '@tiptap/extension-character-count';

export const getTipTapExtensions = (maxCharacters: number = 500) => [
  StarterKit.configure({
    heading: {
      levels: [2, 3, 4],
    },
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-primary underline',
    },
  }),
  TextStyle,
  Color,
  Highlight.configure({
    multicolor: true,
  }),
  CharacterCount.configure({
    limit: maxCharacters,
  }),
];

export const sustainabilityTerms = [
  'carbon neutral',
  'carbon negative',
  'net zero',
  'recycled',
  'recyclable',
  'biodegradable',
  'compostable',
  'organic',
  'sustainable',
  'eco-friendly',
  'green',
  'renewable',
  'zero waste',
  'circular',
  'upcycled',
  'fair trade',
  'ethical',
  'climate positive',
  'offsetting',
  'emissions',
];

export const detectGreenClaims = (text: string): string[] => {
  const claims: string[] = [];
  const lowerText = text.toLowerCase();
  
  sustainabilityTerms.forEach(term => {
    if (lowerText.includes(term)) {
      claims.push(term);
    }
  });
  
  return claims;
};
