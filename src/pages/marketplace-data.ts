
import { Utensils, Building, PartyPopper, UserRound } from "lucide-react";

export const services = [
  {
    id: "catering",
    title: "Catering",
    description: "Find professional caterers for any event type and size",
    icon: Utensils,
    color: "bg-amber-500",
    link: "/catering"
  },
  {
    id: "venues",
    title: "Venues",
    description: "Discover the perfect venues to host your events",
    icon: Building,
    color: "bg-blue-500",
    link: "/venues"
  },
  {
    id: "party-rentals",
    title: "Party Rentals",
    description: "Browse decorations, equipment, and entertainment options",
    icon: PartyPopper,
    color: "bg-purple-500",
    link: "/party-rentals"
  },
  {
    id: "staff",
    title: "Staffing",
    description: "Hire professional event staff for seamless execution",
    icon: UserRound,
    color: "bg-green-500",
    link: "/staffing"
  }
];
