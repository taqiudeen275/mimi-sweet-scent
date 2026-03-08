"use client";

import { useEffect } from "react";
import { saveRecentlyViewed } from "./RecentlyViewed";

interface Props {
  id:       string;
  slug:     string;
  name:     string;
  price:    number;
  imageUrl: string | null;
}

export function TrackView(props: Props) {
  useEffect(() => {
    saveRecentlyViewed(props);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
