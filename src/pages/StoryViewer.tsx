import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronUp, X, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BrandThemeProvider, useBrandTheme } from "@/contexts/BrandThemeContext";
import { BrandTheme } from "@/types/brand";
import { brandSettingsToTheme } from "@/hooks/useBrandSettings";
import { Skeleton } from "@/components/ui/skeleton";

interface ContentBlock {
  id: string;
  type: "video" | "text" | "image" | "map" | "branch_choice";
  content: any;
  settings?: any;
}

interface StoryBranch {
  id: string;
  name: string;
  icon?: string;
  blocks: ContentBlock[];
}

interface Story {
  id: string;
  name: string;
  content: {
    rootBranchId: string;
    branches: StoryBranch[];
  };
  custom_branding?: any;
  use_custom_brand?: boolean;
}

interface NavigationState {
  branchId: string;
  blockIndex: number;
}

const StoryViewerContent = ({ story }: { story: Story }) => {
  const [currentBranchId, setCurrentBranchId] = useState<string>(story.content.rootBranchId || "root");
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [navigationStack, setNavigationStack] = useState<NavigationState[]>([]);
  const [showLegal, setShowLegal] = useState(false);
  const [direction, setDirection] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoMuted, setVideoMuted] = useState(false);
  const { theme } = useBrandTheme();

  const branches = story.content.branches || [];
  const currentBranch = branches.find((b) => b.id === currentBranchId);
  const currentBlock = currentBranch?.blocks[currentBlockIndex];

  const handleSwipe = (event: any, info: PanInfo) => {
    const swipeThreshold = 50;
    
    if (info.offset.y < -swipeThreshold && !showLegal && currentBlock?.content.greenClaim) {
      setShowLegal(true);
    } else if (info.offset.y > swipeThreshold && showLegal) {
      setShowLegal(false);
    } else if (info.offset.x < -swipeThreshold && !showLegal) {
      handleNext();
    } else if (info.offset.x > swipeThreshold && !showLegal) {
      handlePrevious();
    }
  };

  const handleNext = () => {
    if (!currentBranch) return;
    if (currentBlockIndex < currentBranch.blocks.length - 1) {
      setCurrentBlockIndex(currentBlockIndex + 1);
      setDirection(1);
    }
  };

  const handlePrevious = () => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex(currentBlockIndex - 1);
      setDirection(-1);
    } else if (navigationStack.length > 0) {
      handleBack();
    }
  };

  const handleBranchNavigation = (targetBranchId: string) => {
    setNavigationStack([...navigationStack, { branchId: currentBranchId, blockIndex: currentBlockIndex }]);
    setCurrentBranchId(targetBranchId);
    setCurrentBlockIndex(0);
    setDirection(1);
    setShowLegal(false);
  };

  const handleBack = () => {
    if (navigationStack.length > 0) {
      const previous = navigationStack[navigationStack.length - 1];
      setCurrentBranchId(previous.branchId);
      setCurrentBlockIndex(previous.blockIndex);
      setNavigationStack(navigationStack.slice(0, -1));
      setDirection(-1);
      setShowLegal(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  if (!currentBlock) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Story content not available</h2>
          <p className="text-muted-foreground">This story has no content blocks.</p>
        </div>
      </div>
    );
  }

  const totalBlocks = currentBranch?.blocks.length || 0;

  return (
    <motion.div 
      className="h-screen w-full bg-background relative overflow-hidden"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleSwipe}
    >
      {/* Progress Indicators */}
      <div className="absolute top-4 left-4 right-4 flex gap-2 z-30">
        {Array.from({ length: totalBlocks }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all"
            style={{
              backgroundColor: i <= currentBlockIndex
                ? (theme ? `hsl(${theme.primaryColor})` : 'hsl(var(--primary))')
                : (theme ? `hsl(${theme.primaryColor} / 0.3)` : 'hsl(var(--primary) / 0.3)'),
            }}
          />
        ))}
      </div>

      {/* Back Button */}
      {navigationStack.length > 0 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-12 left-4 z-30 bg-black/20 hover:bg-black/40 text-white"
          onClick={handleBack}
        >
          <X className="h-5 w-5" />
        </Button>
      )}

      {/* Main Content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`${currentBranchId}-${currentBlockIndex}`}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="h-full w-full"
          style={{
            backgroundColor: currentBlock.settings?.appearance?.background || 'transparent',
          }}
        >
          {/* Video Block */}
          {currentBlock.type === "video" && (
            <div className="h-full relative bg-black">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
              <video
                className="h-full w-full object-cover"
                autoPlay={currentBlock.content.autoplay !== false}
                loop={currentBlock.content.loop}
                muted={videoMuted || currentBlock.content.muted}
                playsInline
              >
                <source src={currentBlock.content.url} type="video/mp4" />
              </video>
              
              <div className="absolute bottom-20 left-0 right-0 p-6 text-white">
                {currentBlock.content.title && (
                  <h1 className="text-3xl font-bold mb-2">{currentBlock.content.title}</h1>
                )}
                {currentBlock.content.description && (
                  <p className="text-sm opacity-90">{currentBlock.content.description}</p>
                )}
                {currentBlock.content.greenClaim && (
                  <div className="flex items-center gap-2 text-sm opacity-75 mt-4">
                    <ChevronUp className="h-4 w-4 animate-bounce" />
                    <span>Swipe up for proof</span>
                  </div>
                )}
              </div>

              <div className="absolute top-20 right-4 flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/20 hover:bg-black/40 text-white rounded-full"
                  onClick={() => setVideoPlaying(!videoPlaying)}
                >
                  {videoPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/20 hover:bg-black/40 text-white rounded-full"
                  onClick={() => setVideoMuted(!videoMuted)}
                >
                  {videoMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          )}

          {/* Text Block */}
          {currentBlock.type === "text" && (
            <div className="h-full flex items-center justify-center p-8">
              <div className="max-w-md text-center space-y-6">
                {currentBlock.content.title && (
                  <h2 className="text-4xl font-bold leading-tight">{currentBlock.content.title}</h2>
                )}
                {currentBlock.content.html ? (
                  <div 
                    className="text-lg leading-relaxed prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: currentBlock.content.html }}
                  />
                ) : currentBlock.content.text && (
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {currentBlock.content.text}
                  </p>
                )}
                {currentBlock.content.greenClaim && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-6">
                    <ChevronUp className="h-4 w-4 animate-bounce" />
                    <span>Swipe up for verification</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Image Block */}
          {currentBlock.type === "image" && (
            <div className="h-full relative">
              <img 
                src={currentBlock.content.url} 
                alt={currentBlock.content.alt || ""} 
                className="h-full w-full object-cover"
              />
              {currentBlock.content.caption && (
                <div className="absolute bottom-20 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-center">{currentBlock.content.caption}</p>
                </div>
              )}
            </div>
          )}

          {/* Map Block */}
          {currentBlock.type === "map" && (
            <div className="h-full relative">
              <div className="h-full bg-muted/50 flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="text-6xl mb-4">📍</div>
                  <h2 className="text-2xl font-bold mb-2">{currentBlock.content.location}</h2>
                  {currentBlock.content.latitude && currentBlock.content.longitude && (
                    <p className="text-muted-foreground text-sm">
                      {currentBlock.content.latitude}, {currentBlock.content.longitude}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Branch Choice Block */}
          {currentBlock.type === "branch_choice" && (
            <div 
              className="h-full relative flex flex-col items-center justify-center p-6"
              style={{
                backgroundColor: currentBlock.content.background || 'hsl(var(--background))',
              }}
            >
              {/* Background Media */}
              {currentBlock.content.backgroundMedia && (
                <div className="absolute inset-0 opacity-30">
                  {currentBlock.content.backgroundMedia.includes('video') ? (
                    <video 
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                    >
                      <source src={currentBlock.content.backgroundMedia} type="video/mp4" />
                    </video>
                  ) : (
                    <img 
                      src={currentBlock.content.backgroundMedia} 
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              )}

              <div className="relative z-10 max-w-sm w-full space-y-4">
                {/* Top Media */}
                {currentBlock.content.media && (
                  <div className="bg-white rounded-2xl p-4 shadow-lg">
                    <img 
                      src={currentBlock.content.media} 
                      alt=""
                      className="w-full h-32 object-contain"
                    />
                  </div>
                )}
                
                {/* Title in speech bubble */}
                {currentBlock.content.text && (
                  <div className="bg-white rounded-2xl p-4 shadow-lg relative">
                    <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white transform rotate-45" />
                    <h2 className="text-lg font-bold text-gray-900 leading-snug">
                      {currentBlock.content.text}
                    </h2>
                  </div>
                )}
                
                {/* Options as stacked buttons */}
                <div className="space-y-3 pt-2">
                  {currentBlock.content.options?.map((option: any, i: number) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleBranchNavigation(option.targetBranchId)}
                      className="w-full bg-white hover:bg-gray-50 rounded-2xl shadow-lg transition-all flex items-center gap-3 p-4"
                    >
                      {option.media && (
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
                          <img src={option.media} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <span className="text-gray-900 font-medium text-base leading-tight text-left flex-1">
                        {option.text}
                      </span>
                      <span className="text-primary text-xl">→</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Legal/Substantiation Drawer */}
      {currentBlock.content.substantiation && (
        <motion.div
          initial={false}
          animate={{
            y: showLegal ? 0 : "calc(100% - 80px)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute inset-x-0 bottom-0 bg-background rounded-t-3xl shadow-2xl border-t"
          style={{ height: "85vh" }}
          onClick={() => !showLegal && setShowLegal(true)}
        >
          <div className="flex justify-center py-3 cursor-pointer" onClick={() => showLegal && setShowLegal(false)}>
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
          </div>

          {showLegal && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10"
              onClick={(e) => {
                e.stopPropagation();
                setShowLegal(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          <div className="px-6 pb-6 overflow-y-auto" style={{ maxHeight: "calc(85vh - 60px)" }}>
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-3">{currentBlock.content.substantiation.title}</h3>
              </div>

              <div className="bg-card rounded-lg p-4 border">
                <p className="text-sm leading-relaxed text-foreground">
                  {currentBlock.content.substantiation.summary}
                </p>
              </div>

              {currentBlock.content.substantiation.evidence && (
                <div>
                  <h4 className="font-semibold mb-2">Evidence</h4>
                  <p className="text-sm text-muted-foreground">{currentBlock.content.substantiation.evidence}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

const StoryViewer = () => {
  const { id, shortUrl } = useParams();

  // Fetch story data
  const { data: story, isLoading, error } = useQuery({
    queryKey: ["storyView", id, shortUrl],
    queryFn: async () => {
      let query = supabase.from("stories").select("*");

      if (shortUrl) {
        query = query.eq("short_url", shortUrl);
      } else if (id && id !== "preview") {
        query = query.eq("id", id);
      } else {
        return null;
      }

      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!(id || shortUrl),
  });

  // Fetch default brand settings
  const { data: defaultBrandSettings } = useQuery({
    queryKey: ["brandSettings", "00000000-0000-0000-0000-000000000000"],
    queryFn: async () => {
      const { data } = await supabase
        .from("brand_settings")
        .select("*")
        .eq("user_id", "00000000-0000-0000-0000-000000000000")
        .maybeSingle();
      return data;
    },
  });

  // Track analytics on story load
  useEffect(() => {
    if (story && (shortUrl || id)) {
      const trackView = async () => {
        const hasVisited = localStorage.getItem(`visited_${story.id}`);
        
        await supabase.from('story_analytics').insert({
          story_id: story.id,
          device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          referrer: document.referrer || null,
          is_unique_visitor: !hasVisited,
        });
        
        if (!hasVisited) {
          localStorage.setItem(`visited_${story.id}`, 'true');
        }
      };
      
      trackView();
    }
  }, [story, shortUrl, id]);

  // Determine theme
  const theme: BrandTheme | null = story?.use_custom_brand && story?.custom_branding
    ? (story.custom_branding as unknown as BrandTheme)
    : defaultBrandSettings
    ? brandSettingsToTheme(defaultBrandSettings)
    : null;

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Story not found</h2>
          <p className="text-muted-foreground">This story doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <BrandThemeProvider theme={theme}>
      <StoryViewerContent story={story as unknown as Story} />
    </BrandThemeProvider>
  );
};

export default StoryViewer;
