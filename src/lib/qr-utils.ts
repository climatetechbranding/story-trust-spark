import QRCode from 'qrcode';

export const generateQRCode = async (
  url: string,
  options?: {
    width?: number;
    color?: { dark: string; light: string };
  }
): Promise<string> => {
  return QRCode.toDataURL(url, {
    width: options?.width || 512,
    margin: 2,
    color: options?.color || { dark: '#000000', light: '#ffffff' },
    errorCorrectionLevel: 'H',
  });
};

export const generateQRCodeSVG = async (url: string): Promise<string> => {
  return QRCode.toString(url, { type: 'svg', margin: 2 });
};

export const downloadQRCode = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
};

export const downloadQRCodeSVG = (svg: string, filename: string) => {
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
};
