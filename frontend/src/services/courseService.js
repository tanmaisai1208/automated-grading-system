const BASE_URL = "http://localhost:5000/api/courses";

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong while fetching course data");
  }

  return data;
};

export const getAllCourses = async () => {
  const response = await fetch(BASE_URL);
  return handleResponse(response);
};

export const getCourseById = async (courseId) => {
  const response = await fetch(`${BASE_URL}/${courseId}`);
  return handleResponse(response);
};

export const getCourseSummary = async (courseId) => {
  const response = await fetch(`${BASE_URL}/${courseId}/summary`);
  return handleResponse(response);
};

export const getCourseStudentsTable = async (courseId) => {
  const response = await fetch(`${BASE_URL}/${courseId}/students`);
  return handleResponse(response);
};

export const createCourse = async (courseData) => {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(courseData),
  });

  return handleResponse(response);
};

export const updateCourse = async (courseId, updatedData) => {
  const response = await fetch(`${BASE_URL}/${courseId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedData),
  });

  return handleResponse(response);
};

export const deleteCourse = async (courseId) => {
  const response = await fetch(`${BASE_URL}/${courseId}`, {
    method: "DELETE",
  });

  return handleResponse(response);
};