import type { Category, MenuItem } from "../types";

const localImages = import.meta.glob("../assets/menu/*.{png,jpg,jpeg,webp}", {
  eager: true,
  query: "?url",
  import: "default"
}) as Record<string, string>;

const normalize = (value: string) =>
  value
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/\\/g, "/")
    .split("/")
    .pop()
    ?.replace(/\s+/g, "")
    .toLowerCase() ?? value.toLowerCase();

const localImageByKey = Object.fromEntries(
  Object.entries(localImages).map(([path, url]) => [normalize(path), url])
) as Record<string, string>;

const fallbackImages: Record<Category, string> = {
  milkTea: "https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=640&q=80",
  coffee: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=640&q=80",
  dessert: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=640&q=80",
  snack: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=640&q=80",
  nightFood: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=640&q=80",
  lightFood: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=640&q=80",
  activity: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=640&q=80",
  staple: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=640&q=80",
  stirFry: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=640&q=80",
  soupPot: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=640&q=80",
  other: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=640&q=80"
};

export const resolveMenuImage = (item: MenuItem) => {
  const key = normalize(item.imageKey ?? item.name);
  return localImageByKey[key] ?? fallbackImages[item.category];
};

export const missingLocalImageKeys = (items: MenuItem[]) => {
  return items
    .map((item) => item.imageKey ?? item.name)
    .filter((key) => !localImageByKey[normalize(key)]);
};
