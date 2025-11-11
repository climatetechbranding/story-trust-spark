import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { detectGreenClaims } from "@/lib/tiptap-config";

interface GreenClaimsDetectorProps {
  text: string;
}

export const GreenClaimsDetector = ({ text }: GreenClaimsDetectorProps) => {
  const claims = detectGreenClaims(text);

  if (claims.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>{claims.length} sustainability claim{claims.length !== 1 ? 's' : ''} detected</strong>
          <p className="text-xs mt-1">Ensure each claim has proper substantiation evidence.</p>
        </AlertDescription>
      </Alert>

      <div className="flex flex-wrap gap-2">
        {claims.map((claim, index) => (
          <Badge key={index} variant="secondary" className="capitalize">
            {claim}
          </Badge>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        💡 Tip: Link these claims to evidence documents in the substantiation drawer
      </p>
    </div>
  );
};
