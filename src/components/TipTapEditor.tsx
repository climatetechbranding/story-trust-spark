import { useEditor, EditorContent } from '@tiptap/react';
import { getTipTapExtensions } from '@/lib/tiptap-config';
import { TipTapToolbar } from './TipTapToolbar';
import { useBrandTheme } from '@/contexts/BrandThemeContext';
import { useEffect } from 'react';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string, plainText: string) => void;
  maxCharacters?: number;
}

export const TipTapEditor = ({ content, onChange, maxCharacters = 500 }: TipTapEditorProps) => {
  const { theme } = useBrandTheme();
  
  const editor = useEditor({
    extensions: getTipTapExtensions(maxCharacters),
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const plainText = editor.getText();
      onChange(html, plainText);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
        style: `font-family: ${theme?.secondaryFont || 'Inter'}; color: hsl(${theme?.textColor || '222.2 84% 4.9%'})`,
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const characterCount = editor.storage.characterCount.characters();
  const characterLimit = maxCharacters;

  return (
    <div className="border rounded-lg overflow-hidden">
      <TipTapToolbar editor={editor} />
      <EditorContent editor={editor} className="bg-background" />
      <div className="px-4 py-2 border-t flex justify-between items-center text-xs text-muted-foreground">
        <span>
          {characterCount} / {characterLimit} characters
        </span>
        {characterCount > characterLimit * 0.9 && (
          <span className="text-warning">Approaching character limit</span>
        )}
      </div>
    </div>
  );
};
