"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getUserProjectIdsAction } from "./actions/get-projects";

interface Props {
  initialProjectIds: string[];
}

export function ProjectsPoller({ initialProjectIds }: Props) {
  const router = useRouter();
  const lastIdsRef = useRef<string[]>(initialProjectIds);

  useEffect(() => {
    lastIdsRef.current = initialProjectIds;
  }, [initialProjectIds]);

  useEffect(() => {
    const checkAndFetch = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const fresh = await getUserProjectIdsAction();
        const current = lastIdsRef.current;
        if (current.length !== fresh.length) {
          lastIdsRef.current = fresh;
          router.refresh();
          return;
        }
        const sortedCurrent = [...current].sort();
        const sortedFresh = [...fresh].sort();
        const isEqual = sortedCurrent.every((id, index) => id === sortedFresh[index]);
        if (!isEqual) {
          lastIdsRef.current = fresh;
          router.refresh();
        }
      } catch {
      }
    };

    const intervalId = setInterval(checkAndFetch, 10000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAndFetch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);

  return null;
}
