import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ContentBlock {
  id: string;
  type: "video" | "text" | "image" | "map" | "button";
  content: any;
}

const StoryBuilder = () => {
  const navigate = useNavigate();
  const [storyName, setStoryName] = useState("New Sustainability Story");
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

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
                onChange={(e) => setStoryName(e.target.value)}
                className="text-lg font-semibold border-none focus-visible:ring-0 w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate(`/story/preview`)}>
                <Smartphone className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button>
                <Eye className="h-4 w-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Builder */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[300px_1fr_300px] gap-6">
          {/* Content Blocks Palette */}
          <Card className="p-6 h-fit sticky top-24">
            <h3 className="font-semibold mb-4">Add Content</h3>
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
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-2">Story Canvas</h2>
              <p className="text-muted-foreground mb-6">
                Add content blocks to build your interactive sustainability story
              </p>

              {blocks.length === 0 ? (
                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                  <Plus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Start by adding content blocks from the left panel
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {blocks.map((block) => (
                    <Card
                      key={block.id}
                      className={`p-4 cursor-pointer transition-all ${
                        selectedBlock === block.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedBlock(block.id)}
                    >
                      <div className="flex items-center gap-3">
                        {block.type === "text" && <Type className="h-5 w-5 text-blue-600" />}
                        {block.type === "video" && <Video className="h-5 w-5 text-purple-600" />}
                        {block.type === "image" && <ImageIcon className="h-5 w-5 text-green-600" />}
                        {block.type === "map" && <Map className="h-5 w-5 text-orange-600" />}
                        {block.type === "button" && <MousePointerClick className="h-5 w-5 text-pink-600" />}
                        <div className="flex-1">
                          <p className="font-medium capitalize">{block.type} Block</p>
                          <p className="text-sm text-muted-foreground">
                            {block.type === "text" && block.content.title}
                            {block.type === "button" && block.content.label}
                            {block.type === "map" && block.content.label}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Properties Panel */}
          <Card className="p-6 h-fit sticky top-24">
            <h3 className="font-semibold mb-4">Properties</h3>
            {selectedBlock ? (
              <div className="space-y-4">
                {blocks.find((b) => b.id === selectedBlock)?.type === "text" && (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Title</label>
                      <Input placeholder="Section title" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Content</label>
                      <Textarea placeholder="Write your story..." rows={6} />
                    </div>
                  </>
                )}
                {blocks.find((b) => b.id === selectedBlock)?.type === "button" && (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Button Label</label>
                      <Input placeholder="Learn More" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Action</label>
                      <Input placeholder="URL or next section" />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select a content block to edit its properties
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StoryBuilder;
