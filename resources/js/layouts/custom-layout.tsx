import Navbar from '@/components/home_components/navbar';
import React from 'react';

export default function CustomLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Navbar />
            <div>{children}</div>
        </div>
    );
}
