import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronUp, X, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StoryNode {
  id: string;
  type: "video" | "text" | "image" | "question" | "button" | "map";
  content: any;
  greenClaim?: boolean;
  substantiation?: {
    title: string;
    summary: string;
    evidence: string;
    certifications?: string[];
  };
  options?: { label: string; nextNodeId: string }[];
}

const StoryViewer = () => {
  const { id } = useParams();
  const [currentPath, setCurrentPath] = useState<string[]>(["1"]);
  const [showLegal, setShowLegal] = useState(false);
  const [direction, setDirection] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoMuted, setVideoMuted] = useState(false);

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
        evidence: "Certified by ClimatePartner (ID: 13850-2203-1001). Full lifecycle assessment available.",
        certifications: ["Carbon Neutral", "B Corp", "FSC Certified"],
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
        evidence: "Material traceability documentation and third-party verification by ISCC PLUS certification.",
        certifications: ["ISCC PLUS", "FSC Recycled"],
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
            className={`h-1 flex-1 rounded-full transition-all ${
              i < currentPath.length ? "bg-white" : "bg-white/30"
            }`}
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
          className="absolute inset-x-0 bottom-0 bg-card rounded-t-3xl shadow-2xl"
          style={{ height: "85vh" }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto" />
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={() => setShowLegal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6 overflow-y-auto" style={{ maxHeight: "calc(85vh - 100px)" }}>
              <div>
                <h3 className="text-2xl font-bold mb-2">{currentNode.substantiation.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {currentNode.substantiation.summary}
                </p>
              </div>

              {currentNode.substantiation.certifications && (
                <div>
                  <h4 className="font-semibold mb-3">Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentNode.substantiation.certifications.map((cert, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Evidence</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentNode.substantiation.evidence}
                </p>
              </div>

              <Button className="w-full" variant="outline">
                Download Full Documentation
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StoryViewer;
