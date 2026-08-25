import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GymFlow — Fitness Tracker",
    short_name: "GymFlow",
    description: "Track workouts, exercises, and progress.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0a",
    theme_color: "#7c3aed",
    categories: ["fitness", "health", "sports", "lifestyle"],
    shortcuts: [
      {
        name: "Start workout",
        short_name: "Workout",
        description: "Open the workouts dashboard to start a new session.",
        url: "/workouts",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Browse exercises",
        short_name: "Exercises",
        description: "Browse the exercise catalog.",
        url: "/exercises",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
