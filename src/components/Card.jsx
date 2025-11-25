import React from 'react';

export const Card = ({ children, className = '' }) => {
    return (
        <div className={`glass-panel ${className}`} style={{ padding: 'var(--spacing-lg)' }}>
            {children}
        </div>
    );
};
