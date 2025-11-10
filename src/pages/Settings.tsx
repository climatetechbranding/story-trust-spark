import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HexColorPicker } from "react-colorful";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useBrandSettings, useSaveBrandSettings, uploadBrandAsset } from "@/hooks/useBrandSettings";
import { BRAND_PRESETS, GOOGLE_FONTS } from "@/types/brand";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const { data: brandSettings, isLoading } = useBrandSettings();
  const saveBrandSettings = useSaveBrandSettings();

  const [primaryColor, setPrimaryColor] = useState("217 91% 60%");
  const [secondaryColor, setSecondaryColor] = useState("142 76% 36%");
  const [textColor, setTextColor] = useState("222.2 84% 4.9%");
  const [primaryFont, setPrimaryFont] = useState("Inter");
  const [secondaryFont, setSecondaryFont] = useState("Inter");
  const [faviconUrl, setFaviconUrl] = useState<string | undefined>();
  const [shareImageUrl, setShareImageUrl] = useState<string | undefined>();
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (brandSettings) {
      setPrimaryColor(brandSettings.primary_color);
      setSecondaryColor(brandSettings.secondary_color);
      setTextColor(brandSettings.text_color);
      setPrimaryFont(brandSettings.primary_font);
      setSecondaryFont(brandSettings.secondary_font);
      setFaviconUrl(brandSettings.favicon_url);
      setShareImageUrl(brandSettings.share_image_url);
    }
  }, [brandSettings]);

  useEffect(() => {
    if (!brandSettings) return;
    const changed =
      primaryColor !== brandSettings.primary_color ||
      secondaryColor !== brandSettings.secondary_color ||
      textColor !== brandSettings.text_color ||
      primaryFont !== brandSettings.primary_font ||
      secondaryFont !== brandSettings.secondary_font ||
      faviconUrl !== brandSettings.favicon_url ||
      shareImageUrl !== brandSettings.share_image_url;
    setHasChanges(changed);
  }, [primaryColor, secondaryColor, textColor, primaryFont, secondaryFont, faviconUrl, shareImageUrl, brandSettings]);

  const hslToHex = (hsl: string) => {
    const [h, s, l] = hsl.split(" ").map((v) => parseFloat(v));
    const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = (l / 100) - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const handleSave = async () => {
    await saveBrandSettings.mutateAsync({
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      text_color: textColor,
      primary_font: primaryFont,
      secondary_font: secondaryFont,
      favicon_url: faviconUrl,
      share_image_url: shareImageUrl,
    });
    setHasChanges(false);
  };

  const handleFileUpload = async (file: File, type: "favicon" | "share-image") => {
    try {
      const url = await uploadBrandAsset(file, type);
      if (type === "favicon") {
        setFaviconUrl(url);
      } else {
        setShareImageUrl(url);
      }
      toast.success(`${type === "favicon" ? "Favicon" : "Share image"} uploaded`);
    } catch (error) {
      toast.error(`Failed to upload ${type}`);
    }
  };

  const applyPreset = (preset: typeof BRAND_PRESETS[0]) => {
    setPrimaryColor(preset.colors.primary);
    setSecondaryColor(preset.colors.secondary);
    setTextColor(preset.colors.text);
    setPrimaryFont(preset.fonts.primary);
    setSecondaryFont(preset.fonts.secondary);
  };

  const resetToDefaults = () => {
    setPrimaryColor("217 91% 60%");
    setSecondaryColor("142 76% 36%");
    setTextColor("222.2 84% 4.9%");
    setPrimaryFont("Inter");
    setSecondaryFont("Inter");
    setFaviconUrl(undefined);
    setShareImageUrl(undefined);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Brand Identity</h1>
            <p className="text-muted-foreground">Customize your brand's visual identity</p>
          </div>
        </div>

        <Tabs defaultValue="branding" className="space-y-6">
          <TabsList>
            <TabsTrigger value="branding">Branding</TabsTrigger>
          </TabsList>

          <TabsContent value="branding" className="space-y-6">
            {/* Brand Presets */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Presets</CardTitle>
                <CardDescription>Quick start with pre-designed themes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {BRAND_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className="p-4 border rounded-lg hover:border-primary transition-colors text-left"
                    >
                      <div className="flex gap-2 mb-2">
                        <div
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: `hsl(${preset.colors.primary})` }}
                        />
                        <div
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: `hsl(${preset.colors.secondary})` }}
                        />
                      </div>
                      <h3 className="font-medium">{preset.name}</h3>
                      <p className="text-sm text-muted-foreground">{preset.description}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Color Palette */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Colors</CardTitle>
                <CardDescription>
                  Choose colors that match your brand identity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Primary Color */}
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <p className="text-xs text-muted-foreground">For buttons and key actions</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className="w-full h-12 rounded-md border"
                          style={{ backgroundColor: `hsl(${primaryColor})` }}
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3">
                        <HexColorPicker
                          color={hslToHex(primaryColor)}
                          onChange={(hex) => setPrimaryColor(hexToHsl(hex))}
                        />
                      </PopoverContent>
                    </Popover>
                    <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                  </div>

                  {/* Secondary Color */}
                  <div className="space-y-2">
                    <Label>Secondary Color</Label>
                    <p className="text-xs text-muted-foreground">For accents</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className="w-full h-12 rounded-md border"
                          style={{ backgroundColor: `hsl(${secondaryColor})` }}
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3">
                        <HexColorPicker
                          color={hslToHex(secondaryColor)}
                          onChange={(hex) => setSecondaryColor(hexToHsl(hex))}
                        />
                      </PopoverContent>
                    </Popover>
                    <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
                  </div>

                  {/* Text Color */}
                  <div className="space-y-2">
                    <Label>Text Color</Label>
                    <p className="text-xs text-muted-foreground">Primary text on light backgrounds</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className="w-full h-12 rounded-md border"
                          style={{ backgroundColor: `hsl(${textColor})` }}
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3">
                        <HexColorPicker
                          color={hslToHex(textColor)}
                          onChange={(hex) => setTextColor(hexToHsl(hex))}
                        />
                      </PopoverContent>
                    </Popover>
                    <Input value={textColor} onChange={(e) => setTextColor(e.target.value)} />
                  </div>
                </div>
                <Button variant="outline" onClick={resetToDefaults}>
                  Reset to Defaults
                </Button>
              </CardContent>
            </Card>

            {/* Typography */}
            <Card>
              <CardHeader>
                <CardTitle>Fonts</CardTitle>
                <CardDescription>Select fonts that reflect your brand</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Primary Font</Label>
                    <p className="text-xs text-muted-foreground">For headings</p>
                    <Select value={primaryFont} onValueChange={setPrimaryFont}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GOOGLE_FONTS.map((font) => (
                          <SelectItem key={font} value={font}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div style={{ fontFamily: primaryFont }} className="text-lg">
                      The quick brown fox jumps
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Secondary Font</Label>
                    <p className="text-xs text-muted-foreground">For body text</p>
                    <Select value={secondaryFont} onValueChange={setSecondaryFont}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GOOGLE_FONTS.map((font) => (
                          <SelectItem key={font} value={font}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div style={{ fontFamily: secondaryFont }}>
                      The quick brown fox jumps over the lazy dog
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Brand Assets */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Assets</CardTitle>
                <CardDescription>Upload assets used when sharing your stories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Favicon</Label>
                    <p className="text-xs text-muted-foreground">
                      Browser tab icon (32x32px recommended)
                    </p>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      {faviconUrl ? (
                        <div className="space-y-2">
                          <img src={faviconUrl} alt="Favicon" className="w-16 h-16 mx-auto" />
                          <Button variant="ghost" size="sm" onClick={() => setFaviconUrl(undefined)}>
                            <X className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to upload</p>
                          <input
                            type="file"
                            accept="image/png,image/x-icon"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, "favicon");
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Social Share Image</Label>
                    <p className="text-xs text-muted-foreground">
                      Preview when sharing (1200x630px recommended)
                    </p>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      {shareImageUrl ? (
                        <div className="space-y-2">
                          <img src={shareImageUrl} alt="Share" className="w-full h-32 object-cover rounded" />
                          <Button variant="ghost" size="sm" onClick={() => setShareImageUrl(undefined)}>
                            <X className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to upload</p>
                          <input
                            type="file"
                            accept="image/jpeg,image/png"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, "share-image");
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>See how your branding looks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 p-6 border rounded-lg">
                  <h2
                    style={{
                      color: `hsl(${textColor})`,
                      fontFamily: primaryFont,
                    }}
                    className="text-2xl font-bold"
                  >
                    Sample Heading
                  </h2>
                  <p
                    style={{
                      color: `hsl(${textColor})`,
                      fontFamily: secondaryFont,
                    }}
                  >
                    This is how your body text will look with the selected fonts and colors.
                  </p>
                  <div className="flex gap-3">
                    <button
                      style={{ backgroundColor: `hsl(${primaryColor})` }}
                      className="px-6 py-3 rounded-lg text-white font-medium"
                    >
                      Primary Button
                    </button>
                    <button
                      style={{ backgroundColor: `hsl(${secondaryColor})` }}
                      className="px-6 py-3 rounded-lg text-white font-medium"
                    >
                      Secondary Button
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {hasChanges ? "You have unsaved changes" : "All changes saved"}
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={resetToDefaults} disabled={!hasChanges}>
                  Discard Changes
                </Button>
                <Button onClick={handleSave} disabled={!hasChanges || saveBrandSettings.isPending}>
                  {saveBrandSettings.isPending ? "Saving..." : "Save Branding"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
