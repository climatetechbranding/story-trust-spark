import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, QrCode, BarChart3, Settings, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStories } from "@/hooks/useStories";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: stories, isLoading } = useStories();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary" />
            <h1 className="text-xl font-bold">Intractive Stories</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">joseph@climatetechbranding.com</span>
            <Button variant="outline" size="sm">Sign Out</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Stories</h2>
          <p className="text-muted-foreground">
            Create interactive sustainability stories for your products
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/story/new/edit")}>
            <Plus className="h-10 w-10 text-primary mb-3" />
            <h3 className="font-semibold text-lg mb-2">Create Story</h3>
            <p className="text-sm text-muted-foreground">
              Build an interactive sustainability story for your product
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <BarChart3 className="h-10 w-10 text-secondary mb-3" />
            <h3 className="font-semibold text-lg mb-2">Analytics</h3>
            <p className="text-sm text-muted-foreground">
              View engagement and impact metrics across all stories
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Settings className="h-10 w-10 text-accent mb-3" />
            <h3 className="font-semibold text-lg mb-2">Settings</h3>
            <p className="text-sm text-muted-foreground">
              Manage your organization and branding preferences
            </p>
          </Card>
        </div>

        {/* Stories List */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Your Stories</h3>
              <Button onClick={() => navigate("/story/new/edit")}>
                <Plus className="h-4 w-4 mr-2" />
                New Story
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : stories && stories.length > 0 ? (
              <div className="space-y-3">
                {stories.map((story) => (
                  <div
                    key={story.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/story/${story.id}/edit`)}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{story.name}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-muted-foreground">{story.category}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(story.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        story.status === 'published' 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {story.status}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // QR code generation will be implemented later
                        }}
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No stories yet</p>
                <Button onClick={() => navigate("/story/new/edit")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Story
                </Button>
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
