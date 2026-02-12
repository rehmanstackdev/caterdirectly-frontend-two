
export interface Testimonial {
  id: string;
  author: string;
  rating: number;
  text: string;
  avatar: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    author: "Sarah Johnson",
    rating: 5,
    text: "The catering service exceeded our expectations. The food was amazing and the service was impeccable!",
    avatar: "/lovable-uploads/81b4c572-b04a-41a4-863a-34998edf9f40.png"
  },
  {
    id: "2",
    author: "Michael Chen",
    rating: 5,
    text: "Perfect execution for our corporate event. The attention to detail was outstanding.",
    avatar: "/lovable-uploads/98eaddf0-6879-4e9e-89a0-ae7693166d19.png"
  },
  {
    id: "3",
    author: "Emily Rodriguez",
    rating: 5,
    text: "Incredible variety and quality. Our guests couldn't stop raving about the food!",
    avatar: "/lovable-uploads/db2532af-1fbe-487c-bcef-70380b9b66d4.png"
  }
];
