import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStoryAnalytics } from '@/hooks/useAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, TrendingUp, Users, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Analytics = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<'7' | '30' | 'all'>('7');

  const getDateRange = () => {
    const end = endOfDay(new Date());
    if (dateRange === 'all') return undefined;
    const start = startOfDay(subDays(end, parseInt(dateRange)));
    return { start, end };
  };

  const { data: analytics, isLoading } = useStoryAnalytics(undefined, getDateRange());

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Analytics</h1>
          </div>
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as any)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-96" />
          </div>
        ) : analytics ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Scans</p>
                    <p className="text-3xl font-bold mt-2">{analytics.totalScans}</p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-primary" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Unique Visitors</p>
                    <p className="text-3xl font-bold mt-2">{analytics.uniqueVisitors}</p>
                  </div>
                  <Users className="h-10 w-10 text-secondary" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. per Day</p>
                    <p className="text-3xl font-bold mt-2">{analytics.avgPerDay}</p>
                  </div>
                  <Activity className="h-10 w-10 text-accent" />
                </div>
              </Card>
            </div>

            {/* Scans Over Time */}
            {analytics.byDay.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Scans Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.byDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="scans" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Device Breakdown & Top Stories */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Device Breakdown */}
              {analytics.byDevice.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Device Breakdown</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={analytics.byDevice}
                        dataKey="count"
                        nameKey="device"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {analytics.byDevice.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Top Stories */}
              {analytics.topStories.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Top Stories</h3>
                  <div className="space-y-3">
                    {analytics.topStories.slice(0, 5).map((story) => (
                      <div 
                        key={story.storyId} 
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <span className="font-medium truncate flex-1">{story.storyName}</span>
                        <span className="text-sm text-muted-foreground ml-2">{story.scans} scans</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* No Data State */}
            {analytics.totalScans === 0 && (
              <Card className="p-12">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No data yet</h3>
                  <p className="text-muted-foreground">
                    Start sharing your stories to see analytics data here
                  </p>
                </div>
              </Card>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default Analytics;
