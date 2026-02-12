
import { supabase } from "@/integrations/supabase/client";
import { ServiceItem } from "@/types/service-types";
import { transformServiceData } from "./crud/use-transform-service";

/**
 * Gets a specific service by its ID
 * @param id The service ID
 * @returns The service data
 */
export const getService = async (id: string): Promise<ServiceItem> => {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching service:", error);
    throw new Error(`Failed to fetch service: ${error.message}`);
  }

  if (!data) {
    throw new Error("Service not found");
  }

  return transformServiceData(data);
};

