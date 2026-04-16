// export const getStats = async () => {
//   const res = await fetch("http://localhost:5000/api/stats/overall");

//   if (!res.ok) {
//     throw new Error("Failed to fetch stats");
//   }

//   return res.json();
// };

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const getStats = async () => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/stats/overall`,
    {
      credentials: "include",
    }
  );

  let data;

  try {
    data = await res.json();
  } catch (err) {
    throw new Error("Invalid response from server");
  }

  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch stats");
  }

  return data;
};

export const getCourseStats = async (courseId) => {
  const res = await fetch(`${BASE_URL}/stats/${courseId}`, {
    credentials: "include",
  });
  return handleResponse(res);
};

export const getGradeDistribution = async (courseId) => {
  const res = await fetch(`${BASE_URL}/stats/${courseId}/grades`, {
    credentials: "include",
  });
  return handleResponse(res);
};