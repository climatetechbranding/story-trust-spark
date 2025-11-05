import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Sparkles, Globe, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-background" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Interactive Sustainability Stories
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Tell Your Sustainability Story Like Never Before
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Create interactive, mobile-first experiences that connect consumers with the real impact of their purchases. Build trust through transparency.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/dashboard")} className="gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/story/preview")}>
                View Demo Story
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Built for Consumer Connection</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Move beyond static claims. Create immersive stories that speak in consumer language.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Interactive Content</h3>
              <p className="text-muted-foreground">
                Combine video, images, maps, and interactive elements to tell compelling sustainability stories.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Mobile-First Design</h3>
              <p className="text-muted-foreground">
                Swipeable, app-like experiences optimized for mobile. Access via QR codes on products.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Legal Compliance</h3>
              <p className="text-muted-foreground">
                Built-in substantiation drawer ensures compliance with green claims regulations worldwide.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="p-12 bg-gradient-to-br from-primary/10 to-secondary/10 border-none">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Build Trust?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join forward-thinking brands using interactive storytelling to connect with conscious consumers.
              </p>
              <Button size="lg" onClick={() => navigate("/dashboard")}>
                Start Creating Stories
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
