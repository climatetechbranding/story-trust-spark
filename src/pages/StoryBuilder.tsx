import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Plus, 
  Video, 
  Type, 
  Image as ImageIcon, 
  Map, 
  MousePointerClick,
  Smartphone,
  Save,
  Eye,
  Loader2
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ContentBlockCard } from "@/components/ContentBlockCard";
import { MobilePreview } from "@/components/MobilePreview";
import { useStory, useSaveStory, usePublishStory, ContentBlock } from "@/hooks/useStories";
import { Skeleton } from "@/components/ui/skeleton";

const StoryBuilder = () => {
  const navigate = useNavigate();
  const { id: storyId } = useParams<{ id: string }>();
  const [storyName, setStoryName] = useState("New Sustainability Story");
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { data: story, isLoading } = useStory(storyId);
  const saveStory = useSaveStory();
  const publishStory = usePublishStory();

  // Load story data when fetched
  useEffect(() => {
    if (story) {
      setStoryName(story.name);
      setBlocks(story.content || []);
      setHasUnsavedChanges(false);
    }
  }, [story]);

  const blockTypes = [
    { type: "text" as const, icon: Type, label: "Text", color: "text-blue-600" },
    { type: "video" as const, icon: Video, label: "Video", color: "text-purple-600" },
    { type: "image" as const, icon: ImageIcon, label: "Image", color: "text-green-600" },
    { type: "map" as const, icon: Map, label: "Map", color: "text-orange-600" },
    { type: "button" as const, icon: MousePointerClick, label: "Button", color: "text-pink-600" },
  ];

  const addBlock = (type: ContentBlock["type"]) => {
    const newBlock: ContentBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: getDefaultContent(type),
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlock(newBlock.id);
    setHasUnsavedChanges(true);
  };

  const updateBlock = (id: string, content: any) => {
    setBlocks(blocks.map((block) => 
      block.id === id ? { ...block, content } : block
    ));
    setHasUnsavedChanges(true);
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter((block) => block.id !== id));
    if (selectedBlock === id) {
      setSelectedBlock(null);
    }
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    const result = await saveStory.mutateAsync({
      id: storyId,
      name: storyName,
      content: blocks,
    });

    // If we just created a new story, navigate to its edit page
    if (storyId === "new" && result.id) {
      navigate(`/story/${result.id}/edit`, { replace: true });
    }
    
    setHasUnsavedChanges(false);
  };

  const handlePublish = async () => {
    // Save first if there are unsaved changes
    if (hasUnsavedChanges || storyId === "new") {
      const result = await saveStory.mutateAsync({
        id: storyId,
        name: storyName,
        content: blocks,
      });
      
      if (result.id) {
        await publishStory.mutateAsync(result.id);
        if (storyId === "new") {
          navigate(`/story/${result.id}/edit`, { replace: true });
        }
      }
    } else if (story?.id) {
      await publishStory.mutateAsync(story.id);
    }
    
    setHasUnsavedChanges(false);
  };

  const getDefaultContent = (type: ContentBlock["type"]) => {
    switch (type) {
      case "text":
        return { title: "New Section", body: "Tell your sustainability story..." };
      case "video":
        return { url: "", caption: "" };
      case "image":
        return { url: "", alt: "" };
      case "map":
        return { lat: 52.3676, lng: 4.9041, label: "Amsterdam Workshop" };
      case "button":
        return { label: "Learn More", action: "" };
      default:
        return {};
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-10 w-64" />
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Input
                value={storyName}
                onChange={(e) => {
                  setStoryName(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                className="text-lg font-semibold border-none focus-visible:ring-0 w-64"
              />
              {hasUnsavedChanges && (
                <span className="text-xs text-muted-foreground">Unsaved changes</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate(story?.id ? `/story/${story.id}` : `/story/preview`)}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button 
                variant="outline"
                onClick={handleSave}
                disabled={saveStory.isPending}
              >
                {saveStory.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Draft
              </Button>
              <Button
                onClick={handlePublish}
                disabled={publishStory.isPending || saveStory.isPending}
              >
                {(publishStory.isPending || saveStory.isPending) ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                Publish
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Builder */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[280px_1fr_320px] gap-6">
          {/* Content Blocks Palette */}
          <Card className="p-6 h-fit sticky top-24">
            <h3 className="font-semibold mb-4">Content Blocks</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Add blocks to build your story
            </p>
            <div className="space-y-2">
              {blockTypes.map(({ type, icon: Icon, label, color }) => (
                <Button
                  key={type}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => addBlock(type)}
                >
                  <Icon className={`h-4 w-4 mr-2 ${color}`} />
                  {label}
                </Button>
              ))}
            </div>
          </Card>

          {/* Canvas */}
          <div className="space-y-4">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-1">Story Canvas</h2>
              <p className="text-sm text-muted-foreground">
                Click on blocks to expand and edit their properties
              </p>
            </div>

            {blocks.length === 0 ? (
              <Card className="p-12 text-center border-2 border-dashed">
                <Plus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Start by adding content blocks from the left panel
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {blocks.map((block) => (
                  <ContentBlockCard
                    key={block.id}
                    block={block}
                    isExpanded={selectedBlock === block.id}
                    onToggle={() => 
                      setSelectedBlock(selectedBlock === block.id ? null : block.id)
                    }
                    onDelete={() => deleteBlock(block.id)}
                    onUpdate={(content) => updateBlock(block.id, content)}
                  />
                ))}
              </div>
            )}

            {blocks.length > 0 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedBlock(null)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Block
              </Button>
            )}
          </div>

          {/* Mobile Preview */}
          <MobilePreview blocks={blocks} selectedBlock={selectedBlock} />
        </div>
      </div>
    </div>
  );
};

export default StoryBuilder;
