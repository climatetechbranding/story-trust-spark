import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NodeSettings, defaultNodeSettings } from "@/lib/animation-utils";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";

interface NodeSettingsPanelProps {
  settings: NodeSettings;
  onChange: (settings: NodeSettings) => void;
}

export const NodeSettingsPanel = ({ settings, onChange }: NodeSettingsPanelProps) => {
  const currentSettings = { ...defaultNodeSettings, ...settings };
  const [tagInput, setTagInput] = useState("");

  const updateSettings = (path: string, value: any) => {
    const keys = path.split('.');
    const newSettings = { ...currentSettings };
    let current: any = newSettings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    onChange(newSettings);
  };

  const addTag = () => {
    if (tagInput.trim()) {
      const currentTags = currentSettings.analytics?.tags || [];
      updateSettings('analytics.tags', [...currentTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    const currentTags = currentSettings.analytics?.tags || [];
    updateSettings('analytics.tags', currentTags.filter((_, i) => i !== index));
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="settings">
        <AccordionTrigger className="text-sm font-medium">
          Advanced Settings
        </AccordionTrigger>
        <AccordionContent className="space-y-6 pt-4">
          {/* Appearance Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Appearance</h4>
            
            <div className="space-y-2">
              <Label className="text-xs">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={currentSettings.appearance?.background || "#ffffff"}
                  onChange={(e) => updateSettings('appearance.background', e.target.value)}
                  className="w-20 h-8"
                />
                <Input
                  type="text"
                  value={currentSettings.appearance?.background || ""}
                  onChange={(e) => updateSettings('appearance.background', e.target.value)}
                  placeholder="None or #hex"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Padding</Label>
              <RadioGroup
                value={currentSettings.appearance?.padding}
                onValueChange={(value) => updateSettings('appearance.padding', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tight" id="tight" />
                  <Label htmlFor="tight" className="text-xs font-normal">Tight</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="normal" />
                  <Label htmlFor="normal" className="text-xs font-normal">Normal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spacious" id="spacious" />
                  <Label htmlFor="spacious" className="text-xs font-normal">Spacious</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Alignment</Label>
              <RadioGroup
                value={currentSettings.appearance?.alignment}
                onValueChange={(value) => updateSettings('appearance.alignment', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="top" id="top" />
                  <Label htmlFor="top" className="text-xs font-normal">Top</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="center" id="center" />
                  <Label htmlFor="center" className="text-xs font-normal">Center</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bottom" id="bottom" />
                  <Label htmlFor="bottom" className="text-xs font-normal">Bottom</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Animation Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Animations</h4>
            
            <div className="space-y-2">
              <Label className="text-xs">Entrance Animation</Label>
              <Select
                value={currentSettings.animation?.entrance}
                onValueChange={(value) => updateSettings('animation.entrance', value)}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fade">Fade</SelectItem>
                  <SelectItem value="slide">Slide</SelectItem>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Exit Animation</Label>
              <Select
                value={currentSettings.animation?.exit}
                onValueChange={(value) => updateSettings('animation.exit', value)}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fade">Fade</SelectItem>
                  <SelectItem value="slide">Slide</SelectItem>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Duration</Label>
              <RadioGroup
                value={currentSettings.animation?.duration}
                onValueChange={(value) => updateSettings('animation.duration', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fast" id="fast" />
                  <Label htmlFor="fast" className="text-xs font-normal">Fast (200ms)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="norm" />
                  <Label htmlFor="norm" className="text-xs font-normal">Normal (400ms)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="slow" id="slow" />
                  <Label htmlFor="slow" className="text-xs font-normal">Slow (600ms)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Accessibility Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Accessibility</h4>
            
            <div className="space-y-2">
              <Label className="text-xs">Screen Reader Text</Label>
              <Input
                type="text"
                value={currentSettings.accessibility?.screenReaderText || ""}
                onChange={(e) => updateSettings('accessibility.screenReaderText', e.target.value)}
                placeholder="Describe this content for screen readers"
                className="text-xs"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="highContrast"
                checked={currentSettings.accessibility?.highContrast}
                onCheckedChange={(checked) => updateSettings('accessibility.highContrast', checked)}
              />
              <Label htmlFor="highContrast" className="text-xs font-normal">
                Enable high contrast mode
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="reducedMotion"
                checked={currentSettings.accessibility?.reducedMotion}
                onCheckedChange={(checked) => updateSettings('accessibility.reducedMotion', checked)}
              />
              <Label htmlFor="reducedMotion" className="text-xs font-normal">
                Disable animations for reduced motion users
              </Label>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Analytics</h4>
            
            <div className="space-y-2">
              <Label className="text-xs">Custom Tags</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  placeholder="Add tag..."
                  className="text-xs"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(currentSettings.analytics?.tags || []).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => removeTag(index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="criticalPath"
                checked={currentSettings.analytics?.isCriticalPath}
                onCheckedChange={(checked) => updateSettings('analytics.isCriticalPath', checked)}
              />
              <Label htmlFor="criticalPath" className="text-xs font-normal">
                Mark as critical path (important for funnel tracking)
              </Label>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
