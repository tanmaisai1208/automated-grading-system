export const getStats = async () => {
  const res = await fetch("/api/stats/overall", { credentials: "include" });

  if (!res.ok) {
    throw new Error("Failed to fetch stats");
  }

  return res.json();
};