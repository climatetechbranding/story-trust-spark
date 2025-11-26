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
import { supabase } from "@/integrations/supabase/client";
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
  ChevronRight,
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
  
  // General media upload for images and videos
  const uploadMedia = async (file: File): Promise<string | null> => {
    try {
      const maxSize = 20 * 1024 * 1024; // 20MB
      if (file.size > maxSize) {
        throw new Error('File must be less than 20MB');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const folder = file.type.startsWith('video/') ? 'videos' : 'images';
      const filePath = `${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('brand-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Upload failed:', error.message);
      return null;
    }
  };
  
  // Video block dropzone
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

  // Branch Choice top media dropzone
  const onTopMediaDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && block.type === "branch_choice") {
      const file = acceptedFiles[0];
      const url = await uploadMedia(file);
      if (url) {
        onUpdate({ ...block.content, media: { url } });
      }
    }
  }, [block.type, block.content, onUpdate]);

  const topMediaDropzone = useDropzone({
    onDrop: onTopMediaDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'] },
    maxFiles: 1,
    disabled: uploading,
  });

  // Branch Choice background media dropzone
  const onBackgroundMediaDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && block.type === "branch_choice") {
      const file = acceptedFiles[0];
      const url = await uploadMedia(file);
      if (url) {
        onUpdate({ ...block.content, backgroundMedia: url });
      }
    }
  }, [block.type, block.content, onUpdate]);

  const backgroundMediaDropzone = useDropzone({
    onDrop: onBackgroundMediaDrop,
    accept: { 
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
      'video/*': ['.mp4', '.mov', '.webm']
    },
    maxFiles: 1,
    disabled: uploading,
  });

  // Branch Choice option media upload
  const uploadOptionMedia = useCallback(async (file: File, optionId: string) => {
    const url = await uploadMedia(file);
    if (url) {
      updateOption(optionId, { media: { url } });
    }
  }, []);

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
    const newOptionId = nanoid();
    
    // Auto-create branch if callback provided
    let branchId = "";
    if (onCreateBranch) {
      branchId = onCreateBranch(newOptionId, newOptionText);
    }
    
    const newOption = {
      id: newOptionId,
      text: newOptionText,
      media: { url: "" },
      targetBranchId: branchId,
      targetBranchName: newOptionText
    };
    
    onUpdate({
      ...block.content,
      options: [...(block.content.options || []), newOption]
    });
  };

  const updateOption = (optionId: string, updates: any) => {
    const updatedOptions = block.content.options.map((opt: any) =>
      opt.id === optionId ? { ...opt, ...updates } : opt
    );
    
    onUpdate({
      ...block.content,
      options: updatedOptions
    });
    
    // If text was updated, sync the branch name
    if (updates.text && updates.text !== "") {
      const option = block.content.options.find((opt: any) => opt.id === optionId);
      if (option?.targetBranchId) {
        const event = new CustomEvent('updateBranchName', {
          detail: { branchId: option.targetBranchId, name: updates.text }
        });
        window.dispatchEvent(event);
      }
    }
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
              
              {/* Substantiation/Green Claim */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-substantiation"
                    checked={block.content.substantiation?.enabled || false}
                    onCheckedChange={(checked) => {
                      const substantiation = checked 
                        ? { 
                            enabled: true,
                            title: "Sustainability Claim",
                            summary: "Add verification details here...",
                            evidence: "",
                          }
                        : { enabled: false };
                      onUpdate({ ...block.content, substantiation });
                    }}
                  />
                  <Label htmlFor="has-substantiation" className="text-sm font-medium">
                    Add sustainability claim (swipe-up verification)
                  </Label>
                </div>
                
                {block.content.substantiation?.enabled && (
                  <div className="space-y-3 pl-6 border-l-2 border-primary/20">
                    <div>
                      <label className="text-xs font-medium mb-1 block">Claim Title</label>
                      <Input
                        value={block.content.substantiation?.title || ""}
                        onChange={(e) => onUpdate({ 
                          ...block.content, 
                          substantiation: { ...block.content.substantiation, title: e.target.value }
                        })}
                        placeholder="e.g., 100% Recycled Materials"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Plain Language Summary</label>
                      <Textarea
                        value={block.content.substantiation?.summary || ""}
                        onChange={(e) => onUpdate({ 
                          ...block.content, 
                          substantiation: { ...block.content.substantiation, summary: e.target.value }
                        })}
                        placeholder="Explain the claim in consumer-friendly language..."
                        rows={3}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Evidence / Documentation</label>
                      <Textarea
                        value={block.content.substantiation?.evidence || ""}
                        onChange={(e) => onUpdate({ 
                          ...block.content, 
                          substantiation: { ...block.content.substantiation, evidence: e.target.value }
                        })}
                        placeholder="Link to certifications, test results, LCA reports..."
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
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
                  
                  {/* Substantiation/Green Claim */}
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="video-substantiation"
                        checked={block.content.substantiation?.enabled || false}
                        onCheckedChange={(checked) => {
                          const substantiation = checked 
                            ? { 
                                enabled: true,
                                title: "Sustainability Claim",
                                summary: "Add verification details here...",
                                evidence: "",
                              }
                            : { enabled: false };
                          onUpdate({ ...block.content, substantiation });
                        }}
                      />
                      <Label htmlFor="video-substantiation" className="text-sm font-medium">
                        Add sustainability claim (swipe-up verification)
                      </Label>
                    </div>
                    
                    {block.content.substantiation?.enabled && (
                      <div className="space-y-3 pl-6 border-l-2 border-primary/20">
                        <div>
                          <label className="text-xs font-medium mb-1 block">Claim Title</label>
                          <Input
                            value={block.content.substantiation?.title || ""}
                            onChange={(e) => onUpdate({ 
                              ...block.content, 
                              substantiation: { ...block.content.substantiation, title: e.target.value }
                            })}
                            placeholder="e.g., Carbon Neutral Production"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium mb-1 block">Plain Language Summary</label>
                          <Textarea
                            value={block.content.substantiation?.summary || ""}
                            onChange={(e) => onUpdate({ 
                              ...block.content, 
                              substantiation: { ...block.content.substantiation, summary: e.target.value }
                            })}
                            placeholder="Explain the claim in consumer-friendly language..."
                            rows={3}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium mb-1 block">Evidence / Documentation</label>
                          <Textarea
                            value={block.content.substantiation?.evidence || ""}
                            onChange={(e) => onUpdate({ 
                              ...block.content, 
                              substantiation: { ...block.content.substantiation, evidence: e.target.value }
                            })}
                            placeholder="Link to certifications, test results..."
                            rows={2}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
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

                {/* Top Media Section */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Top Media (Optional)</label>
                  <div {...topMediaDropzone.getRootProps()} className={`border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors ${topMediaDropzone.isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}`}>
                    <input {...topMediaDropzone.getInputProps()} />
                    {block.content.media?.url ? (
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded overflow-hidden border">
                          <img src={block.content.media.url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 text-xs">
                          <p className="text-muted-foreground">Click or drag to replace</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdate({ ...block.content, media: null });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {topMediaDropzone.isDragActive ? 'Drop image here' : 'Click or drag image here'}
                        </p>
                      </div>
                    )}
                  </div>
                  {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading... {progress}%</p>}
                </div>

                {/* Background Media Section */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Background Media (Image/Video)</label>
                  <div {...backgroundMediaDropzone.getRootProps()} className={`border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors ${backgroundMediaDropzone.isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}`}>
                    <input {...backgroundMediaDropzone.getInputProps()} />
                    {block.content.backgroundMedia ? (
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded overflow-hidden border">
                          {block.content.backgroundMedia.includes('video') ? (
                            <video src={block.content.backgroundMedia} className="w-full h-full object-cover" />
                          ) : (
                            <img src={block.content.backgroundMedia} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 text-xs">
                          <p className="text-muted-foreground">Click or drag to replace</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdate({ ...block.content, backgroundMedia: null });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {backgroundMediaDropzone.isDragActive ? 'Drop media here' : 'Click or drag image/video here'}
                        </p>
                      </div>
                    )}
                  </div>
                  {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading... {progress}%</p>}
                </div>

                {/* Title Text Section */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Title (Keep it short - max 6 words)</label>
                  <Input
                    value={block.content.text || ""}
                    onChange={(e) => onUpdate({ ...block.content, text: e.target.value })}
                    placeholder="Welcome to our story..."
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {block.content.text?.split(' ').length || 0} words
                  </p>
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
                            <label htmlFor={`option-media-${option.id}`} className="cursor-pointer">
                              {option.media?.url ? (
                                <div className="w-10 h-10 rounded overflow-hidden border hover:opacity-80 transition-opacity">
                                  <img src={option.media.url} alt="" className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded border-2 border-dashed flex items-center justify-center hover:border-primary transition-colors">
                                  <Upload className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                            </label>
                            <input
                              id={`option-media-${option.id}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  await uploadOptionMedia(file, option.id);
                                }
                              }}
                            />
                          </div>
                          
                          {/* Option Text */}
                          <div className="flex-1 space-y-2">
                            <Input
                              value={option.text}
                              onChange={(e) => updateOption(option.id, { text: e.target.value })}
                              placeholder="Option text (keep short)"
                              className="text-sm"
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

                {/* Sub-branch Navigation */}
                {(block.content.options || []).some((opt: any) => opt.targetBranchId) && (
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium mb-2 block">Edit Sub-branches</label>
                    <div className="space-y-2">
                      {(block.content.options || []).map((option: any) => {
                        const targetBranch = branches.find(b => b.id === option.targetBranchId);
                        if (!targetBranch) {
                          console.log('No branch found for option:', option.id, 'targetBranchId:', option.targetBranchId);
                          return null;
                        }
                        return (
                          <Button
                            key={option.id}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Navigating to branch:', option.targetBranchId, targetBranch.name);
                              // Navigate to branch - need to pass this up
                              const event = new CustomEvent('navigateToBranch', { 
                                detail: { branchId: option.targetBranchId } 
                              });
                              window.dispatchEvent(event);
                            }}
                          >
                            <GitBranch className="h-3 w-3 mr-2" />
                            {targetBranch.name}
                            <ChevronRight className="h-3 w-3 ml-auto" />
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}
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
