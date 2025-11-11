import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Card } from "@/components/ui/card";

interface VideoChapter {
  time: number;
  title: string;
  description?: string;
}

interface VideoChapterListProps {
  chapters: VideoChapter[];
  onChange: (chapters: VideoChapter[]) => void;
}

export const VideoChapterList = ({ chapters, onChange }: VideoChapterListProps) => {
  const addChapter = () => {
    onChange([...chapters, { time: 0, title: "" }]);
  };

  const updateChapter = (index: number, updates: Partial<VideoChapter>) => {
    const newChapters = [...chapters];
    newChapters[index] = { ...newChapters[index], ...updates };
    onChange(newChapters);
  };

  const deleteChapter = (index: number) => {
    onChange(chapters.filter((_, i) => i !== index));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const parseTime = (timeStr: string): number => {
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      const mins = parseInt(parts[0]) || 0;
      const secs = parseInt(parts[1]) || 0;
      return mins * 60 + secs;
    }
    return 0;
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Video Chapters</label>
      
      {chapters.map((chapter, index) => (
        <Card key={index} className="p-3">
          <div className="flex items-start gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground mt-2 cursor-move" />
            
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="0:00"
                  value={formatTime(chapter.time)}
                  onChange={(e) => updateChapter(index, { time: parseTime(e.target.value) })}
                  className="w-20 text-sm"
                />
                <Input
                  placeholder="Chapter title"
                  value={chapter.title}
                  onChange={(e) => updateChapter(index, { title: e.target.value })}
                  className="text-sm"
                />
              </div>
              <Textarea
                placeholder="Optional description"
                value={chapter.description || ""}
                onChange={(e) => updateChapter(index, { description: e.target.value })}
                rows={2}
                className="text-xs"
              />
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteChapter(index)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </Card>
      ))}
      
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={addChapter}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Chapter
      </Button>
    </div>
  );
};
