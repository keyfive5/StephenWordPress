'use client';
import React, { useState } from 'react';
import axios from 'axios';
import BASE_URL from '@/utils/api';
import { Alert, Snackbar } from '@mui/material';
import { useSelector } from 'react-redux';

function Page() {
  // ✅ get user + token from Redux store
  const user = useSelector((state) => state.auth);
  const token = user?.token;

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [feedback, setFeedback] = useState({ message: '', success: true, open: false });

  const handlePasswordChange = async () => {
    if (!token) return;

    if (!confirm("Are you sure you want to update your password?")) return;

    try {
      const res = await axios.post(
        `${BASE_URL}/admin/auth/changePassword`,
        {
          currentpassword: currentPassword,
          newpassword: newPassword,
        },
        {
          headers: { 'x-access-token': token },
        }
      );

      if (res.data.success) {
        setCurrentPassword('');
        setNewPassword('');
        setFeedback({ message: 'Password changed successfully!', success: true, open: true });
      } else {
        setFeedback({
          message: res.data.message || 'Failed to change password.',
          success: false,
          open: true,
        });
      }
    } catch (err) {
      console.error(err);
      setFeedback({
        message: err?.response?.data?.message || 'Error changing password.',
        success: false,
        open: true,
      });
    }
  };

  if (!user) {
    return (
      <div>
        <h1>Please log in to view your profile.</h1>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20 }}>
      <div
        style={{
          padding: 20,
          maxWidth: 550,
          margin: 'auto',
          borderRadius: 8,
          boxShadow: '0 2px 4px rgba(0,0,0,0.7)',
        }}
      >
        <h1>User Profile</h1>

        {!showPasswordForm ? (
          <>
            <div>
              <p><strong>Name:</strong> {user?.name || 'ADMIN'}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> {user?.role}</p>
            </div>
            <button onClick={() => setShowPasswordForm(true)} className="updateBtn">
              Change Password
            </button>
          </>
        ) : (
          <div style={{ marginTop: 20 }}>
            <h3>Change Password</h3>
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
            />
            <div style={{ marginTop: 10 }}>
              <button onClick={handlePasswordChange} className="updateBtn">
                Submit
              </button>
              <button
                onClick={() => setShowPasswordForm(false)}
                className="canclenbtn"
                style={{ marginLeft: 10 }}
              >
                Cancel
              </button>
            </div>

            <Snackbar
              open={feedback.open}
              autoHideDuration={3000}
              onClose={() => setFeedback({ ...feedback, open: false })}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert severity={feedback.success ? 'success' : 'error'}>
                {feedback.message}
              </Alert>
            </Snackbar>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: 10,
  margin: '10px 0',
  borderRadius: 4,
  border: '1px solid #ccc',
  fontSize: '16px',
};

export default Page;
