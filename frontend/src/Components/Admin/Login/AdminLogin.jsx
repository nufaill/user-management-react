import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { addAdmin } from "@/Redux/Slices/AdminSlice";
import './AdminLogin.css'; // Import your CSS file for custom styles
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa'; // Import icons

function AdminLogin() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        
        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Please enter a valid email";
        }
        
        if (!password.trim()) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }
        
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }
        
        setLoading(true);
    
        try {
            console.log("Sending login request with:", { email, password });
            const response = await axios.post(
                "http://localhost:5010/admin/login", 
                { email, password }, 
                { 
                  withCredentials: true,
                  headers: {
                    'Content-Type': 'application/json'
                  }
                }
              );
    
            if (response.data && response.data.name) {
                dispatch(addAdmin({
                    admin: {
                        _id: response.data._id,
                        name: response.data.name,
                        email: response.data.email,
                        image: response.data.image,
                        mobile: response.data.mobile
                    },
                    token: response.data.token
                }));
                
                console.log("Full login response:", response);
                console.log("Response data:", response.data);

                toast.success(`Welcome back, ${response.data.name}!`);
    
                setTimeout(() => {
                    navigate("/admin/home");
                }, 2000);                
            } else {
                toast.error('Login failed: Invalid Credentials');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Invalid credentials, please try again';
            console.error("Login error details:", err);
            console.error("Response data:", err.response?.data);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (setter, value, field) => {
        setter(value);
        if (errors[field]) {
            setErrors({...errors, [field]: null});
        }
    };

    return (
        
            <div className="admin-login-container">
                <ToastContainer
                    position="top-right"
                    autoClose={5010}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                />
                
                <div className="admin-login-box">
                    <div className="admin-login-header">
                        <h1>Admin Login System</h1>
                        <div className="admin-login-logo">
                            <div className="admin-logo-circle">
                                <FaUser size={30} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="admin-login-content">
                        <h2>Sign In</h2>
                        <p className="admin-login-subtitle">Access your admin dashboard</p>
                        
                        <form onSubmit={handleSubmit} method="POST" className="admin-login-form">
                            <div className="admin-form-group">
                                <div className="admin-input-icon">
                                    <FaUser />
                                </div>
                                <input
                                    type="email"
                                    className={`admin-input ${errors.email ? 'admin-input-error' : ''}`}
                                    name="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => handleInputChange(setEmail, e.target.value, 'email')}
                                    required
                                    autoFocus
                                />
                                {errors.email && <div className="admin-error-message">{errors.email}</div>}
                            </div>
                            
                            <div className="admin-form-group">
                                <div className="admin-input-icon">
                                    <FaLock />
                                </div>
                                <input
                                    type="password"
                                    className={`admin-input ${errors.password ? 'admin-input-error' : ''}`}
                                    name="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => handleInputChange(setPassword, e.target.value, 'password')}
                                    required
                                />
                                {errors.password && <div className="admin-error-message">{errors.password}</div>}
                            </div>
                            
                            <div className="admin-form-options">
                                <div className="admin-remember-me">
                                    <input type="checkbox" id="remember-me" />
                                    <label htmlFor="remember-me">Remember me</label>
                                </div>
                                <a href="#" className="admin-forgot-password">Forgot Password?</a>
                            </div>
                            
                            <button className="admin-login-button" type="submit" disabled={loading}>
                                {loading ? (
                                    <span className="admin-loading-spinner"></span>
                                ) : (
                                    <>
                                        <span>Login</span>
                                        <FaSignInAlt className="admin-button-icon" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                    
                    <div className="admin-login-footer">
                        <p>&copy; {new Date().getFullYear()} Admin Dashboard. All rights reserved.</p>
                    </div>
                </div>
            </div>
      
    );
}

export default AdminLogin;