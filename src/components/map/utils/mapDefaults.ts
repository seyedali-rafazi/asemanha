import type { BboxParams } from "../../../services/types";

/**
 * Initial camera view state for Desktop mode:
 * Centered on the Middle East with zoom level 4.4, providing an optimal framing
 * of the entire Middle East region (Iran, Iraq, Saudi Arabia, UAE, Qatar, Kuwait,
 * Bahrain, Oman, Yemen, Jordan, Syria, Lebanon, Turkey, Egypt).
 *
 * This ensures that on initial visit, data fetching targets only visible Middle East
 * aircraft (~300-600 planes) rather than the global dataset (8,600+ planes),
 * resulting in fast load times and responsive performance.
 */
export const MIDDLE_EAST_DESKTOP_VIEW = {
  longitude: 49.0,
  latitude: 31.0,
  zoom: 4.4,
  pitch: 0,
  bearing: 0,
};

/**
 * Initial camera view state for Mobile mode:
 * Slightly lower zoom to comfortably accommodate the narrow mobile viewport.
 */
export const MIDDLE_EAST_MOBILE_VIEW = {
  longitude: 49.0,
  latitude: 31.0,
  zoom: 3.2,
  pitch: 0,
  bearing: 0,
};

/**
 * Default bounding box matching the desktop Middle East view
 */
export const DEFAULT_MIDDLE_EAST_BBOX: BboxParams & { zoom: number } = {
  lamin: 18.0,
  lamax: 42.0,
  lomin: 22.0,
  lomax: 76.0,
  zoom: 4.4,
};

/**
 * Default bounding box matching the mobile Middle East view
 */
export const DEFAULT_MIDDLE_EAST_MOBILE_BBOX: BboxParams & { zoom: number } = {
  lamin: 2.0,
  lamax: 54.0,
  lomin: 34.0,
  lomax: 64.0,
  zoom: 3.2,
};
