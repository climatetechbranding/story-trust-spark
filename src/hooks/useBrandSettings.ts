import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BrandSettings, BrandTheme } from "@/types/brand";
import { toast } from "sonner";

const POC_USER_ID = "00000000-0000-0000-0000-000000000000";

// Fetch brand settings for current user (POC)
export function useBrandSettings() {
  return useQuery({
    queryKey: ["brandSettings", POC_USER_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_settings")
        .select("*")
        .eq("user_id", POC_USER_ID)
        .single();

      if (error) {
        // If no settings exist, return defaults
        if (error.code === "PGRST116") {
          return {
            user_id: POC_USER_ID,
            primary_color: "217 91% 60%",
            secondary_color: "142 76% 36%",
            text_color: "222.2 84% 4.9%",
            primary_font: "Inter",
            secondary_font: "Inter",
          } as BrandSettings;
        }
        throw error;
      }

      return data as BrandSettings;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

// Save/Update brand settings
export function useSaveBrandSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<BrandSettings>) => {
      const { data, error } = await supabase
        .from("brand_settings")
        .upsert({
          user_id: POC_USER_ID,
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as BrandSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brandSettings"] });
      toast.success("Branding updated successfully");
    },
    onError: (error) => {
      console.error("Error saving brand settings:", error);
      toast.error("Failed to save branding settings");
    },
  });
}

// Upload brand asset to Supabase Storage
export async function uploadBrandAsset(
  file: File,
  type: "favicon" | "share-image"
): Promise<string> {
  // Compress image before upload
  const compressed = await compressImage(file, type === "favicon" ? 64 : 1200);
  
  const fileExt = file.name.split(".").pop();
  const fileName = `${POC_USER_ID}/${type}-${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("brand-assets")
    .upload(fileName, compressed, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("brand-assets")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

// Compress image helper
async function compressImage(file: File, maxDimension: number): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => resolve(blob!), "image/png", 0.9);
    };
    img.src = URL.createObjectURL(file);
  });
}

// Convert BrandSettings to BrandTheme (simplified format)
export function brandSettingsToTheme(settings: BrandSettings): BrandTheme {
  return {
    primaryColor: settings.primary_color,
    secondaryColor: settings.secondary_color,
    textColor: settings.text_color,
    primaryFont: settings.primary_font,
    secondaryFont: settings.secondary_font,
    faviconUrl: settings.favicon_url,
    shareImageUrl: settings.share_image_url,
  };
}
