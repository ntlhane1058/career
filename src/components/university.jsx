import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/uni.css";
import '../styles/scroll.css';

const University = () => {
    const [universities, setUniversities] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [courses, setCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newApplication, setNewApplication] = useState({
        studentName: '',
        phoneNumber: '',
        student_id: '',
        university: '',
        faculty: '',
        course: '',
        grades: [{ subject: '', grade: '' }]
    });

    const [showApplyFormModal, setShowApplyFormModal] = useState(false);
    const navigate = useNavigate(); // Initialize useNavigate

    // Fetch universities on component mount
    useEffect(() => {
        const fetchUniversities = async () => {
            try {
                const response = await fetch('http://localhost:8081/universities');
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setUniversities(data);
            } catch (error) {
                console.error('Error fetching universities:', error);
            }
        };
        fetchUniversities();
    }, []);

    // Fetch faculties when university is selected
    const fetchFaculties = async (universityId) => {
        try {
            const response = await fetch(`http://localhost:8081/faculties?universityId=${universityId}`);
            if (!response.ok) throw new Error('Failed to fetch faculties');
            const data = await response.json();
            setFaculties(data);
            setCourses([]); // Reset courses when a new university is selected
        } catch (error) {
            console.error('Error fetching faculties:', error);
        }
    };

    // Fetch courses when faculty is selected
    const fetchCourses = async (facultyId) => {
        try {
            const response = await fetch(`http://localhost:8081/courses?facultyId=${facultyId}`);
            if (!response.ok) throw new Error('Failed to fetch courses');
            const data = await response.json();
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    // Handle university selection
    const handleUniversityChange = (universityId) => {
        setNewApplication({ ...newApplication, university: universityId, faculty: '', course: '' });
        fetchFaculties(universityId);
    };

    // Handle faculty selection
    const handleFacultyChange = (facultyId) => {
        setNewApplication({ ...newApplication, faculty: facultyId, course: '' });
        fetchCourses(facultyId);
    };

    // Handle course selection
    const handleCourseChange = (courseId) => {
        setNewApplication({ ...newApplication, course: courseId });
    };

    const handleApply = async () => {
        try {
            const response = await fetch('http://localhost:8081/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newApplication),
            });
            if (!response.ok) throw new Error('Failed to submit application');
            alert('Application submitted successfully!');
            setShowApplyFormModal(false);
        } catch (error) {
            console.error('Error submitting application:', error);
            alert('Failed to submit application.');
        }
    };

    const handleBack = () => {
        setShowApplyFormModal(false); // Close the apply form
    };

    const handleLogout = () => {
        // Implement your logout logic here (like clearing tokens or authentication data)
        navigate('/login'); // Navigate to login page
    };

    return (
        <div className="universities-page">
            <h1>Student Dashboard</h1>
            <input
                type="text"
                placeholder="Search for university or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />
            <button 
                className="apply-form-button" 
                onClick={() => setShowApplyFormModal(true)} 
                style={{ marginRight: "10px" }} // Add space to the right
            >
                Apply for a Course
            </button>
            <button 
                className="logout-button" 
                onClick={handleLogout}
                style={{ marginLeft: "10px" }} // Add space to the left
            >
                Logout
            </button>

            {/* Apply Form Modal */}
            {showApplyFormModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setShowApplyFormModal(false)}>×</span>
                        <h2>Apply for a Course</h2>
                        <form>
                            <select
                                value={newApplication.university}
                                onChange={(e) => handleUniversityChange(e.target.value)}
                            >
                                <option value="">Select University</option>
                                {universities.map((uni) => (
                                    <option key={uni.id} value={uni.id}>{uni.name}</option>
                                ))}
                            </select>

                            <select
                                value={newApplication.faculty}
                                onChange={(e) => handleFacultyChange(e.target.value)}
                                disabled={!faculties.length}
                            >
                                <option value="">Select Faculty</option>
                                {faculties.map((faculty) => (
                                    <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                                ))}
                            </select>

                            <select
                                value={newApplication.course}
                                onChange={(e) => handleCourseChange(e.target.value)}
                                disabled={!courses.length}
                            >
                                <option value="">Select Course</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>{course.name}</option>
                                ))}
                            </select>

                            <button type="button" className="confirm-apply-button" onClick={handleApply}>
                                Apply
                            </button>
                            <button 
                                type="button" 
                                className="back-button" 
                                onClick={handleBack} 
                                style={{ marginLeft: "10px" }} // Space to the left
                            >
                                Back
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default University;