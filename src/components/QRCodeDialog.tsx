import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Download, Loader2 } from 'lucide-react';
import { useGenerateQRCode } from '@/hooks/useQRCode';
import { generateQRCode, generateQRCodeSVG, downloadQRCode, downloadQRCodeSVG } from '@/lib/qr-utils';
import { toast } from 'sonner';

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  story: {
    id: string;
    name: string;
    short_url: string;
    qr_code_url?: string | null;
  };
}

export const QRCodeDialog = ({ open, onOpenChange, story }: QRCodeDialogProps) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const generateQR = useGenerateQRCode();
  const storyUrl = `${window.location.origin}/s/${story.short_url}`;

  useEffect(() => {
    if (open && story.short_url) {
      // Generate QR code for display
      generateQRCode(storyUrl).then(setQrCodeDataUrl);

      // If no QR code URL exists, generate and save it
      if (!story.qr_code_url && !generateQR.isPending) {
        generateQR.mutate({ storyId: story.id, shortUrl: story.short_url });
      }
    }
  }, [open, story.short_url, story.qr_code_url]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(storyUrl);
    toast.success('URL copied to clipboard');
  };

  const handleDownloadPNG = async () => {
    const dataUrl = await generateQRCode(storyUrl, { width: 1024 });
    downloadQRCode(dataUrl, `${story.name}-qr-code.png`);
    toast.success('QR code downloaded');
  };

  const handleDownloadSVG = async () => {
    const svg = await generateQRCodeSVG(storyUrl);
    downloadQRCodeSVG(svg, `${story.name}-qr-code.svg`);
    toast.success('QR code downloaded');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code for {story.name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-4">
          {/* QR Code Preview */}
          <div className="relative">
            {qrCodeDataUrl ? (
              <img 
                src={qrCodeDataUrl} 
                alt="QR Code" 
                className="w-64 h-64 border-2 border-border rounded-lg"
              />
            ) : (
              <div className="w-64 h-64 border-2 border-border rounded-lg flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Short URL */}
          <div className="w-full space-y-2">
            <label className="text-sm font-medium">Story URL</label>
            <div className="flex gap-2">
              <Input 
                value={storyUrl} 
                readOnly 
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleCopyUrl}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex gap-2 w-full">
            <Button 
              onClick={handleDownloadPNG}
              className="flex-1"
              disabled={!qrCodeDataUrl}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </Button>
            <Button 
              onClick={handleDownloadSVG}
              variant="outline"
              className="flex-1"
              disabled={!qrCodeDataUrl}
            >
              <Download className="h-4 w-4 mr-2" />
              Download SVG
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
