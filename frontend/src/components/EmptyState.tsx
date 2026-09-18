import { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, message }: { icon: LucideIcon; title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 text-graphite-400">
      <Icon className="w-10 h-10 mb-3" strokeWidth={1.25} />
      <p className="font-medium text-graphite-600 dark:text-graphite-300">{title}</p>
      <p className="text-sm mt-1 max-w-xs">{message}</p>
    </div>
  );
}
