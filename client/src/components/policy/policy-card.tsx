import { Policy } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PolicyCardProps {
  policy: Policy;
  onClick: (policy: Policy) => void;
}

export function PolicyCard({ policy, onClick }: PolicyCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-all"
      onClick={() => onClick(policy)}
    >
      <CardContent className="p-5 flex items-start space-x-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
          <FileText size={20} />
        </div>
        <div className="space-y-2">
          <div className="space-y-1">
            <h3 className="font-medium text-gray-900">{policy.title}</h3>
            <Badge variant="outline" className="text-xs font-normal bg-gray-50">
              {policy.category}
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            Updated {formatDistanceToNow(new Date(policy.updatedAt), { addSuffix: true })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
