import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import "../styles/admin.css"; 

const Institution = () => {
  const navigate = useNavigate(); // Initialize navigate hook
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showViewApplicationsModal, setShowViewApplicationsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [courseName, setCourseName] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [applicationList, setApplicationList] = useState([]);
  
  const [profileDetails, setProfileDetails] = useState({
    name: 'Limkokwing University of Creative Technology',
    email: 'luct@info.ac.ls',
    phone: '123-456-7890',
    profilePicture: 'https://via.placeholder.com/150', 
  });

  const [loggedInUser, setLoggedInUser] = useState({
    firstName: 'John',  // Replace with actual user's name
    lastName: 'Doe',    // Replace with actual user's surname
  });

  const [faculties, setFaculties] = useState([]); 
  const [courses, setCourses] = useState([]); 
  const [profilePicturePreview, setProfilePicturePreview] = useState(profileDetails.profilePicture);
  const [institutions, setInstitutions] = useState([]);

  // Fetch all relevant data for the admin
  const fetchData = async () => {
    await fetchFaculties();
    await fetchCourses();
    await fetchApplications();
    await fetchInstitutions();
  };

  // Fetch faculties from the database
  const fetchFaculties = async () => {
    try {
      const response = await fetch('http://localhost:8081/faculties');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setFaculties(data); 
    } catch (error) {
      console.error('Error fetching faculties:', error);
    }
  };

  // Fetch courses from the database
  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:8081/courses');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setCourses(data); 
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  // Fetch applications from the database
  const fetchApplications = async () => {
    try {
      const response = await fetch('http://localhost:8081/applications');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setApplicationList(data); 
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  // Fetch institutions from the database
  const fetchInstitutions = async () => {
    try {
      const response = await fetch('http://localhost:8081/institutions');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setInstitutions(data); 
    } catch (error) {
      console.error('Error fetching institutions:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); 

  const handleViewApplications = () => {
    setShowViewApplicationsModal(true);
  };

  const handleAddCourse = async () => {
    try {
      const response = await fetch('http://localhost:8081/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: courseName,
          faculty: selectedFaculty, 
          institution: '3', // Replace with actual institution ID
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      alert('Course added:', data);
      await fetchCourses(); // Refresh the courses list
      setShowAddCourseModal(false); 
      setCourseName(''); 
      setSelectedFaculty('');
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Failed to add course. Please try again.');
    }
  };

  const handleProfileUpdate = async () => {
    const { name, email, phone } = profileDetails;
    if (!name || !email || !phone) {
      alert("All fields are required.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8081/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileDetails),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      console.log('Profile updated:', await response.json());
      setShowProfileModal(false);
      setConfirmationMessage('Profile updated successfully.');
      setShowConfirmationModal(true);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // New functions for handling application acceptance or rejection
  const handleAcceptApplication = async (appId) => {
    try {
      const response = await fetch(`http://localhost:8081/applications/${appId}/accept`, {
        method: 'PATCH', // Or whatever method your API expects
      });

      if (!response.ok) throw new Error('Network response was not ok');
      setApplicationList(applicationList.filter(app => app.id !== appId));
      alert(`Accepted application from ${applicationList.find(app => app.id === appId).studentName}`);
    } catch (error) {
      console.error('Error accepting application:', error);
      alert('Failed to accept application. Please try again.');
    }
  };

  const handleRejectApplication = async (appId) => {
    try {
      const response = await fetch(`http://localhost:8081/applications/${appId}/reject`, {
        method: 'PATCH', // Or whatever method your API expects
      });

      if (!response.ok) throw new Error('Network response was not ok');
      setApplicationList(applicationList.filter(app => app.id !== appId));
      alert(`Rejected application from ${applicationList.find(app => app.id === appId).studentName}`);
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Failed to reject application. Please try again.');
    }
  };

  const handleLogout = () => {
    // Logic to log out the user
    alert("Logged out");
    navigate('/login'); // Navigate to the login page
  };

  return (
    <div className="admin-page">
      <h1>Institution Panel</h1>
      <div className="admin-buttons">
        <div className="button-container">
          <button className="admin-button" onClick={() => setShowAddCourseModal(true)}>Add Course</button>
          <button className="admin-button" onClick={handleViewApplications}>View Applications</button>
          <button className="admin-button" onClick={() => setShowProfileModal(true)}>Profile</button>
          <button className="admin-button" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Modal for Adding Course */}
      {showAddCourseModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowAddCourseModal(false)}>×</span>
            <h2>Add Course</h2>
            <form onSubmit={handleAddCourse}>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Course Name"
              />
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
              >
                <option value="">Select Faculty</option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                ))}
              </select>
              <button type="submit">Add Course</button>
              <button type="button" className="back" onClick={() => setShowAddCourseModal(false)}>Back</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Profile Update */}
      {showProfileModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowProfileModal(false)}>×</span>
            <h2>Profile Update</h2>
            <h3>Logged in as: {loggedInUser.firstName} {loggedInUser.lastName}</h3>
            <form>
              <input
                type="text"
                value={profileDetails.name}
                onChange={(e) => setProfileDetails({ ...profileDetails, name: e.target.value })}
                placeholder="Institution Name"
              />
              <input
                type="email"
                value={profileDetails.email}
                onChange={(e) => setProfileDetails({ ...profileDetails, email: e.target.value })}
                placeholder="Email"
              />
              <input
                type="tel"
                value={profileDetails.phone}
                onChange={(e) => setProfileDetails({ ...profileDetails, phone: e.target.value })}
                placeholder="Phone"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
              />
              <img src={profilePicturePreview} alt="Profile" />
              <button type="button" onClick={handleProfileUpdate}>Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Viewing Applications */}
      {showViewApplicationsModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowViewApplicationsModal(false)}>×</span>
            <h2>Applications</h2>
            {applicationList.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Course</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applicationList.map((application) => (
                    <tr key={application.id}>
                      <td>{application.studentName}</td>
                      <td>{application.courseName}</td>
                      <td>{application.status}</td>
                      <td>
                        <button onClick={() => handleAcceptApplication(application.id)}>Accept</button>
                        <button onClick={() => handleRejectApplication(application.id)}>Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No applications available.</p>
            )}
            <button className="back" onClick={() => setShowViewApplicationsModal(false)}>Back</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Institution;