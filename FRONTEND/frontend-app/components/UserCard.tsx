import React, { ReactNode } from 'react';
import { User, UserRole } from '@/lib/types';

type UserCardProps = {
  user: User;
  showRole?: boolean;
  showContact?: boolean;
  className?: string;
  additionalContent?: ReactNode;
};

const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  showRole = true, 
  showContact = true,
  className = '',
  additionalContent
}) => {
  // Map backend role values to display labels
  const getRoleLabel = (role?: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrator';
      case UserRole.AGENT:
        return 'Real Estate Agent';
      case UserRole.USER:
      default:
        return 'User';
    }
  };

  return (
    <div className={`border p-4 rounded shadow-md ${className}`}>
      <h2 className="text-lg font-bold">{user.name}</h2>
      
      {showRole && (
        <div className="flex items-center mt-1">
          <span className="text-sm text-gray-600 mr-2">Role:</span>
          <span className={`text-sm px-2 py-1 rounded ${
            user.role === UserRole.ADMIN 
              ? 'bg-red-100 text-red-800' 
              : user.role === UserRole.AGENT 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800'
          }`}>
            {getRoleLabel(user.role)}
          </span>
        </div>
      )}
      
      {showContact && (
        <p className="text-sm text-gray-600 mt-1">Contact: {user.email}</p>
      )}

      {additionalContent && (
        <div className="mt-3">
          {additionalContent}
        </div>
      )}
    </div>
  );
};

export default UserCard;