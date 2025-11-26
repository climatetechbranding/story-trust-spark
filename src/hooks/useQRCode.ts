import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateQRCode } from '@/lib/qr-utils';
import { toast } from 'sonner';

export const useGenerateQRCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storyId, shortUrl }: { storyId: string; shortUrl: string }) => {
      const storyUrl = `${window.location.origin}/s/${shortUrl}`;
      const qrDataUrl = await generateQRCode(storyUrl);

      // Convert data URL to blob
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const fileName = `qr-codes/${storyId}.png`;
      const { data, error } = await supabase.storage
        .from('brand-assets')
        .upload(fileName, blob, { upsert: true });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(fileName);

      // Update story with QR URL
      const { error: updateError } = await supabase
        .from('stories')
        .update({ qr_code_url: publicUrl })
        .eq('id', storyId);

      if (updateError) throw updateError;

      return { qrCodeUrl: publicUrl, storyUrl };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      toast.success('QR code generated successfully');
    },
    onError: (error) => {
      console.error('QR generation error:', error);
      toast.error('Failed to generate QR code');
    },
  });
};
