import { useState, useMemo } from "react";

export function useHostFilters(hosts: any[]) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHosts = useMemo(
    () =>
      hosts.filter((host) => {
        const query = searchQuery.toLowerCase();
        return (
          (host.name || "").toLowerCase().includes(query) ||
          (host.email || "").toLowerCase().includes(query)
        );
      }),
    [hosts, searchQuery],
  );

  return {
    searchQuery,
    setSearchQuery,
    filteredHosts,
  };
}
