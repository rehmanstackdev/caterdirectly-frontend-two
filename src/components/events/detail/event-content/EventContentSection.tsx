

import EventImage from './EventImage';
import EventDescription from './EventDescription';

interface EventContentSectionProps {
  image: string | null;
  title: string;
  description: string;
}

const EventContentSection = ({
  image,
  title,
  description
}: EventContentSectionProps) => {
  return (
    <div className="space-y-6">
      <EventImage image={image} title={title} />
      <EventDescription description={description} />
    </div>
  );
};

export default EventContentSection;
