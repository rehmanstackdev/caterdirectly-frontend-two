
import { Textarea } from "@/components/ui/textarea";

interface AdditionalNotesProps {
  value: string;
  onChange: (value: string) => void;
}

function AdditionalNotes({ value, onChange }: AdditionalNotesProps) {
  return (
    <div className="bg-white mt-1 rounded-xl shadow-sm space-y-4">
      <div className="space-y-2">
        <label className="block text-sm">Additional Notes (Optional)</label>
        <Textarea 
          placeholder="Write Additional Notes" 
          className="min-h-[100px]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default AdditionalNotes;

