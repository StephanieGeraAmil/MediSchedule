'use client';

import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface HeaderProps {
  isAdmin?: boolean;
}
const Header: React.FC<HeaderProps> = ({ isAdmin }) => {
  const { logout } = useAuth();

  const handleLogoClick = async () => {
    await logout();
  };

  return (
    <header className="admin-header">
      {isAdmin && <p className="text-18-bold">Admin Dashboard</p>}
      {!isAdmin && <p></p>}
      <div className="cursor-pointer" onClick={handleLogoClick}>
        <div className="horizontal_div">
          <p className="text-16">Logout</p>
          <Image
            src="/assets/icons/logo-icon.svg"
            height={32}
            width={162}
            alt="logo"
            className="h-8 w-fit"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
