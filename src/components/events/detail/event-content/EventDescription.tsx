


interface EventDescriptionProps {
  description: string;
}

const EventDescription = ({ description }: EventDescriptionProps) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">About This Event</h3>
      <p className="text-gray-700 whitespace-pre-line">{description}</p>
    </div>
  );
};

export default EventDescription;
