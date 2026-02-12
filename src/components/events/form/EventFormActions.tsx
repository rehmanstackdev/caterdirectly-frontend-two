import { Button } from "@/components/ui/button";

interface EventFormActionsProps {
  isEditing: boolean;
  onCancel?: () => void;
}

const EventFormActions = ({ isEditing, onCancel }: EventFormActionsProps) => {
  return (
    <div className="flex justify-end space-x-4 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit">
        {isEditing ? "Update Event" : "Create Event"}
      </Button>
    </div>
  );
};

export default EventFormActions;
