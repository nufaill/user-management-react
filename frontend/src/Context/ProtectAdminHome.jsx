import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function ProtectAdminHome({ children }) {
  const { admin } = useSelector((state) => state.admin); 
  if (!admin || !admin.id) { 
    return <Navigate to="/admin" replace />;
  }
  return children; 
}

export default ProtectAdminHome;