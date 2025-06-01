import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ size }: { size?: number }) {
  return (
    <div className="flex items-center justify-center">
      <Loader2 size={size} className="animate-spin" />
    </div>
  );
}
