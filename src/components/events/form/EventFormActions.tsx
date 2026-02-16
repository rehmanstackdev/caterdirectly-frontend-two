import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventFormActionsProps {
  isEditing: boolean;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const EventFormActions = ({
  isEditing,
  onCancel,
  isSubmitting = false,
}: EventFormActionsProps) => {
  return (
    <div className="flex justify-end space-x-4 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isEditing ? "Updating Event..." : "Creating Event..."}
          </>
        ) : isEditing ? (
          "Update Event"
        ) : (
          "Create Event"
        )}
      </Button>
    </div>
  );
};

export default EventFormActions;
