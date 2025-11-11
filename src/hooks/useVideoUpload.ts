import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useVideoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const uploadVideo = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      setProgress(0);

      // Validate file
      if (!file.type.startsWith('video/')) {
        throw new Error('File must be a video');
      }

      const maxSize = 200 * 1024 * 1024; // 200MB
      if (file.size > maxSize) {
        throw new Error('Video must be less than 200MB');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('brand-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(filePath);

      setProgress(100);
      toast({
        title: "Video uploaded",
        description: "Video uploaded successfully",
      });

      return publicUrl;
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const generateThumbnail = (videoFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        video.currentTime = Math.min(2, video.duration / 2);
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(URL.createObjectURL(blob));
            } else {
              reject(new Error('Failed to generate thumbnail'));
            }
          }, 'image/jpeg', 0.8);
        }
      };

      video.onerror = () => reject(new Error('Failed to load video'));
      video.src = URL.createObjectURL(videoFile);
    });
  };

  return {
    uploadVideo,
    generateThumbnail,
    uploading,
    progress,
  };
};
