import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

// Define user type
interface User {
  id: string;
  email: string;
  name: string;
  hasCompletedProfileSetup?: boolean;
}

// Define context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  markProfileSetupComplete: () => Promise<void>;
  isProfileSetupComplete: boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  markProfileSetupComplete: async () => {},
  isProfileSetupComplete: false,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileSetupComplete, setIsProfileSetupComplete] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJSON = await SecureStore.getItemAsync('user');
        if (userJSON) {
          const userData = JSON.parse(userJSON);
          setUser(userData);
          setIsProfileSetupComplete(userData.hasCompletedProfileSetup || false);
        }
      } catch (error) {
        console.error('Failed to load user from storage', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Mark profile setup as complete
  const markProfileSetupComplete = async () => {
    try {
      if (user) {
        const updatedUser = { ...user, hasCompletedProfileSetup: true };
        await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsProfileSetupComplete(true);
        console.log('Profile setup marked as complete');
      }
    } catch (error) {
      console.error('Failed to update profile setup status', error);
    }
  };

  // Sign in function - in a real app, this would connect to a backend
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // Mock authentication - replace with actual API call
      // This is just for demonstration purposes
      
      // Check if user exists in storage (for demo purposes)
      const existingUserJSON = await SecureStore.getItemAsync('user');
      let mockUser;
      
      if (existingUserJSON) {
        // If user exists, use stored data including profile setup status
        mockUser = JSON.parse(existingUserJSON);
        if (mockUser.email === email) {
          setUser(mockUser);
          setIsProfileSetupComplete(mockUser.hasCompletedProfileSetup || false);
          return;
        }
      }
      
      // If no matching user, create a new one
      mockUser = {
        id: '123',
        email,
        name: 'Test User',
        hasCompletedProfileSetup: false
      };
      
      // Save user to secure storage
      await SecureStore.setItemAsync('user', JSON.stringify(mockUser));
      setUser(mockUser);
      setIsProfileSetupComplete(false);
    } catch (error) {
      console.error('Sign in failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      // Mock registration - replace with actual API call
      const mockUser = {
        id: '123',
        email,
        name,
        hasCompletedProfileSetup: false
      };
      
      await SecureStore.setItemAsync('user', JSON.stringify(mockUser));
      setUser(mockUser);
      setIsProfileSetupComplete(false);
    } catch (error) {
      console.error('Sign up failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setIsLoading(true);
      // We don't delete the user data from storage to preserve profile setup status
      // Just clear the current session
      setUser(null);
      setIsProfileSetupComplete(false);
    } catch (error) {
      console.error('Sign out failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      signIn, 
      signUp, 
      signOut, 
      markProfileSetupComplete,
      isProfileSetupComplete
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 