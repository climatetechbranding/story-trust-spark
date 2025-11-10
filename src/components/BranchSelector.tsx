import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StoryBranch } from "@/hooks/useStories";

interface BranchSelectorProps {
  branches: StoryBranch[];
  currentBranchId: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export const BranchSelector = ({
  branches,
  currentBranchId,
  value,
  onValueChange,
  placeholder = "Select branch",
}: BranchSelectorProps) => {
  // Filter out current branch to prevent circular references
  const availableBranches = branches.filter((b) => b.id !== currentBranchId);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {availableBranches.map((branch) => (
          <SelectItem key={branch.id} value={branch.id}>
            {branch.icon && (
              <img src={branch.icon} alt="" className="inline-block w-4 h-4 mr-2" />
            )}
            {branch.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
