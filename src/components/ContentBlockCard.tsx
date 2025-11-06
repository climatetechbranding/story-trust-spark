import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Video,
  Type,
  Image as ImageIcon,
  Map,
  MousePointerClick,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";

interface ContentBlock {
  id: string;
  type: "video" | "text" | "image" | "map" | "button";
  content: any;
}

interface ContentBlockCardProps {
  block: ContentBlock;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: (content: any) => void;
}

export const ContentBlockCard = ({
  block,
  isExpanded,
  onToggle,
  onDelete,
  onUpdate,
}: ContentBlockCardProps) => {
  const getIcon = () => {
    switch (block.type) {
      case "text":
        return <Type className="h-5 w-5 text-primary" />;
      case "video":
        return <Video className="h-5 w-5 text-purple-600" />;
      case "image":
        return <ImageIcon className="h-5 w-5 text-secondary" />;
      case "map":
        return <Map className="h-5 w-5 text-orange-600" />;
      case "button":
        return <MousePointerClick className="h-5 w-5 text-pink-600" />;
    }
  };

  const getTitle = () => {
    switch (block.type) {
      case "text":
        return block.content.title || "Text Block";
      case "video":
        return block.content.caption || "Video Block";
      case "image":
        return block.content.alt || "Image Block";
      case "map":
        return block.content.label || "Map Block";
      case "button":
        return block.content.label || "Button Block";
    }
  };

  return (
    <Card className={`transition-all ${isExpanded ? "ring-2 ring-primary" : ""}`}>
      {/* Header */}
      <div
        className="p-4 cursor-pointer flex items-center gap-3 hover:bg-muted/50"
        onClick={onToggle}
      >
        {getIcon()}
        <div className="flex-1">
          <p className="font-medium capitalize">{getTitle()}</p>
          <p className="text-xs text-muted-foreground capitalize">{block.type}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {/* Expanded Properties */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t pt-4">
          {block.type === "text" && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  value={block.content.title}
                  onChange={(e) =>
                    onUpdate({ ...block.content, title: e.target.value })
                  }
                  placeholder="Section title"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Content</label>
                <Textarea
                  value={block.content.body}
                  onChange={(e) =>
                    onUpdate({ ...block.content, body: e.target.value })
                  }
                  placeholder="Write your story..."
                  rows={6}
                />
              </div>
            </>
          )}

          {block.type === "video" && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Video URL</label>
                <Input
                  value={block.content.url}
                  onChange={(e) =>
                    onUpdate({ ...block.content, url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Caption</label>
                <Input
                  value={block.content.caption}
                  onChange={(e) =>
                    onUpdate({ ...block.content, caption: e.target.value })
                  }
                  placeholder="Video description"
                />
              </div>
            </>
          )}

          {block.type === "image" && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Image URL</label>
                <Input
                  value={block.content.url}
                  onChange={(e) =>
                    onUpdate({ ...block.content, url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Alt Text</label>
                <Input
                  value={block.content.alt}
                  onChange={(e) =>
                    onUpdate({ ...block.content, alt: e.target.value })
                  }
                  placeholder="Describe the image"
                />
              </div>
            </>
          )}

          {block.type === "map" && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Location Label</label>
                <Input
                  value={block.content.label}
                  onChange={(e) =>
                    onUpdate({ ...block.content, label: e.target.value })
                  }
                  placeholder="Amsterdam Workshop"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Latitude</label>
                  <Input
                    type="number"
                    value={block.content.lat}
                    onChange={(e) =>
                      onUpdate({ ...block.content, lat: parseFloat(e.target.value) })
                    }
                    placeholder="52.3676"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Longitude</label>
                  <Input
                    type="number"
                    value={block.content.lng}
                    onChange={(e) =>
                      onUpdate({ ...block.content, lng: parseFloat(e.target.value) })
                    }
                    placeholder="4.9041"
                  />
                </div>
              </div>
            </>
          )}

          {block.type === "button" && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Button Label</label>
                <Input
                  value={block.content.label}
                  onChange={(e) =>
                    onUpdate({ ...block.content, label: e.target.value })
                  }
                  placeholder="Learn More"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Action</label>
                <Input
                  value={block.content.action}
                  onChange={(e) =>
                    onUpdate({ ...block.content, action: e.target.value })
                  }
                  placeholder="URL or next section"
                />
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
};
