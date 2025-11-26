import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Video, Type, Image as ImageIcon, Map, GitBranch, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBrandTheme } from "@/contexts/BrandThemeContext";
import { motion } from "framer-motion";
import { animationVariants, animationDurations, paddingClasses, alignmentClasses } from "@/lib/animation-utils";

interface ContentBlock {
  id: string;
  type: "video" | "text" | "image" | "map" | "branch_choice";
  content: any;
  settings?: any;
}

interface MobilePreviewProps {
  blocks: ContentBlock[];
  selectedBlock: string | null;
}

export const MobilePreview = ({ blocks, selectedBlock }: MobilePreviewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { theme } = useBrandTheme();
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to selected block
  useEffect(() => {
    if (selectedBlock) {
      const index = blocks.findIndex(b => b.id === selectedBlock);
      if (index !== -1) {
        setCurrentIndex(index);
        // Scroll preview into view
        previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedBlock, blocks]);
  
  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };
  
  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(blocks.length - 1, prev + 1));
  };
  
  const currentBlock = blocks[currentIndex];
  const settings = currentBlock?.content?.__settings || currentBlock?.settings || {};
  const appearance = settings.appearance || {};
  const animation = settings.animation || {};
  
  // For branch_choice, use its background color; otherwise use appearance settings
  const screenBackgroundColor = currentBlock?.type === 'branch_choice' 
    ? currentBlock.content.backgroundColor 
    : (appearance.background || 'hsl(var(--background))');

  const containerClass = `w-full ${paddingClasses[appearance.padding || 'normal']} ${alignmentClasses[appearance.alignment || 'center']}`;
  
  return (
    <div ref={previewRef} className="sticky top-24">
      <h3 className="font-semibold mb-4 flex items-center justify-between">
        <span>Mobile Preview</span>
        {blocks.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {currentIndex + 1} / {blocks.length}
          </span>
        )}
      </h3>
      
      {/* Phone Frame */}
      <div className="mx-auto w-[280px] bg-card border-8 border-foreground rounded-[40px] shadow-2xl overflow-hidden">
        {/* Phone Notch */}
        <div className="h-6 bg-foreground relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-card rounded-b-2xl"></div>
        </div>
        
        {/* Phone Screen */}
        <div 
          className="h-[500px] relative"
          style={{
            backgroundColor: screenBackgroundColor,
          }}
        >
          {blocks.length === 0 ? (
            <div className="flex items-center justify-center h-full p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Add content blocks to see preview
              </p>
            </div>
          ) : (
            <>
              {/* Progress Indicators */}
              <div className="absolute top-2 left-2 right-2 flex gap-1 z-10">
                {blocks.map((_, i) => (
                  <div
                    key={i}
                    className="h-0.5 flex-1 rounded-full transition-all"
                    style={{
                      backgroundColor: i === currentIndex 
                        ? (theme ? `hsl(${theme.primaryColor})` : 'white')
                        : (theme ? `hsl(${theme.primaryColor} / 0.3)` : 'rgba(255, 255, 255, 0.3)'),
                    }}
                  />
                ))}
              </div>
              
              {/* Current Block Display */}
              <div className={`h-full pt-8 ${currentBlock?.type === 'video' || currentBlock?.type === 'image' || currentBlock?.type === 'map' ? '' : `flex ${containerClass}`}`}>
                {currentBlock && (
                  <motion.div 
                    className={`w-full ${
                      selectedBlock === currentBlock.id
                        ? "ring-2 ring-primary bg-primary/5 rounded-lg"
                        : ""
                    }`}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    variants={animationVariants[animation.entrance || 'fade']}
                    transition={{ duration: animationDurations[animation.duration || 'normal'] }}
                  >
                    {currentBlock.type === "text" && (
                      <div className="p-4">
                        <h3 
                          className="font-semibold text-lg mb-3"
                          style={{
                            color: theme ? `hsl(${theme.textColor})` : undefined,
                            fontFamily: theme?.primaryFont || undefined,
                          }}
                        >
                          {currentBlock.content.title}
                        </h3>
                        {currentBlock.content.html ? (
                          <div 
                            className="text-sm leading-relaxed prose prose-sm max-w-none"
                            style={{
                              color: theme ? `hsl(${theme.textColor})` : undefined,
                              fontFamily: theme?.secondaryFont || undefined,
                            }}
                            dangerouslySetInnerHTML={{ __html: currentBlock.content.html }}
                          />
                        ) : (
                          <p 
                            className="text-sm leading-relaxed"
                            style={{
                              color: theme ? `hsl(${theme.textColor})` : undefined,
                              fontFamily: theme?.secondaryFont || undefined,
                            }}
                          >
                            {currentBlock.content.body}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {currentBlock.type === "video" && (
                      <div className="h-full relative bg-black">
                        {/* Gradient overlay for text legibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-10 pointer-events-none" />
                        
                        {currentBlock.content.url ? (
                          <video 
                            src={currentBlock.content.url} 
                            controls 
                            autoPlay={currentBlock.content.autoplay !== false}
                            loop={currentBlock.content.loop}
                            muted={currentBlock.content.muted !== false}
                            playsInline
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <Video className="h-16 w-16 text-white/50" />
                          </div>
                        )}
                        
                        {/* Title/description overlay at bottom */}
                        {(currentBlock.content.title || currentBlock.content.description) && (
                          <div className="absolute bottom-4 left-4 right-4 z-20 text-white">
                            {currentBlock.content.title && (
                              <h3 
                                className="font-bold text-lg mb-1"
                                style={{ fontFamily: theme?.primaryFont || undefined }}
                              >
                                {currentBlock.content.title}
                              </h3>
                            )}
                            {currentBlock.content.description && (
                              <p 
                                className="text-xs opacity-90"
                                style={{ fontFamily: theme?.secondaryFont || undefined }}
                              >
                                {currentBlock.content.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {currentBlock.type === "image" && (
                      <div className="h-full relative">
                        {currentBlock.content.url ? (
                          <>
                            <img 
                              src={currentBlock.content.url}
                              alt={currentBlock.content.alt || ""}
                              className="h-full w-full object-cover"
                            />
                            {currentBlock.content.caption && (
                              <div className="absolute bottom-4 left-4 right-4 text-white bg-black/60 backdrop-blur-sm p-3 rounded-lg">
                                <p 
                                  className="text-sm"
                                  style={{ fontFamily: theme?.secondaryFont || undefined }}
                                >
                                  {currentBlock.content.caption}
                                </p>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="h-full flex items-center justify-center bg-muted">
                            <ImageIcon className="h-16 w-16 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    )}
                    
                    {currentBlock.type === "map" && (
                      <div className="h-full bg-muted/50 flex items-center justify-center">
                        <Map className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    
                    {currentBlock.type === "branch_choice" && (
                      <div className="h-full relative flex flex-col items-center justify-center p-4">
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

                        <div className="relative z-10 max-w-[90%] w-full space-y-2">
                          {/* Top Media */}
                          {currentBlock.content.media?.url && (
                            <div className="bg-white rounded-xl p-2 shadow-lg">
                              <img 
                                src={currentBlock.content.media.url} 
                                alt=""
                                className="w-full h-16 object-contain"
                              />
                            </div>
                          )}
                          
                          {/* Title in speech bubble */}
                          {currentBlock.content.text && (
                            <div className="bg-white rounded-xl p-2 shadow-lg relative">
                              <div className="absolute -bottom-1 left-4 w-2 h-2 bg-white transform rotate-45" />
                              <h2 className="text-xs font-bold text-gray-900 leading-snug">
                                {currentBlock.content.text}
                              </h2>
                            </div>
                          )}
                          
                          {/* Options as stacked buttons */}
                          <div className="space-y-1.5 pt-1">
                            {(currentBlock.content.options || []).map((option: any) => (
                              <button
                                key={option.id}
                                className="w-full bg-white hover:bg-gray-50 rounded-xl shadow-lg transition-all flex items-center gap-2 p-2"
                              >
                                {option.media ? (
                                  <div className="flex-shrink-0 w-6 h-6 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
                                    <img src={option.media} alt="" className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <GitBranch className="w-3 h-3 text-primary" />
                                  </div>
                                )}
                                <span className="text-gray-900 font-medium text-xs leading-tight text-left flex-1">
                                  {option.text}
                                </span>
                                <span 
                                  className="text-sm"
                                  style={{ color: theme ? `hsl(${theme.primaryColor})` : undefined }}
                                >
                                  →
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
              
              {/* Navigation Arrows */}
              {currentIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              
              {currentIndex < blocks.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
        
        {/* Phone Home Indicator */}
        <div className="h-6 bg-foreground flex items-center justify-center">
          <div className="w-20 h-1 bg-muted rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
