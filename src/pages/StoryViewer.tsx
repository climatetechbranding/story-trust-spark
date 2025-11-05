import { useState, useEffect } from "react";
import { ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StorySection {
  id: string;
  type: "hero" | "text" | "video" | "impact";
  content: any;
}

const StoryViewer = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [showLegal, setShowLegal] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const sections: StorySection[] = [
    {
      id: "1",
      type: "hero",
      content: {
        title: "Zero Carbon Lounge Chair",
        subtitle: "By Lokaal Living",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
      },
    },
    {
      id: "2",
      type: "text",
      content: {
        title: "Circular Materials",
        body: "Made from 98% recycled Dutch oak sourced from old railway tracks and decommissioned canal houses.",
        icon: "♻️",
      },
    },
    {
      id: "3",
      type: "text",
      content: {
        title: "Sustainable Manufacturing",
        body: "Our solar-powered Amsterdam workshop uses CNC technology to minimize waste. All finishes are water-based and VOC-free.",
        icon: "🌱",
      },
    },
    {
      id: "4",
      type: "impact",
      content: {
        title: "Carbon Neutral Impact",
        stats: [
          { label: "CO₂ Offset", value: "100%", icon: "🌍" },
          { label: "Recycled Materials", value: "98%", icon: "♻️" },
          { label: "Local Sourcing", value: "30km", icon: "📍" },
        ],
      },
    },
  ];

  const legalContent = {
    title: "Carbon Neutral Certification",
    sections: [
      {
        heading: "Circular Materials",
        body: "The 'Zero' Chair is made from 98% recycled Dutch oak sourced from old railway tracks from North Holland and decommissioned canal houses. Bioplastic seat derived from sugar beets grown within 30 kilometers of our Amsterdam workshop.",
      },
      {
        heading: "Sustainable Manufacturing",
        body: "Our solar-powered facility uses advanced CNC technology to minimize waste. All finishings are water-based and VOC-free.",
      },
      {
        heading: "Offsetting Emissions",
        body: "For all remaining emissions including logistics and packaging, Lokaal Living has purchased verified carbon credits supporting reforestation projects in the Amazon rainforest.",
      },
    ],
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50 && !showLegal) {
      // Swipe up - show legal
      setShowLegal(true);
    } else if (touchEnd - touchStart > 50 && showLegal) {
      // Swipe down - hide legal
      setShowLegal(false);
    } else if (touchStart - touchEnd > 100 && !showLegal) {
      // Swipe up more - next section
      if (currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1);
      }
    } else if (touchEnd - touchStart > 100 && !showLegal) {
      // Swipe down - previous section
      if (currentSection > 0) {
        setCurrentSection(currentSection - 1);
      }
    }
  };

  const section = sections[currentSection];

  return (
    <div 
      className="h-screen w-full bg-background relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main Content */}
      <div className="h-full w-full flex flex-col transition-transform duration-300">
        {section.type === "hero" && (
          <div className="flex-1 relative">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${section.content.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>
            <div className="relative h-full flex flex-col justify-end p-6 text-white">
              <h1 className="text-4xl font-bold mb-2">{section.content.title}</h1>
              <p className="text-lg opacity-90 mb-6">{section.content.subtitle}</p>
              <div className="flex items-center gap-2 text-sm opacity-75">
                <ChevronUp className="h-4 w-4" />
                <span>Swipe up for details</span>
              </div>
            </div>
          </div>
        )}

        {section.type === "text" && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-md text-center space-y-6">
              <div className="text-6xl mb-4">{section.content.icon}</div>
              <h2 className="text-3xl font-bold">{section.content.title}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {section.content.body}
              </p>
            </div>
          </div>
        )}

        {section.type === "impact" && (
          <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="max-w-md w-full space-y-8">
              <h2 className="text-3xl font-bold text-center">{section.content.title}</h2>
              <div className="space-y-6">
                {section.content.stats.map((stat: any, i: number) => (
                  <div key={i} className="bg-card p-6 rounded-xl shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{stat.icon}</div>
                      <div className="flex-1">
                        <div className="text-3xl font-bold text-primary">{stat.value}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section Indicators */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {sections.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === currentSection ? "w-8 bg-white" : "w-4 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Legal Drawer */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-card rounded-t-3xl shadow-2xl transition-transform duration-300 ${
          showLegal ? "translate-y-0" : "translate-y-[calc(100%-80px)]"
        }`}
        style={{ height: "85vh" }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-2" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLegal(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6 overflow-y-auto" style={{ maxHeight: "calc(85vh - 100px)" }}>
            <h3 className="text-2xl font-bold">{legalContent.title}</h3>
            {legalContent.sections.map((section, i) => (
              <div key={i} className="space-y-2">
                <h4 className="font-semibold text-lg">{section.heading}</h4>
                <p className="text-muted-foreground leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;
