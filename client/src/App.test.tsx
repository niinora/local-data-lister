import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';

test('renders login heading', () => {
    render(
        <GoogleOAuthProvider clientId="test-client-id">
            <App />
        </GoogleOAuthProvider>
    );
    const heading = screen.getByText(/login to local data lister/i);
    expect(heading).toBeInTheDocument();
}); 