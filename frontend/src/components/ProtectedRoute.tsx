import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPermission }) => {
  const { user, loading, isExpired } = useAuth();

  if (loading) return <div className="loading-overlay">Carregando...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se a empresa está com licença vencida, só deixa acessar se for pra pagar (Configurações)
  // Ou mostra um aviso global (implementaremos isso no layout)
  
  if (requiredPermission) {
    const permissions = user.permissions ? user.permissions.split(',') : [];
    if (!permissions.includes(requiredPermission) && user.role !== 'OWNER') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
