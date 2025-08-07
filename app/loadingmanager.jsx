import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from './usercontext';

const LoadingManager = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { userId, setUserId } = useUser();

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // Check if we have a stored user ID
      const storedUserId = await AsyncStorage.getItem('userId');
      
      if (storedUserId) {
        // If we have a stored user ID, set it in the context
        setUserId(storedUserId);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#846425" />
      </View>
    );
  }

  // If we have a userId, show the main app
  if (userId) {
    return React.Children.map(children, child => {
      if (React.isValidElement(child) && child.props.navigateTo) {
        return React.cloneElement(child, {
          navigateTo: (screen) => {
            if (screen === 'Main') {
              child.props.navigateTo(screen);
            }
          }
        });
      }
      return child;
    });
  }

  // If no userId, show the auth screens
  return children;
};

export default LoadingManager; 