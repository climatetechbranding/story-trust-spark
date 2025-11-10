import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { nanoid } from "nanoid";

export interface ContentBlock {
  id: string;
  type: "video" | "text" | "image" | "map" | "button";
  content: any;
}

export interface Story {
  id: string;
  name: string;
  status: string;
  category: string;
  content: ContentBlock[];
  created_at: string;
  updated_at: string;
  short_url?: string;
  qr_code_url?: string;
}

// Fetch all stories
export const useStories = () => {
  return useQuery({
    queryKey: ["stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((story) => ({
        ...story,
        content: story.content as unknown as ContentBlock[],
      })) as Story[];
    },
  });
};

// Fetch single story by ID
export const useStory = (storyId: string | undefined) => {
  return useQuery({
    queryKey: ["story", storyId],
    queryFn: async () => {
      if (!storyId || storyId === "new") return null;

      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("id", storyId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        content: data.content as unknown as ContentBlock[],
      } as Story;
    },
    enabled: !!storyId && storyId !== "new",
  });
};

// Save story (create or update)
export const useSaveStory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      content,
      status,
      category,
    }: {
      id?: string;
      name: string;
      content: ContentBlock[];
      status?: string;
      category?: string;
    }) => {
      // If no ID, create new story
      if (!id || id === "new") {
        const newId = crypto.randomUUID();
        const shortUrl = nanoid(8);
        
        const { data, error } = await supabase
          .from("stories")
          .insert({
            name,
            content: content as any,
            status: status || "draft",
            category: category || "general",
            short_url: shortUrl,
            user_id: "00000000-0000-0000-0000-000000000000", // POC placeholder
          })
          .select()
          .single();

        if (error) throw error;
        return {
          ...data,
          content: data.content as unknown as ContentBlock[],
        } as Story;
      }

      // Update existing story
      const { data, error } = await supabase
        .from("stories")
        .update({
          name,
          content: content as any,
          status: status || "draft",
          category: category || "general",
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        content: data.content as unknown as ContentBlock[],
      } as Story;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["story", data.id] });
      toast({
        title: "Story saved",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving story",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Delete story
export const useDeleteStory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (storyId: string) => {
      const { error } = await supabase
        .from("stories")
        .delete()
        .eq("id", storyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      toast({
        title: "Story deleted",
        description: "The story has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting story",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Publish story (change status to published)
export const usePublishStory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (storyId: string) => {
      const { data, error } = await supabase
        .from("stories")
        .update({ status: "published" })
        .eq("id", storyId)
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        content: data.content as unknown as ContentBlock[],
      } as Story;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      toast({
        title: "Story published",
        description: "Your story is now live!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error publishing story",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
