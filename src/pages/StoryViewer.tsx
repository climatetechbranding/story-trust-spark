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

interface StoryNode {
  id: string;
  type: "video" | "text" | "image" | "question" | "button" | "map";
  content: any;
  greenClaim?: boolean;
  substantiation?: {
    title: string;
    summary: string;
    whyItMatters: string;
    evidence: string;
    categories?: string[];
    certifications?: { name: string; logo: string; verificationUrl: string }[];
    documents?: { name: string; type: string; url: string; updatedAt: string }[];
    regulatoryInfo?: { text: string; url: string };
  };
  options?: { label: string; nextNodeId: string }[];
}

const StoryViewerContent = () => {
  const [currentPath, setCurrentPath] = useState<string[]>(["1"]);
  const [showLegal, setShowLegal] = useState(false);
  const [direction, setDirection] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoMuted, setVideoMuted] = useState(false);
  const { theme } = useBrandTheme();

  // Sample story structure with branching
  const storyNodes: Record<string, StoryNode> = {
    "1": {
      id: "1",
      type: "video",
      content: {
        videoUrl: "https://videos.unsplash.com/photo-1469854523086-cc02fe5d8800",
        caption: "Zero Carbon Lounge Chair by Lokaal Living",
        duration: 15,
      },
      greenClaim: true,
      substantiation: {
        title: "Carbon Neutral Certification",
        summary: "Our Zero Chair achieves carbon neutrality through recycled materials, renewable energy manufacturing, and verified carbon offsets.",
        whyItMatters: "Every piece of furniture we create removes carbon from the atmosphere instead of adding to it, helping combat climate change one chair at a time.",
        evidence: "Certified by ClimatePartner (ID: 13850-2203-1001). Full lifecycle assessment available.",
        categories: ["Carbon Neutral", "Sustainable Manufacturing"],
        certifications: [
          { name: "Carbon Neutral", logo: "🌍", verificationUrl: "https://example.com/carbon-cert" },
          { name: "B Corp", logo: "🏢", verificationUrl: "https://example.com/bcorp" },
          { name: "FSC Certified", logo: "🌲", verificationUrl: "https://example.com/fsc" },
        ],
        documents: [
          { name: "Full Lifecycle Assessment", type: "PDF", url: "#", updatedAt: "2024-10-15" },
          { name: "Carbon Offset Verification", type: "PDF", url: "#", updatedAt: "2024-11-01" },
        ],
        regulatoryInfo: {
          text: "Complies with EU Green Claims Directive",
          url: "https://docs.lovable.dev/features/security",
        },
      },
    },
    "2": {
      id: "2",
      type: "text",
      content: {
        title: "Choose Your Journey",
        body: "Discover what matters most to you about sustainable furniture.",
      },
    },
    "3": {
      id: "3",
      type: "button",
      content: {
        question: "What interests you most?",
        options: [
          { label: "♻️ Materials Story", nextNodeId: "4" },
          { label: "🏭 Manufacturing Process", nextNodeId: "5" },
          { label: "🌍 Environmental Impact", nextNodeId: "6" },
        ],
      },
    },
    "4": {
      id: "4",
      type: "text",
      content: {
        title: "Circular Materials",
        body: "Made from 98% recycled Dutch oak sourced from old railway tracks and decommissioned canal houses. The bioplastic seat is derived from sugar beets grown within 30 kilometers of our Amsterdam workshop.",
        icon: "♻️",
      },
      greenClaim: true,
      substantiation: {
        title: "Recycled Materials Verification",
        summary: "98% of wood materials are certified post-consumer recycled content from verified Dutch sources.",
        whyItMatters: "Using recycled materials saves old-growth forests and reduces the energy needed to process raw materials by up to 60%.",
        evidence: "Material traceability documentation and third-party verification by ISCC PLUS certification.",
        categories: ["Recycling", "Circular Economy"],
        certifications: [
          { name: "ISCC PLUS", logo: "♻️", verificationUrl: "https://example.com/iscc" },
          { name: "FSC Recycled", logo: "🌲", verificationUrl: "https://example.com/fsc-recycled" },
        ],
        documents: [
          { name: "Material Traceability Report", type: "PDF", url: "#", updatedAt: "2024-09-20" },
          { name: "ISCC Certification", type: "PDF", url: "#", updatedAt: "2024-08-10" },
        ],
        regulatoryInfo: {
          text: "Verified under ISO 14021 Environmental Labels",
          url: "https://docs.lovable.dev/features/security",
        },
      },
    },
    "5": {
      id: "5",
      type: "map",
      content: {
        title: "Solar-Powered Workshop",
        location: { lat: 52.3676, lng: 4.9041, name: "Amsterdam, Netherlands" },
        description: "Our workshop runs on 100% solar energy, using CNC technology to minimize waste.",
      },
    },
    "6": {
      id: "6",
      type: "question",
      content: {
        question: "Did you know this chair saves...",
        stats: [
          { label: "CO₂ Offset", value: "100%", icon: "🌍" },
          { label: "Recycled Materials", value: "98%", icon: "♻️" },
          { label: "Local Sourcing", value: "30km", icon: "📍" },
        ],
      },
    },
  };

  const currentNodeId = currentPath[currentPath.length - 1];
  const currentNode = storyNodes[currentNodeId];

  const handleSwipe = (event: any, info: PanInfo) => {
    const swipeThreshold = 50;
    
    if (info.offset.y < -swipeThreshold && !showLegal && currentNode?.greenClaim) {
      // Swipe up - show legal
      setShowLegal(true);
    } else if (info.offset.y > swipeThreshold && showLegal) {
      // Swipe down - hide legal
      setShowLegal(false);
    }
  };

  const handleNavigate = (nextNodeId: string) => {
    setCurrentPath([...currentPath, nextNodeId]);
    setDirection(1);
    setShowLegal(false);
  };

  const handleBack = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1));
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

  if (!currentNode) {
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
    <motion.div 
      className="h-screen w-full bg-background relative overflow-hidden"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleSwipe}
    >
      {/* Progress Indicators */}
      <div className="absolute top-4 left-4 right-4 flex gap-2 z-30">
        {Object.keys(storyNodes).slice(0, 6).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all"
            style={{
              backgroundColor: i < currentPath.length 
                ? (theme ? `hsl(${theme.primaryColor})` : 'white')
                : (theme ? `hsl(${theme.primaryColor} / 0.3)` : 'rgba(255, 255, 255, 0.3)'),
            }}
          />
        ))}
      </div>

      {/* Back Button */}
      {currentPath.length > 1 && (
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
          key={currentNodeId}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="h-full w-full"
        >
          {/* Video Node */}
          {currentNode.type === "video" && (
            <div className="h-full relative bg-black">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
              <video
                className="h-full w-full object-cover"
                autoPlay
                loop
                muted={videoMuted}
                playsInline
              >
                <source src={currentNode.content.videoUrl} type="video/mp4" />
              </video>
              
              <div className="absolute bottom-20 left-0 right-0 p-6 text-white">
                <h1 className="text-3xl font-bold mb-2">{currentNode.content.caption}</h1>
                {currentNode.greenClaim && (
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

          {/* Text Node */}
          {currentNode.type === "text" && (
            <div className="h-full flex items-center justify-center p-8">
              <div className="max-w-md text-center space-y-6">
                {currentNode.content.icon && (
                  <div className="text-7xl mb-6">{currentNode.content.icon}</div>
                )}
                <h2 className="text-4xl font-bold leading-tight">{currentNode.content.title}</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {currentNode.content.body}
                </p>
                {currentNode.greenClaim && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-6">
                    <ChevronUp className="h-4 w-4 animate-bounce" />
                    <span>Swipe up for verification</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Button/Options Node */}
          {currentNode.type === "button" && (
            <div className="h-full flex items-center justify-center p-8">
              <div className="max-w-md w-full space-y-6">
                <h2 className="text-3xl font-bold text-center mb-8">
                  {currentNode.content.question}
                </h2>
                <div className="space-y-4">
                  {currentNode.content.options.map((option: any, i: number) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNavigate(option.nextNodeId)}
                      className="w-full p-5 bg-card hover:bg-card/80 rounded-xl text-left font-medium text-lg shadow-lg transition-colors"
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Question/Stats Node */}
          {currentNode.type === "question" && (
            <div className="h-full flex items-center justify-center p-8 bg-gradient-to-br from-primary/10 to-secondary/10">
              <div className="max-w-md w-full space-y-8">
                <h2 className="text-3xl font-bold text-center">{currentNode.content.question}</h2>
                <div className="space-y-4">
                  {currentNode.content.stats.map((stat: any, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className="bg-card p-6 rounded-xl shadow-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-5xl">{stat.icon}</div>
                        <div className="flex-1">
                          <div className="text-4xl font-bold text-primary">{stat.value}</div>
                          <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Map Node */}
          {currentNode.type === "map" && (
            <div className="h-full relative">
              <div className="h-full bg-muted/50 flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="text-6xl mb-4">📍</div>
                  <h2 className="text-2xl font-bold mb-2">{currentNode.content.title}</h2>
                  <p className="text-muted-foreground mb-4">{currentNode.content.location.name}</p>
                  <p className="text-sm">{currentNode.content.description}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Legal/Substantiation Drawer */}
      {currentNode.substantiation && (
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
          {/* Pull Handle */}
          <div className="flex justify-center py-3 cursor-pointer" onClick={() => showLegal && setShowLegal(false)}>
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
          </div>

          {/* Close Button (only visible when open) */}
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

          {/* Drawer Content */}
          <div className="px-6 pb-6 overflow-y-auto" style={{ maxHeight: "calc(85vh - 60px)" }}>
            <div className="space-y-6" style={{ borderTopColor: theme ? `hsl(${theme.primaryColor})` : undefined }}>
              {/* Claim Title & Categories */}
              <div>
                <h3 className="text-2xl font-bold mb-3">{currentNode.substantiation.title}</h3>
                {currentNode.substantiation.categories && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {currentNode.substantiation.categories.map((category, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-medium"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Claim Summary */}
              <div className="bg-card rounded-lg p-4 border">
                <p className="text-sm leading-relaxed text-foreground">
                  {currentNode.substantiation.summary}
                </p>
              </div>

              {/* Why This Matters */}
              <div>
                <h4 className="font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">
                  Why This Matters
                </h4>
                <p className="text-sm leading-relaxed">
                  {currentNode.substantiation.whyItMatters}
                </p>
              </div>

              {/* Evidence */}
              <div>
                <h4 className="font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">
                  Evidence
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {currentNode.substantiation.evidence}
                </p>
              </div>

              {/* Evidence Documents */}
              {currentNode.substantiation.documents && currentNode.substantiation.documents.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                    Supporting Documents
                  </h4>
                  <div className="space-y-2">
                    {currentNode.substantiation.documents.map((doc, i) => (
                      <a
                        key={i}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-card rounded-lg border hover:border-primary transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-lg">
                            📄
                          </div>
                          <div>
                            <div className="font-medium text-sm">{doc.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {doc.type} • Updated {doc.updatedAt}
                            </div>
                          </div>
                        </div>
                        <ChevronUp className="h-4 w-4 rotate-90 text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications & Badges */}
              {currentNode.substantiation.certifications && currentNode.substantiation.certifications.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                    Certifications
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {currentNode.substantiation.certifications.map((cert, i) => (
                      <a
                        key={i}
                        href={cert.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-4 bg-card rounded-lg border hover:border-primary transition-colors text-center"
                      >
                        <div className="text-3xl mb-2">{cert.logo}</div>
                        <div className="text-xs font-medium">{cert.name}</div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Regulatory Reference */}
              {currentNode.substantiation.regulatoryInfo && (
                <div className="bg-muted/50 rounded-lg p-4 border border-muted">
                  <div className="flex items-start gap-2">
                    <div className="text-lg">⚖️</div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Regulatory Compliance</p>
                      <a
                        href={currentNode.substantiation.regulatoryInfo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium hover:underline"
                      >
                        {currentNode.substantiation.regulatoryInfo.text}
                      </a>
                    </div>
                  </div>
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
  const { id } = useParams();

  // Fetch story data (if we had real stories in DB)
  const { data: story } = useQuery({
    queryKey: ["story", id],
    queryFn: async () => {
      if (!id || id === "preview") return null;
      
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id && id !== "preview",
  });

  // Fetch default brand settings
  const { data: defaultBrandSettings } = useQuery({
    queryKey: ["brandSettings", story?.user_id],
    queryFn: async () => {
      const userId = story?.user_id || "00000000-0000-0000-0000-000000000000";
      
      const { data, error } = await supabase
        .from("brand_settings")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!story?.user_id || id === "preview",
  });

  // Determine theme: use story's custom branding or user's default
  const theme: BrandTheme | null = story?.use_custom_brand && story?.custom_branding
    ? (story.custom_branding as unknown as BrandTheme)
    : defaultBrandSettings
      ? brandSettingsToTheme(defaultBrandSettings)
      : null;

  return (
    <BrandThemeProvider theme={theme}>
      <StoryViewerContent />
    </BrandThemeProvider>
  );
};

export default StoryViewer;
