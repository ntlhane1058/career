import React, { useEffect, useState } from 'react';
import "../styles/courses.css"

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:8081/courses');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Fetched courses:', data);
      setCourses(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="courses-page">
      <h1>Available Courses</h1>
      <table className="courses-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Course Name</th>
            <th>University</th>
            <th>Requirements</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course.id}>
              <td>{course.id}</td>
              <td>{course.name}</td>
              <td>{course.university}</td>
              <td>{course.requirements}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Courses;