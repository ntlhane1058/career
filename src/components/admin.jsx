import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/admin.css";
import '../styles/modals.css';

const Admin = () => {
    const navigate = useNavigate();
    const [showAddInstitutionModal, setShowAddInstitutionModal] = useState(false);
    const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
    const [showAddCourseModal, setShowAddCourseModal] = useState(false);
    const [showDeleteInstitutionModal, setShowDeleteInstitutionModal] = useState(false);
    const [showPublishAdmissionsModal, setShowPublishAdmissionsModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    const [institutionToPublish, setInstitutionToPublish] = useState('');
    const [institutionName, setInstitutionName] = useState('');
    const [facultyName, setFacultyName] = useState('');
    const [courseName, setCourseName] = useState('');
    const [institutionToDelete, setInstitutionToDelete] = useState('');
    const [profileDetails, setProfileDetails] = useState({ name: '', email: '', phone: '' });
    
    const [numberOfStudents, setNumberOfStudents] = useState('');
    const [numberOfDepartments, setNumberOfDepartments] = useState('');
    const [numberOfCourses, setNumberOfCourses] = useState('');
    const [universityLogo, setUniversityLogo] = useState(null);

    const [selectedInstitution, setSelectedInstitution] = useState('');
    const [selectedFaculty, setSelectedFaculty] = useState('');
    
    const [institutions, setInstitutions] = useState([]);

    useEffect(() => {
        fetchInstitutions();
    }, []);

    const fetchInstitutions = async () => {
        try {
            const response = await axios.get('http://localhost:8081/institutions');
            setInstitutions(response.data);
        } catch (error) {
            console.error('Error fetching institutions:', error);
        }
    };

    const isDuplicateInstitution = (name) => {
        return institutions.some(institution => institution.name.toLowerCase() === name.toLowerCase());
    };

    const isDuplicateFaculty = (name) => {
        return institutions.some(institution =>
            institution.faculties?.some(faculty => faculty.name.toLowerCase() === name.toLowerCase() && faculty.institutionId === selectedInstitution)
        );
    };

    const isDuplicateCourse = (name) => {
        return institutions.some(institution =>
            institution.faculties?.some(faculty =>
                faculty.courses?.some(course => course.name.toLowerCase() === name.toLowerCase() && faculty.id === selectedFaculty)
            )
        );
    };

    const handleAddInstitution = async () => {
        if (!institutionName || !numberOfStudents || !numberOfDepartments || !numberOfCourses || !universityLogo) {
            alert('Please fill in all fields before submitting.');
            return;
        }

        if (isDuplicateInstitution(institutionName)) {
            alert('An institution with this name already exists.');
            return;
        }

        const formData = new FormData();
        formData.append('name', institutionName);
        formData.append('number_of_students', numberOfStudents);
        formData.append('number_of_departments', numberOfDepartments);
        formData.append('number_of_courses', numberOfCourses);
        formData.append('logo', universityLogo);

        try {
            const response = await fetch('http://localhost:8081/institutions', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            alert('Institution added:', data);
            fetchInstitutions();
            setShowAddInstitutionModal(false);
            setInstitutionName('');
            setNumberOfStudents('');
            setNumberOfDepartments('');
            setNumberOfCourses('');
            setUniversityLogo(null);

        } catch (error) {
            console.error('Error adding institution:', error);
            alert('Failed to add institution. Please try again.');
        }
    };

    const handleAddFaculty = async (e) => {
        e.preventDefault();

        if (!facultyName || !selectedInstitution) {
            alert('Please fill in all fields.');
            return;
        }

        if (isDuplicateFaculty(facultyName)) {
            alert('This faculty already exists for the selected institution.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8081/faculties', {
                facultyName,
                institutionId: selectedInstitution,
            });

            if (response.status === 200) {
                alert('Faculty added successfully');
                setShowAddFacultyModal(false);
                fetchInstitutions(); // Re-fetch institutions to get updated data
            }
        } catch (error) {
            console.error('Error adding faculty:', error);
            alert('Failed to add faculty. Please try again.');
        }
    };

    const handleAddCourse = async () => {
        if (!courseName || !selectedFaculty || !selectedInstitution) {
            alert('Please fill in all fields.');
            return;
        }

        if (isDuplicateCourse(courseName)) {
            alert('This course already exists for the selected faculty.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8081/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: courseName,
                    facultyId: selectedFaculty,
                    institutionId: selectedInstitution,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            alert('Course added:', data);

            setShowAddCourseModal(false);
            setCourseName('');
            setSelectedInstitution('');
            setSelectedFaculty('');
            fetchInstitutions(); // Re-fetch institutions to get updated data
        } catch (error) {
            console.error('Error adding course:', error);
            alert('Failed to add course. Please try again.');
        }
    };

    const handleDeleteInstitution = async (institutionId) => {
        if (window.confirm("Are you sure you want to delete this institution? This action cannot be undone.")) {
            try {
                await axios.delete(`http://localhost:8081/institutions/${institutionId}`);
                alert('Institution deleted:', institutionId);
                fetchInstitutions();
                setShowDeleteInstitutionModal(false);
            } catch (error) {
                console.error('Error deleting institution:', error);
                alert('Failed to delete institution. Please try again.');
            }
        }
    };

    const handlePublishAdmissions = async () => {
        if (!institutionToPublish) {
            alert('Please select an institution to publish admissions.');
            return;
        }

        try {
            const response = await axios.post(`http://localhost:8081/publishAdmissions`, {
                institutionId: institutionToPublish,
            });

            if (response.status === 200) {
                alert(`Admissions published for institution ID: ${institutionToPublish}`);
                setShowPublishAdmissionsModal(false);
            } else {
                alert('Failed to publish admissions. Please try again.');
            }
        } catch (error) {
            console.error('Error publishing admissions:', error);
            alert('An error occurred while publishing admissions.');
        }
    };

    const handleLogout = () => {
        alert('You have been logged out.');
        navigate('/login');
    };

    const handleProfileUpdate = () => {
        console.log('Profile updated successfully');
        setShowProfileModal(false);
    };

    const closeModal = (setShowModal) => {
        setShowModal(false);
    };

    return (
        <div className="admin-page">
            <h1>Admin Panel</h1>
            <div className="admin-buttons">
                <div className="button-container">
                    <button className="admin-button" onClick={() => setShowAddInstitutionModal(true)}>Add Institution</button>
                    <button className="admin-button" onClick={() => setShowAddFacultyModal(true)}>Add Faculty</button>
                    <button className="admin-button" onClick={() => setShowAddCourseModal(true)}>Add Course</button>
                    <button className="admin-button" onClick={() => setShowDeleteInstitutionModal(true)}>Delete Institution</button>
                    <button className="admin-button" onClick={() => setShowPublishAdmissionsModal(true)}>Publish Admissions</button>
                    <button className="admin-button" onClick={() => setShowProfileModal(true)}>Profile</button>
                    <button className="admin-button logout-button" onClick={handleLogout}>Logout</button>
                </div>
            </div>

            {/* Institutions with their respective faculties and courses */}
            <div className="institution-faculty-course-list">
                <h2>Available Institutions, Faculties, and Courses</h2>
                {institutions.map((institution) => (
                    <div key={institution.id} className="institution">
                        <h3>{institution.name}</h3>
                        <p>Number of Students: {institution.number_of_students}</p>
                        <p>Number of Departments: {institution.number_of_departments}</p>
                        <p>Number of Courses Offered: {institution.number_of_courses}</p>

                        <h4>Faculties:</h4>
                        <ul>
                            {institution.faculties && institution.faculties.map(faculty => (
                                <li key={faculty.id}>
                                    {faculty.name}
                                    <h5>Courses:</h5>
                                    <ul>
                                        {faculty.courses && faculty.courses.map(course => (
                                            <li key={course.id}>{course.name}</li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Modal for Adding Institution */}
            {showAddInstitutionModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => closeModal(setShowAddInstitutionModal)}>×</span>
                        <h2>Add Higher Learning Institution</h2>
                        <form onSubmit={(e) => { e.preventDefault(); handleAddInstitution(); }}>
                            <input
                                type="text"
                                value={institutionName}
                                onChange={(e) => setInstitutionName(e.target.value)}
                                placeholder="Institution Name"
                                required
                            />
                            <input
                                type="number"
                                value={numberOfStudents}
                                onChange={(e) => setNumberOfStudents(e.target.value)}
                                placeholder="Number of Students"
                                required
                            />
                            <input
                                type="number"
                                value={numberOfDepartments}
                                onChange={(e) => setNumberOfDepartments(e.target.value)}
                                placeholder="Number of Departments"
                                required
                            />
                            <input
                                type="number"
                                value={numberOfCourses}
                                onChange={(e) => setNumberOfCourses(e.target.value)}
                                placeholder="Number of Courses"
                                required
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        setUniversityLogo(e.target.files[0]);
                                    }
                                }}
                                required
                            />
                            <button type="submit">Submit</button>
                            <button type="button" className="back" onClick={() => closeModal(setShowAddInstitutionModal)}>Back</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Adding Faculty */}
            {showAddFacultyModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => closeModal(setShowAddFacultyModal)}>×</span>
                        <h2>Add Faculty</h2>
                        <form onSubmit={handleAddFaculty}>
                            <input
                                type="text"
                                value={facultyName}
                                onChange={(e) => setFacultyName(e.target.value)}
                                placeholder="Faculty Name"
                                required
                            />
                            <select
                                value={selectedInstitution}
                                onChange={(e) => setSelectedInstitution(e.target.value)}
                                required
                            >
                               <option value="">Select Institution</option>
                               {institutions.map((institution) => (
                                    <option key={institution.id} value={institution.id}>{institution.name}</option>
                                ))}
                            </select>
                            <button type="submit">Submit</button>
                            <button type="button" className="back" onClick={() => closeModal(setShowAddFacultyModal)}>Back</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Adding Course */}
            {showAddCourseModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => closeModal(setShowAddCourseModal)}>×</span>
                        <h2>Add Course</h2>
                        <form onSubmit={(e) => { e.preventDefault(); handleAddCourse(); }}>
                            <input
                                type="text"
                                value={courseName}
                                onChange={(e) => setCourseName(e.target.value)}
                                placeholder="Course Name"
                                required
                            />
                            <select
                                value={selectedFaculty}
                                onChange={(e) => setSelectedFaculty(e.target.value)}
                                required
                            >
                                <option value="">Select Faculty</option>
                                {institutions.find(inst => inst.id === selectedInstitution)?.faculties.map((faculty) => (
                                    <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                                ))}
                            </select>
                            <select
                                value={selectedInstitution}
                                onChange={(e) => setSelectedInstitution(e.target.value)}
                                required
                            >
                                <option value="">Select Institution</option>
                                {institutions.map((institution) => (
                                    <option key={institution.id} value={institution.id}>{institution.name}</option>
                                ))}
                            </select>
                            <button type="submit">Submit</button>
                            <button type="button" className="back" onClick={() => closeModal(setShowAddCourseModal)}>Back</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Deleting Institution */}
            {showDeleteInstitutionModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => closeModal(setShowDeleteInstitutionModal)}>×</span>
                        <h2>Delete Institution</h2>
                        <select
                            value={institutionToDelete}
                            onChange={(e) => setInstitutionToDelete(e.target.value)}
                        >
                            <option value="">Select Institution</option>
                            {institutions.map((institution) => (
                                <option key={institution.id} value={institution.id}>{institution.name}</option>
                            ))}
                        </select>
                        <button onClick={() => handleDeleteInstitution(institutionToDelete)}>
                            Delete
                        </button>
                        <button type="button" className="back" onClick={() => closeModal(setShowDeleteInstitutionModal)}>Back</button>
                    </div>
                </div>
            )}

            {/* Modal for Publishing Admissions */}
            {showPublishAdmissionsModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => closeModal(setShowPublishAdmissionsModal)}>×</span>
                        <h2>Publish Admissions</h2>
                        <select
                            value={institutionToPublish}
                            onChange={(e) => setInstitutionToPublish(e.target.value)}
                        >
                            <option value="">Select Institution</option>
                            {institutions.map((institution) => (
                                <option key={institution.id} value={institution.id}>{institution.name}</option>
                            ))}
                        </select>
                        <button onClick={handlePublishAdmissions}>Publish Admissions</button>
                        <button type="button" className="back" onClick={() => closeModal(setShowPublishAdmissionsModal)}>Back</button>
                    </div>
                </div>
            )}

            {/* Modal for Profile */}
            {showProfileModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => closeModal(setShowProfileModal)}>×</span>
                        <h2>Update Profile</h2>
                        <form onSubmit={(e) => { e.preventDefault(); handleProfileUpdate(); }}>
                            <input
                                type="text"
                                value={profileDetails.name}
                                onChange={(e) => setProfileDetails({ ...profileDetails, name: e.target.value })}
                                placeholder="Name"
                                required
                            />
                            <input
                                type="email"
                                value={profileDetails.email}
                                onChange={(e) => setProfileDetails({ ...profileDetails, email: e.target.value })}
                                placeholder="Email"
                                required
                            />
                            <input
                                type="tel"
                                value={profileDetails.phone}
                                onChange={(e) => setProfileDetails({ ...profileDetails, phone: e.target.value })}
                                placeholder="Phone"
                                required
                            />
                            <button type="submit">Save Changes</button>
                            <button type="button" className="back" onClick={() => closeModal(setShowProfileModal)}>Back</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Admin;