import { Loader2 } from "lucide-react";

export function LoadingSpinner({ className = "h-8 w-8" }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} />;
}

export function FullPageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner className="h-12 w-12 text-primary" />
    </div>
  );
}

export function ContentLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <LoadingSpinner className="h-8 w-8 text-primary" />
      <p className="mt-4 text-sm text-gray-500">{text}</p>
    </div>
  );
}
