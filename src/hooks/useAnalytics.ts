import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, subDays } from 'date-fns';

interface AnalyticsData {
  totalScans: number;
  uniqueVisitors: number;
  avgPerDay: number;
  byDevice: { device: string; count: number }[];
  byDay: { date: string; scans: number }[];
  topStories: { storyId: string; storyName: string; scans: number }[];
}

export const useStoryAnalytics = (
  storyId?: string,
  dateRange?: { start: Date; end: Date }
) => {
  return useQuery<AnalyticsData>({
    queryKey: ['analytics', storyId, dateRange],
    queryFn: async () => {
      let query = supabase
        .from('story_analytics')
        .select('*, stories!inner(id, name)');

      if (storyId) {
        query = query.eq('story_id', storyId);
      }

      if (dateRange) {
        query = query
          .gte('scan_timestamp', dateRange.start.toISOString())
          .lte('scan_timestamp', dateRange.end.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      // Calculate metrics
      const totalScans = data.length;
      const uniqueVisitors = data.filter(d => d.is_unique_visitor).length;

      // Group by day
      const scansByDay = data.reduce((acc: Record<string, number>, scan) => {
        const day = format(new Date(scan.scan_timestamp), 'yyyy-MM-dd');
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});

      const byDay = Object.entries(scansByDay).map(([date, scans]) => ({
        date,
        scans,
      })).sort((a, b) => a.date.localeCompare(b.date));

      // Calculate average per day
      const days = dateRange
        ? Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
        : byDay.length || 1;
      const avgPerDay = Math.round(totalScans / days);

      // Group by device
      const scansByDevice = data.reduce((acc: Record<string, number>, scan) => {
        const device = scan.device_type || 'unknown';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {});

      const byDevice = Object.entries(scansByDevice).map(([device, count]) => ({
        device,
        count,
      }));

      // Top stories
      const scansByStory = data.reduce((acc: Record<string, { name: string; count: number }>, scan) => {
        const story = (scan as any).stories;
        if (story) {
          if (!acc[story.id]) {
            acc[story.id] = { name: story.name, count: 0 };
          }
          acc[story.id].count += 1;
        }
        return acc;
      }, {});

      const topStories = Object.entries(scansByStory)
        .map(([storyId, data]) => ({
          storyId,
          storyName: data.name,
          scans: data.count,
        }))
        .sort((a, b) => b.scans - a.scans)
        .slice(0, 10);

      return {
        totalScans,
        uniqueVisitors,
        avgPerDay,
        byDevice,
        byDay,
        topStories,
      };
    },
  });
};
