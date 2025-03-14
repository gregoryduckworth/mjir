import { Policy } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Printer } from "lucide-react";
import { format } from "date-fns";

interface PolicyViewerProps {
  policy: Policy | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PolicyViewer({ policy, isOpen, onClose }: PolicyViewerProps) {
  if (!policy) return null;

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>${policy.title}</title>
          <style>
            body { font-family: system-ui, sans-serif; line-height: 1.5; }
            h1 { font-size: 24px; margin-bottom: 8px; }
            .category { color: #666; font-size: 14px; margin-bottom: 16px; }
            .date { color: #888; font-size: 12px; margin-bottom: 24px; }
            .content { font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>${policy.title}</h1>
          <div class="category">Category: ${policy.category}</div>
          <div class="date">Last updated: ${format(new Date(policy.updatedAt), "MMMM d, yyyy")}</div>
          <div class="content">${policy.content}</div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{policy.title}</DialogTitle>
          <DialogDescription>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline">{policy.category}</Badge>
              <span className="text-xs text-gray-500">
                Last updated: {format(new Date(policy.updatedAt), "MMMM d, yyyy")}
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto mt-4 prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: policy.content }} />
        </div>
        
        <DialogFooter className="mt-4">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
