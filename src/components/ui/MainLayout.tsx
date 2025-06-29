'use client'; // 如果是 Next.js app dir 下的 client component

import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import store from '@/store';
import MainContent from './MainContent';

const MainLayout = () => {
    return (
        <Provider store={store}>
            <MainContent />
        </Provider>
    );
};

export default MainLayout;
