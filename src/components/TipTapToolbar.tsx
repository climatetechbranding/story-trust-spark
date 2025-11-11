import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading2,
  Link as LinkIcon,
  Highlighter,
} from 'lucide-react';
import { useBrandTheme } from '@/contexts/BrandThemeContext';

interface TipTapToolbarProps {
  editor: Editor;
}

export const TipTapToolbar = ({ editor }: TipTapToolbarProps) => {
  const { theme } = useBrandTheme();

  const setLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const applyBrandColor = (colorType: 'primary' | 'secondary') => {
    const color = colorType === 'primary' ? theme?.primaryColor : theme?.secondaryColor;
    if (color) {
      editor.chain().focus().setColor(`hsl(${color})`).run();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-muted' : ''}
      >
        <Bold className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-muted' : ''}
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
      >
        <Heading2 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'bg-muted' : ''}
      >
        <List className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'bg-muted' : ''}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Button
        variant="ghost"
        size="sm"
        onClick={setLink}
      >
        <LinkIcon className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()}
        className={editor.isActive('highlight') ? 'bg-muted' : ''}
      >
        <Highlighter className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => applyBrandColor('primary')}
        title="Apply primary brand color"
      >
        <div 
          className="h-4 w-4 rounded border" 
          style={{ backgroundColor: theme ? `hsl(${theme.primaryColor})` : '#3b82f6' }}
        />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => applyBrandColor('secondary')}
        title="Apply secondary brand color"
      >
        <div 
          className="h-4 w-4 rounded border" 
          style={{ backgroundColor: theme ? `hsl(${theme.secondaryColor})` : '#10b981' }}
        />
      </Button>
    </div>
  );
};
