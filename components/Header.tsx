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
      <div className="cursor-pointer" onClick={handleLogoClick}>
        <div className="horizontal_div">
          <Image
            src="/assets/icons/logo-icon.svg"
            height={32}
            width={162}
            alt="logo"
            className="h-8 w-fit"
          />
          <p className="text-16-semibold">Logout</p>
        </div>
      </div>
      {isAdmin && <p className="text-16-semibold">Admin Dashboard</p>}
    </header>
  );
};

export default Header;
