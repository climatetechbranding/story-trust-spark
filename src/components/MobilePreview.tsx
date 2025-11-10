import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Video, Type, Image as ImageIcon, Map, GitBranch, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentBlock {
  id: string;
  type: "video" | "text" | "image" | "map" | "branch_choice";
  content: any;
}

interface MobilePreviewProps {
  blocks: ContentBlock[];
  selectedBlock: string | null;
}

export const MobilePreview = ({ blocks, selectedBlock }: MobilePreviewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };
  
  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(blocks.length - 1, prev + 1));
  };
  
  const currentBlock = blocks[currentIndex];
  
  return (
    <div className="sticky top-24">
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
        <div className="bg-background h-[500px] relative">
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
                    className={`h-0.5 flex-1 rounded-full transition-all ${
                      i === currentIndex ? "bg-white" : "bg-white/30"
                    }`}
                  />
                ))}
              </div>
              
              {/* Current Block Display */}
              <div className="h-full p-4 pt-8 flex items-center justify-center">
                {currentBlock && (
                  <div className={`w-full ${
                    selectedBlock === currentBlock.id
                      ? "ring-2 ring-primary bg-primary/5 rounded-lg"
                      : ""
                  }`}>
                    {currentBlock.type === "text" && (
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-3">
                          {currentBlock.content.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {currentBlock.content.body}
                        </p>
                      </div>
                    )}
                    
                    {currentBlock.type === "video" && (
                      <div className="aspect-video bg-muted/50 flex items-center justify-center rounded-lg">
                        <Video className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    {currentBlock.type === "image" && (
                      <div className="aspect-[4/3] bg-muted/50 flex items-center justify-center rounded-lg">
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    {currentBlock.type === "map" && (
                      <div className="h-60 bg-muted/50 flex items-center justify-center rounded-lg">
                        <Map className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    {currentBlock.type === "branch_choice" && (
                      <div className="p-4 space-y-4">
                        {currentBlock.content.media?.url && (
                          <div className="aspect-video rounded-lg overflow-hidden">
                            <img 
                              src={currentBlock.content.media.url} 
                              alt="" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {currentBlock.content.text && (
                          <p className="text-sm">{currentBlock.content.text}</p>
                        )}
                        <div className="space-y-2">
                          {(currentBlock.content.options || []).map((option: any) => (
                            <button
                              key={option.id}
                              className="w-full p-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center gap-3 hover:bg-primary/90 transition-colors"
                            >
                              {option.media?.url && (
                                <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                                  <img 
                                    src={option.media.url} 
                                    alt="" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <span className="flex-1 text-left">{option.text}</span>
                              <GitBranch className="h-4 w-4 flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
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
