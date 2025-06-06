import { render, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import AuthProvider, { AuthContext } from '../AuthContext';

describe('AuthProvider', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('loads initial user from localStorage', () => {
        const fakeUser = { name: 'Test User', token: 'abc123' };
        localStorage.setItem('user', JSON.stringify(fakeUser));

        let contextValue;
        render(
            <AuthProvider>
                <AuthContext.Consumer>
                    {(value) => {
                        contextValue = value;
                        return null;
                    }}
                </AuthContext.Consumer>
            </AuthProvider>
        );

        expect(contextValue.user).toEqual(fakeUser);
    });

    it('login updates user and localStorage', () => {
        let contextValue;
        render(
            <AuthProvider>
                <AuthContext.Consumer>
                    {(value) => {
                        contextValue = value;
                        return null;
                    }}
                </AuthContext.Consumer>
            </AuthProvider>
        );

        const newUser = { name: 'New User', token: 'def456' };

        act(() => {
            contextValue.login(newUser);
        });

        expect(contextValue.user).toEqual(newUser);
        expect(JSON.parse(localStorage.getItem('user'))).toEqual(newUser);
    });

    it('logout clears user and localStorage', () => {
        const fakeUser = { name: 'User', token: 'tok123' };
        localStorage.setItem('user', JSON.stringify(fakeUser));

        let contextValue;
        render(
            <AuthProvider>
                <AuthContext.Consumer>
                    {(value) => {
                        contextValue = value;
                        return null;
                    }}
                </AuthContext.Consumer>
            </AuthProvider>
        );

        act(() => {
            contextValue.logout();
        });

        expect(contextValue.user).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
    });

    it('updateUser merges user data and updates localStorage', () => {
        const initialUser = { name: 'User', token: 'tok123' };
        localStorage.setItem('user', JSON.stringify(initialUser));

        let contextValue;
        render(
            <AuthProvider>
                <AuthContext.Consumer>
                    {(value) => {
                        contextValue = value;
                        return null;
                    }}
                </AuthContext.Consumer>
            </AuthProvider>
        );

        const update = { name: 'Updated User' };

        act(() => {
            contextValue.updateUser(update);
        });

        expect(contextValue.user).toEqual({ ...initialUser, ...update });
        expect(JSON.parse(localStorage.getItem('user'))).toEqual({ ...initialUser, ...update });
    });
});
