import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

const VERSION_POLL_INTERVAL_MS = 5 * 60 * 1000;

async function fetchVersion(): Promise<string> {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  const res = await fetch(`${apiUrl}/version`);
  if (!res.ok) throw new Error("Failed to fetch version");
  const data = await res.json();
  return data.version as string;
}

/** True once the backend reports a build_version different from the one seen at page load. */
export function useAppVersion() {
  const initialVersion = useRef<string | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const { data } = useQuery({
    queryKey: ["app-version"],
    queryFn: fetchVersion,
    refetchInterval: VERSION_POLL_INTERVAL_MS,
    refetchOnWindowFocus: true,
    staleTime: 0,
    retry: false,
  });

  useEffect(() => {
    if (!data) return;
    if (initialVersion.current === null) {
      initialVersion.current = data;
      return;
    }
    if (data !== initialVersion.current) {
      setUpdateAvailable(true);
    }
  }, [data]);

  return { updateAvailable };
}
