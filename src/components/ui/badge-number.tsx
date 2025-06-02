import { cn } from "@/lib/utils";

export default function BadgeNumber({
  number = 0,
  className,
}: {
  number: string | number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-foreground flex h-6 w-6 items-center justify-center rounded-full border",
        className,
      )}
    >
      {number}
    </div>
  );
}
