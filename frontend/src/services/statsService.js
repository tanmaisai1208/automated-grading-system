export const getStats = async () => {
  const res = await fetch("http://localhost:5000/api/stats/overall");

  if (!res.ok) {
    throw new Error("Failed to fetch stats");
  }

  return res.json();
};