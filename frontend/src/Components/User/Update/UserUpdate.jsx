import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserUpdate.css';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '@/Redux/Slices/userSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UpdateProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.user);

  console.log("Current user state:", user);

  const userId = user?.id;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  
  const [originalData, setOriginalData] = useState({ name: '', email: '', mobile: '', image: '' });

  useEffect(() => {
    if (!userId) {
      console.log("No user ID found");
      setErrors({ form: 'User not logged in or data missing' });
      toast.error('User not logged in or data missing');
      return;
    }

    const fetchUserData = async () => {
      try {
        const res = await axios.get(`http://localhost:5010/user/${userId}`);
        console.log('Fetched user data:', res.data);
        
        setOriginalData({
          name: res.data.name || '',
          email: res.data.email || '',
          mobile: res.data.mobile || '',
          image: res.data.profileImage || res.data.image || ''
        });

        setName(res.data.name || '');
        setEmail(res.data.email || '');
        setPhone(res.data.mobile || '');

        const fetchedImage = res.data.profileImage || res.data.image;
        if (fetchedImage) {
          const imageUrl = fetchedImage.startsWith('http')
            ? fetchedImage
            : `http://localhost:5010${fetchedImage}`;
          setImagePreview(imageUrl);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setErrors({ form: 'Error fetching user data.' });
        toast.error('Error fetching user data');
      }
    };

    fetchUserData();
  }, [userId, user]);

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!name.trim()) {
      newErrors.name = "Name is required.";
    } else if (name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters.";
    }
    
    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    
    // Phone validation
    if (!phone.trim()) {
      newErrors.phone = "Mobile number is required.";
    } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      newErrors.phone = "Please enter a valid 10-digit mobile number.";
    }
    
    return newErrors;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) { 
      setErrors(prev => ({ ...prev, image: "Image size must be less than 2MB." }));
      toast.error("Image size must be less than 2MB");
      setProfileImage(null);
      return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, image: "Only JPG, JPEG, and PNG images are allowed." }));
      toast.error("Only JPG, JPEG, and PNG images are allowed");
      setProfileImage(null);
      return;
    }
    
    setErrors(prev => ({ ...prev, image: undefined }));
    setProfileImage(file);
    setImagePreview(URL.createObjectURL(file));
    toast.success("Image selected successfully");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors in the form");
      return;
    }

    const hasChanges = 
      name !== originalData.name ||
      email !== originalData.email ||
      phone !== originalData.mobile ||
      (image && image.name !== (originalData.image ? originalData.image.split('/').pop() : '')) ||
      (!image && imagePreview !== originalData.image);

    if (!hasChanges) {
      setErrors({ form: 'No changes made to update.' });
      toast.warning('No changes made to update');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('mobile', phone);
    if (image) formData.append('image', image);

    try {
      // toast.info("Updating profile...");
      
      const response = await axios.put(`http://localhost:5010/user/update/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
  
      if (response.status === 200) {
        console.log("Update successful. Response data:", response.data);
        dispatch(updateUser(response.data.user));
        setShowSuccessAlert(true);
        toast.success("Profile updated successfully!");
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setErrors({ form: 'Failed to update profile.' });
        toast.error('Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = err.response?.data?.message || 'Error updating profile.';
      setErrors({ form: errorMessage });
      toast.error(errorMessage);
    }
  };

  const handleInputChange = (setter, value, field) => {
    setter(value);
    // Clear the specific error when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="update-profile-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="update-profile-title">Update Profile</h1>
      {errors.form && <div className="update-profile-error">{errors.form}</div>}
      {showSuccessAlert && <div className="update-profile-success">Profile updated successfully!</div>}
      <form className="update-profile-form" onSubmit={handleUpdate}>
        <div className="update-profile-form-group">
          <label className="update-profile-label">Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleInputChange(setName, e.target.value, 'name')}
            className={`update-profile-input ${errors.name ? 'input-error' : ''}`}
          />
          {errors.name && <div className="update-profile-error">{errors.name}</div>}
        </div>
        <div className="update-profile-form-group">
          <label className="update-profile-label">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => handleInputChange(setEmail, e.target.value, 'email')}
            className={`update-profile-input ${errors.email ? 'input-error' : ''}`}
          />
          {errors.email && <div className="update-profile-error">{errors.email}</div>}
        </div>
        <div className="update-profile-form-group">
          <label className="update-profile-label">Mobile Number:</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => handleInputChange(setPhone, e.target.value, 'phone')}
            className={`update-profile-input ${errors.phone ? 'input-error' : ''}`}
          />
          {errors.phone && <div className="update-profile-error">{errors.phone}</div>}
        </div>
        <div className="update-profile-form-group">
          <label className="update-profile-label">Profile Image:</label>
          <input 
            type="file" 
            accept="image/jpeg,image/png,image/jpg" 
            onChange={handleImageChange} 
            className={`update-profile-input ${errors.image ? 'input-error' : ''}`} 
          />
          {errors.image && <div className="update-profile-error">{errors.image}</div>}
        </div>
        {imagePreview && <img src={imagePreview} alt="Profile Preview" className="update-profile-image-preview" />}
        <button type="submit" className="update-profile-button">Update Profile</button>
      </form>
    </div>
  );
};

export default UpdateProfile;