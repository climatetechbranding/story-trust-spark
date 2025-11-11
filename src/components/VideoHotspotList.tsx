import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VideoHotspot {
  time: number;
  x: number;
  y: number;
  icon: string;
  action: "text" | "link" | "evidence";
  content: string;
}

interface VideoHotspotListProps {
  hotspots: VideoHotspot[];
  onChange: (hotspots: VideoHotspot[]) => void;
}

export const VideoHotspotList = ({ hotspots, onChange }: VideoHotspotListProps) => {
  const addHotspot = () => {
    onChange([...hotspots, { time: 0, x: 50, y: 50, icon: "info", action: "text", content: "" }]);
  };

  const updateHotspot = (index: number, updates: Partial<VideoHotspot>) => {
    const newHotspots = [...hotspots];
    newHotspots[index] = { ...newHotspots[index], ...updates };
    onChange(newHotspots);
  };

  const deleteHotspot = (index: number) => {
    onChange(hotspots.filter((_, i) => i !== index));
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
      <label className="text-sm font-medium">Interactive Hotspots</label>
      
      {hotspots.map((hotspot, index) => (
        <Card key={index} className="p-3">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-2" />
            
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="0:00"
                  value={formatTime(hotspot.time)}
                  onChange={(e) => updateHotspot(index, { time: parseTime(e.target.value) })}
                  className="w-20 text-sm"
                />
                <Select
                  value={hotspot.action}
                  onValueChange={(value: any) => updateHotspot(index, { action: value })}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Show Text</SelectItem>
                    <SelectItem value="link">External Link</SelectItem>
                    <SelectItem value="evidence">Open Evidence</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder={hotspot.action === "text" ? "Text to display" : "URL"}
                value={hotspot.content}
                onChange={(e) => updateHotspot(index, { content: e.target.value })}
                className="text-sm"
              />
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>Position: {hotspot.x}%, {hotspot.y}%</span>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteHotspot(index)}
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
        onClick={addHotspot}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Hotspot
      </Button>
    </div>
  );
};
