import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BranchSelector } from "@/components/BranchSelector";
import { StoryBranch } from "@/hooks/useStories";
import { nanoid } from "nanoid";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { VideoChapterList } from "@/components/VideoChapterList";
import { VideoHotspotList } from "@/components/VideoHotspotList";
import { TipTapEditor } from "@/components/TipTapEditor";
import { GreenClaimsDetector } from "@/components/GreenClaimsDetector";
import { NodeSettingsPanel } from "@/components/NodeSettingsPanel";
import { useVideoUpload } from "@/hooks/useVideoUpload";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
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
  settings?: any;
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
  const { uploadVideo, uploading, progress } = useVideoUpload();
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && block.type === "video") {
      const file = acceptedFiles[0];
      const url = await uploadVideo(file);
      if (url) {
        onUpdate({ ...block.content, url });
      }
    }
  }, [block.type, block.content, uploadVideo, onUpdate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.webm'] },
    maxFiles: 1,
    disabled: uploading,
  });

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
                <TipTapEditor
                  content={block.content.html || block.content.body || ""}
                  onChange={(html, plainText) => 
                    onUpdate({ ...block.content, html, body: plainText, plainText })
                  }
                  maxCharacters={500}
                />
              </div>
              
              {/* Green Claims Detector */}
              {block.content.plainText && (
                <GreenClaimsDetector text={block.content.plainText} />
              )}
            </>
          )}

          {block.type === "video" && (
            <>
              {/* Video Upload */}
              <div>
                <label className="text-sm font-medium mb-2 block">Video</label>
                {!block.content.url ? (
                  <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    <input {...getInputProps()} />
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {uploading ? `Uploading... ${progress}%` : 'Drag & drop video or click to browse'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">MP4, MOV, WebM (max 200MB)</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <video src={block.content.url} controls className="w-full h-full" />
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onUpdate({ ...block.content, url: "" })}>
                      Change Video
                    </Button>
                  </div>
                )}
              </div>

              {block.content.url && (
                <>
                  {/* Basic Settings */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input
                      value={block.content.title || ""}
                      onChange={(e) => onUpdate({ ...block.content, title: e.target.value })}
                      placeholder="Video title"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea
                      value={block.content.description || ""}
                      onChange={(e) => onUpdate({ ...block.content, description: e.target.value })}
                      placeholder="Video description"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="autoplay"
                        checked={block.content.autoplay !== false}
                        onCheckedChange={(checked) => onUpdate({ ...block.content, autoplay: checked })}
                      />
                      <Label htmlFor="autoplay" className="text-xs">Autoplay</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="loop"
                        checked={block.content.loop || false}
                        onCheckedChange={(checked) => onUpdate({ ...block.content, loop: checked })}
                      />
                      <Label htmlFor="loop" className="text-xs">Loop</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="muted"
                        checked={block.content.muted || false}
                        onCheckedChange={(checked) => onUpdate({ ...block.content, muted: checked })}
                      />
                      <Label htmlFor="muted" className="text-xs">Mute by default</Label>
                    </div>
                  </div>

                  {/* Chapters */}
                  <VideoChapterList
                    chapters={block.content.chapters || []}
                    onChange={(chapters) => onUpdate({ ...block.content, chapters })}
                  />

                  {/* Hotspots */}
                  <VideoHotspotList
                    hotspots={block.content.hotspots || []}
                    onChange={(hotspots) => onUpdate({ ...block.content, hotspots })}
                  />
                </>
              )}
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

          {/* Node Settings Panel - Show for all types */}
          <NodeSettingsPanel
            settings={block.settings || {}}
            onChange={(settings) => {
              // Update both content and settings
              const updatedBlock = { ...block, settings };
              onUpdate(block.content);
              // We need to pass the whole block back, but onUpdate only takes content
              // So we'll store settings alongside content
              onUpdate({ ...block.content, __settings: settings });
            }}
          />
        </div>
      )}
    </Card>
  );
};
