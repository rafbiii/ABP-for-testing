import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../common/Navbar/Navbar';
import { initializeTheme } from '../../../services/themeUtils';
import { getAllUsers } from '../../../services/ViewUserService';
import './ViewUsers.css';

const ViewUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    initializeTheme();
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const data = await getAllUsers(token);

      if (data.confirmation === 'token invalid') {
        localStorage.removeItem('token');
        navigate('/login');
      } else if (data.confirmation === 'not admin') {
        navigate('/main');
      } else if (data.confirmation === 'backend error') {
        setLoading(false);
      } else if (data.confirmation === 'successful') {
        setUsers(data.users);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Navbar showBack={true} showAccount={true} />
      <div className="view-users-container">
        <div className="view-users-header">
          <h1>User Management</h1>
        </div>

        <div className="users-table-wrapper">
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              No users found
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Total Reports</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.user_id}>
                    <td>{user.user_id}</td>
                    <td>{user.username}</td>
                    <td>{user.fullname}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge badge-${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.report_count}</td>
                    <td>
                      <button
                        className="btn-action btn-view"
                        onClick={() => {
                          localStorage.setItem('view_user_email', user.email);
                          localStorage.setItem('view_user_id', user.user_id);
                          navigate("/admin/user/" + user.user_id);
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default ViewUsers;