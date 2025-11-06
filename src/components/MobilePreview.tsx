import { Card } from "@/components/ui/card";
import { Video, Type, Image as ImageIcon, Map, MousePointerClick } from "lucide-react";

interface ContentBlock {
  id: string;
  type: "video" | "text" | "image" | "map" | "button";
  content: any;
}

interface MobilePreviewProps {
  blocks: ContentBlock[];
  selectedBlock: string | null;
}

export const MobilePreview = ({ blocks, selectedBlock }: MobilePreviewProps) => {
  return (
    <div className="sticky top-24">
      <h3 className="font-semibold mb-4">Mobile Preview</h3>
      
      {/* Phone Frame */}
      <div className="mx-auto w-[280px] bg-card border-8 border-foreground rounded-[40px] shadow-2xl overflow-hidden">
        {/* Phone Notch */}
        <div className="h-6 bg-foreground relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-card rounded-b-2xl"></div>
        </div>
        
        {/* Phone Screen */}
        <div className="bg-background h-[500px] overflow-y-auto">
          {blocks.length === 0 ? (
            <div className="flex items-center justify-center h-full p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Add content blocks to see preview
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className={`rounded-lg transition-all ${
                    selectedBlock === block.id
                      ? "ring-2 ring-primary bg-primary/5"
                      : "bg-card"
                  }`}
                >
                  {block.type === "text" && (
                    <div className="p-4">
                      <h3 className="font-semibold text-sm mb-2">
                        {block.content.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {block.content.body}
                      </p>
                    </div>
                  )}
                  
                  {block.type === "video" && (
                    <div className="aspect-video bg-muted/50 flex items-center justify-center">
                      <Video className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  {block.type === "image" && (
                    <div className="aspect-[4/3] bg-muted/50 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  {block.type === "map" && (
                    <div className="h-40 bg-muted/50 flex items-center justify-center">
                      <Map className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  {block.type === "button" && (
                    <div className="p-4">
                      <button className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                        {block.content.label}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
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
