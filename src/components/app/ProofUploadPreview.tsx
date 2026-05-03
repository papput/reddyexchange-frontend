import { useEffect, useState, type RefObject } from "react";
import { CheckCircle2, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";

type Props = {
  file: File | null;
  onFileChange: (f: File | null) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  label?: string;
  /** Smaller preview and padding for dense flows */
  compact?: boolean;
};

export function ProofUploadPreview({ file, onFileChange, inputRef, label = "Payment screenshot", compact }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div>
      <Label className="text-xs text-secondary uppercase tracking-wide mb-2 block">{label}</Label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`w-full rounded-xl border border-dashed border-border bg-surface text-center hover:border-primary/50 transition space-y-2 ${compact ? "p-2" : "p-4 space-y-3"}`}
      >
        {file && previewUrl ? (
          <div className={compact ? "space-y-1.5" : "space-y-3"}>
            <div className={`relative mx-auto overflow-hidden rounded-lg border border-border bg-muted/30 ${compact ? "max-w-[200px]" : "max-w-xs rounded-xl"}`}>
              <img
                src={previewUrl}
                alt="Payment proof preview"
                className={`w-full object-contain ${compact ? "max-h-28" : "max-h-56"}`}
              />
            </div>
            <div className={`flex items-center justify-center gap-1.5 text-success ${compact ? "text-xs" : "text-sm"}`}>
              <CheckCircle2 className={`shrink-0 ${compact ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
              <span className="truncate max-w-[90%]">{file.name}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Tap to replace</span>
          </div>
        ) : (
          <div className={`flex flex-col items-center gap-1 text-secondary ${compact ? "text-xs py-1" : "text-sm py-2 gap-2"}`}>
            <Upload className={compact ? "h-4 w-4" : "h-5 w-5"} /> Upload screenshot
            <span className="text-[10px] text-muted-foreground">PNG, JPG · 15MB</span>
          </div>
        )}
      </button>
    </div>
  );
}
