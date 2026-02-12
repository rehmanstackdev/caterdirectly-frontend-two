import { UseFormReturn } from "react-hook-form";
import EventTitleAndVenue from "./basic-info/EventTitleAndVenue";
import EventLocation from "./basic-info/EventLocation";
import EventDescription from "./basic-info/EventDescription";
import EventDateTime from "./basic-info/EventDateTime";
import EventImageUpload from "./basic-info/EventImageUpload";

interface BasicInfoTabProps {
  form: UseFormReturn<any>;
}

const BasicInfoTab = ({ form }: BasicInfoTabProps) => {
  return (
    <div className="space-y-6">
      <EventTitleAndVenue form={form} />
      <EventLocation form={form} />
      <EventDescription form={form} />
      <EventDateTime form={form} />
      <EventImageUpload form={form} />
    </div>
  );
};

export default BasicInfoTab;
