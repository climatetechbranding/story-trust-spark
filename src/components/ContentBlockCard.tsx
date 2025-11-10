import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BranchSelector } from "@/components/BranchSelector";
import { StoryBranch } from "@/hooks/useStories";
import { nanoid } from "nanoid";
import {
  Video,
  Type,
  Image as ImageIcon,
  Map,
  GitBranch,
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
  GripVertical,
  Upload,
} from "lucide-react";

interface ContentBlock {
  id: string;
  type: "video" | "text" | "image" | "map" | "branch_choice";
  content: any;
}

interface ContentBlockCardProps {
  block: ContentBlock;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: (content: any) => void;
  branches?: StoryBranch[];
  currentBranchId?: string;
  onCreateBranch?: (optionId: string, branchName: string, branchIcon?: string) => string;
}

export const ContentBlockCard = ({
  block,
  isExpanded,
  onToggle,
  onDelete,
  onUpdate,
  branches = [],
  currentBranchId = "",
  onCreateBranch,
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
      case "branch_choice":
        return <GitBranch className="h-5 w-5 text-pink-600" />;
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
      case "branch_choice":
        return block.content.text || "Branch Choice";
    }
  };

  const addOption = () => {
    const newOptionText = `Option ${(block.content.options?.length || 0) + 1}`;
    const newOption = {
      id: nanoid(),
      text: newOptionText,
      media: { url: "" },
      targetBranchId: "",
      targetBranchName: ""
    };
    
    // Auto-create branch if callback provided
    if (onCreateBranch) {
      const branchId = onCreateBranch(newOption.id, newOptionText);
      newOption.targetBranchId = branchId;
      newOption.targetBranchName = newOptionText;
    }
    
    onUpdate({
      ...block.content,
      options: [...(block.content.options || []), newOption]
    });
  };

  const updateOption = (optionId: string, updates: any) => {
    onUpdate({
      ...block.content,
      options: block.content.options.map((opt: any) =>
        opt.id === optionId ? { ...opt, ...updates } : opt
      )
    });
  };

  const deleteOption = (optionId: string) => {
    onUpdate({
      ...block.content,
      options: block.content.options.filter((opt: any) => opt.id !== optionId)
    });
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

          {block.type === "branch_choice" && (
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column - Content Editing */}
              <div className="space-y-4">
                {/* Background Section */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Background</label>
                  <Input
                    type="color"
                    value={block.content.backgroundColor || "#f3f4f6"}
                    onChange={(e) => onUpdate({ ...block.content, backgroundColor: e.target.value })}
                    className="h-10 w-full"
                  />
                </div>

                {/* Media Section */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Media</label>
                  <div className="flex items-center gap-3">
                    {block.content.media?.url ? (
                      <div className="w-20 h-20 rounded-lg overflow-hidden border">
                        <img src={block.content.media.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <Input
                        type="text"
                        placeholder="Image URL"
                        value={block.content.media?.url || ""}
                        onChange={(e) => onUpdate({ ...block.content, media: { url: e.target.value } })}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Text Section */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Text</label>
                  <Textarea
                    value={block.content.text || ""}
                    onChange={(e) => onUpdate({ ...block.content, text: e.target.value })}
                    placeholder="Describe the branching choice..."
                    rows={3}
                  />
                </div>

                {/* Branching Options */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Branching Options</label>
                  <div className="space-y-2">
                    {(block.content.options || []).map((option: any) => (
                      <Card key={option.id} className="p-3">
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground mt-2 cursor-move" />
                          
                          {/* Option Media Thumbnail */}
                          <div className="flex-shrink-0">
                            {option.media?.url ? (
                              <div className="w-10 h-10 rounded overflow-hidden border">
                                <img src={option.media.url} alt="" className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded border-2 border-dashed flex items-center justify-center">
                                <Upload className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          
                          {/* Option Text */}
                          <div className="flex-1 space-y-2">
                            <Input
                              value={option.text}
                              onChange={(e) => updateOption(option.id, { text: e.target.value })}
                              placeholder="Option text"
                              className="text-sm"
                            />
                            <Input
                              value={option.media?.url || ""}
                              onChange={(e) => updateOption(option.id, { media: { url: e.target.value } })}
                              placeholder="Option image URL"
                              className="text-xs"
                            />
                          </div>
                          
                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteOption(option.id)}
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
                      onClick={addOption}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column - Logic Display */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Branching Logic</label>
                  <div className="space-y-3 text-sm">
                    {(block.content.options || []).map((option: any) => {
                      const targetBranch = branches.find(b => b.id === option.targetBranchId);
                      return (
                        <div key={option.id} className="p-3 bg-muted/50 rounded-lg space-y-1">
                          <p className="text-xs text-muted-foreground">When chosen option</p>
                          <p className="font-medium">is <span className="text-primary">"{option.text}"</span></p>
                          <p className="text-xs text-muted-foreground">then start branch</p>
                          <BranchSelector
                            branches={branches}
                            currentBranchId={currentBranchId}
                            value={option.targetBranchId || ""}
                            onValueChange={(value) => {
                              const branch = branches.find(b => b.id === value);
                              updateOption(option.id, { 
                                targetBranchId: value,
                                targetBranchName: branch?.name || ""
                              });
                            }}
                            placeholder="Select branch"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
