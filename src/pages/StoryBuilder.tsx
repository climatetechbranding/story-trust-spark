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
  Smartphone,
  Save,
  Eye,
  Loader2,
  ChevronRight,
  Home,
  GitBranch
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ContentBlockCard } from "@/components/ContentBlockCard";
import { MobilePreview } from "@/components/MobilePreview";
import { useStory, useSaveStory, usePublishStory, ContentBlock, StoryBranch } from "@/hooks/useStories";
import { Skeleton } from "@/components/ui/skeleton";
import { nanoid } from "nanoid";

const StoryBuilder = () => {
  const navigate = useNavigate();
  const { id: storyId } = useParams<{ id: string }>();
  const [storyName, setStoryName] = useState("New Sustainability Story");
  const [branches, setBranches] = useState<StoryBranch[]>([
    { id: "root", name: "Main Story", parentId: null, blocks: [] }
  ]);
  const [currentBranchId, setCurrentBranchId] = useState("root");
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { data: story, isLoading } = useStory(storyId);
  const saveStory = useSaveStory();
  const publishStory = usePublishStory();

  const currentBranch = branches.find((b) => b.id === currentBranchId);
  const blocks = currentBranch?.blocks || [];

  // Load story data when fetched
  useEffect(() => {
    if (story) {
      setStoryName(story.name);
      setBranches(story.branches || [{ id: "root", name: "Main Story", parentId: null, blocks: [] }]);
      setCurrentBranchId(story.rootBranchId || "root");
      setHasUnsavedChanges(false);
    }
  }, [story]);

  const blockTypes = [
    { type: "text" as const, icon: Type, label: "Text", color: "text-blue-600" },
    { type: "video" as const, icon: Video, label: "Video", color: "text-purple-600" },
    { type: "image" as const, icon: ImageIcon, label: "Image", color: "text-green-600" },
    { type: "map" as const, icon: Map, label: "Map", color: "text-orange-600" },
    { type: "branch_choice" as const, icon: GitBranch, label: "Branch Choice", color: "text-pink-600" },
  ];

  const addBlock = (type: ContentBlock["type"]) => {
    const newBlock: ContentBlock = {
      id: nanoid(),
      type,
      content: getDefaultContent(type),
    };
    const updatedBlocks = [...blocks, newBlock];
    updateCurrentBranchBlocks(updatedBlocks);
    setSelectedBlock(newBlock.id);
    setHasUnsavedChanges(true);
  };

  const updateBlock = (id: string, content: any) => {
    const updatedBlocks = blocks.map((block) => 
      block.id === id ? { ...block, content } : block
    );
    updateCurrentBranchBlocks(updatedBlocks);
    setHasUnsavedChanges(true);
  };

  const deleteBlock = (id: string) => {
    const updatedBlocks = blocks.filter((block) => block.id !== id);
    updateCurrentBranchBlocks(updatedBlocks);
    if (selectedBlock === id) {
      setSelectedBlock(null);
    }
    setHasUnsavedChanges(true);
  };

  const updateCurrentBranchBlocks = (newBlocks: ContentBlock[]) => {
    setBranches(branches.map((branch) =>
      branch.id === currentBranchId
        ? { ...branch, blocks: newBlocks }
        : branch
    ));
  };

  const createBranchForOption = (optionId: string, branchName: string, branchIcon?: string): string => {
    const newBranch: StoryBranch = {
      id: nanoid(),
      name: branchName,
      parentId: currentBranchId,
      blocks: [],
      icon: branchIcon,
    };
    
    setBranches(prev => [...prev, newBranch]);
    setHasUnsavedChanges(true);
    
    return newBranch.id;
  };

  const navigateToBranch = (branchId: string) => {
    setCurrentBranchId(branchId);
    setSelectedBlock(null);
  };

  // Listen for branch navigation events from ContentBlockCard
  useEffect(() => {
    const handleNavigate = (event: any) => {
      if (event.detail?.branchId) {
        navigateToBranch(event.detail.branchId);
      }
    };
    window.addEventListener('navigateToBranch', handleNavigate);
    return () => window.removeEventListener('navigateToBranch', handleNavigate);
  }, []);

  const getBreadcrumbs = () => {
    const breadcrumbs: StoryBranch[] = [];
    let branch = currentBranch;
    
    while (branch) {
      breadcrumbs.unshift(branch);
      branch = branches.find((b) => b.id === branch?.parentId);
    }
    
    return breadcrumbs;
  };

  const handleSave = async () => {
    const result = await saveStory.mutateAsync({
      id: storyId,
      name: storyName,
      branches,
      rootBranchId: branches[0]?.id || "root",
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
        branches,
        rootBranchId: branches[0]?.id || "root",
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
      case "branch_choice":
        return { media: { url: "" }, text: "", options: [] };
      default:
        return {};
    }
  };

  const childBranches = branches.filter((b) => b.parentId === currentBranchId);

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
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          {getBreadcrumbs().map((branch, index) => (
            <div key={branch.id} className="flex items-center gap-2">
              {index === 0 ? (
                <Home className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <button
                onClick={() => navigateToBranch(branch.id)}
                className={`hover:text-primary ${
                  branch.id === currentBranchId ? "font-semibold text-foreground" : "text-muted-foreground"
                }`}
              >
                {branch.icon && <img src={branch.icon} alt="" className="inline-block w-4 h-4 mr-1" />}
                {branch.name}
              </button>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[280px_1fr_320px] gap-6">
          {/* Content Blocks Palette */}
          <Card className="p-6 h-fit sticky top-24 space-y-6">
            <div>
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
            </div>

            {childBranches.length > 0 && (
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <GitBranch className="h-4 w-4" />
                  <h3 className="font-semibold">Child Branches</h3>
                </div>
                <div className="space-y-2">
                  {childBranches.map((branch) => (
                    <Button
                      key={branch.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => navigateToBranch(branch.id)}
                    >
                      {branch.icon && (
                        <img src={branch.icon} alt="" className="w-4 h-4 mr-2" />
                      )}
                      {branch.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Canvas */}
          <div className="space-y-4">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-1">{currentBranch?.name || "Story Canvas"}</h2>
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
                    branches={branches}
                    currentBranchId={currentBranchId}
                    onCreateBranch={createBranchForOption}
                  />
                ))}
              </div>
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
