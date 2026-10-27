import { ConvexHttpClient } from "convex/browser";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://healthy-hawk-441.convex.cloud";

export const convex = new ConvexHttpClient(convexUrl);
export default convex;
