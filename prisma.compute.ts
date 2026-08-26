// @ts-ignore
import { defineComputeConfig } from "@prisma/compute-sdk/config";

export default defineComputeConfig({
  app: {
    name: "next-app",
    framework: "nextjs",
    httpPort: 3000,
  },
});
