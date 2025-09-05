import Navbar from '@/components/home_components/navbar';
import React from 'react';

export default function CustomLayout({ children, isLoggedIn }: { children: React.ReactNode; isLoggedIn: boolean }) {
    return (
        <div>
            <Navbar isLoggedIn={isLoggedIn} />
            <div>{children}</div>
        </div>
    );
}
