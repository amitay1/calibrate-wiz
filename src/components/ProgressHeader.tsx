import { Progress } from "@/components/ui/progress";

interface ProgressHeaderProps {
  completionPercent: number;
  requiredFieldsComplete: number;
  totalRequiredFields: number;
}

export const ProgressHeader = ({ 
  completionPercent, 
  requiredFieldsComplete, 
  totalRequiredFields 
}: ProgressHeaderProps) => {
  return (
    <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">Overall Progress</span>
        <span className="text-sm font-semibold text-primary">{Math.round(completionPercent)}%</span>
      </div>
      <Progress value={completionPercent} className="h-2 mb-2" />
      <p className="text-xs text-muted-foreground">
        {requiredFieldsComplete} of {totalRequiredFields} required fields completed
      </p>
    </div>
  );
};
