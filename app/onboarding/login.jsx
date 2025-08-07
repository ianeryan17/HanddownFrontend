import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../usercontext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';

const Login = ({ navigateTo }) => {
  const { setUserId } = useUser();
  const [emailText, setEmailText] = useState(''); // State to store the input value
  const [passwordText, setPasswordText] = useState(''); // State to store the input value
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [isLoading, setIsLoading] = useState(false); // State to track loading status
  const passwordInputRef = useRef();

  const handleLogin = async () => {
    // Basic validation
    if (!emailText || !passwordText) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    
    try {
      // Create form data for the API call
      const formData = new FormData();
      formData.append('email', emailText);
      formData.append('password', passwordText);
      
      // Use the same IP address as in signup
      
      console.log("Sending login form data: ", formData); // Log to verify the data
      
      // Make the API call to your backend
      const response = await fetch(`${config.baseUrl}/login/login/`, {
        method: 'POST',
        body: formData,
      });
      
      console.log("Response Status:", response.status); // Log response status
      console.log("Response Headers:", response.headers); // Log headers
      
      const data = await response.json();
      console.log("Server Response:", data); // Print response to console
      
      if (response.ok) {
        // Login successful
        console.log('Login successful:', data);
        
        // Store the user ID in the global context
        const userId = data.uid;
        console.log("userId from login response: ", userId);
        setUserId(userId);
        
        // Store the user ID in AsyncStorage for persistence
        await AsyncStorage.setItem('userId', userId);
        console.log("userId stored in AsyncStorage: ", userId);
        
        // Navigate to the Main screen
        navigateTo('Main');
      } else {
        // Login failed
        Alert.alert('Login Failed', data.detail || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.whiteBackground}>

        {/* Header */}
        <View style={styles.logo}>
          <Text style={styles.logoText}>Welcome Back to Handdown!</Text>
        </View>

        <View style={styles.content}>
          {/* Top Half Content */}
          <View style={styles.topHalfContent}>
            <TextInput
              style={styles.inputBoxes}
              placeholder="Email"
              placeholderTextColor= '#737373'
              value={emailText}
              onChangeText={(text) => setEmailText(text)}
              keyboardType='email-address'
              autoCapitalize='none'
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current.focus()}
            />
            <View style={styles.passwordContainer}>
              <TextInput
                ref={passwordInputRef}
                style={[styles.inputBoxes, { flex: 1, marginBottom: 0 }]}
                placeholder="Password"
                placeholderTextColor= '#737373'
                value={passwordText}
                onChangeText={setPasswordText}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity 
                style={styles.showHideButton} 
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye" : "eye-off"} 
                  size={24} 
                  color="#2aa4eb" 
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.disabledButton]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginText}>{isLoading ? 'Logging in...' : 'Login'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.forgetPasswordButton} 
              onPress={() => navigateTo('ForgetPassword')}
            >
              <Text style={styles.forgetPasswordText}>Forgot your password?</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Half Content */}
          <View style={styles.bottomHalfContent}>

            <TouchableOpacity 
              style={styles.signUpButton} 
              onPress={() => navigateTo('SignUp')}
            >
              <Text style={styles.signUpText}>First Time User? Click Here to Sign Up</Text>
            </TouchableOpacity>

          </View>
        </View>
        
      </View>
    </SafeAreaView>
  );
};

export default Login;

// white: '#ffffff'
// blue: '#2aa4eb'
// brown: '#846425'
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  whiteBackground: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  logo: {
    marginTop: 130,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#2aa4eb',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'work_sans',
  },
  content: {
    flex: 1,
    alignItems: 'left',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  topHalfContent: {
    flex: 1, // Each half takes up half the height of the parent
    alignItems: 'left', // Center content horizontally
    width: '100%', // Ensure it stretches the full width'
    marginTop: 50,
  },
  inputBoxes: {
    height: 40,
    width: '100%',
    borderColor: '#000',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 50,
    marginBottom: 16,
    fontFamily: 'work_sans',
    fontSize: 20,
  },
  loginButton: {
    backgroundColor: '#846425',
    borderColor: '#846425',
    borderWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 5,
    width: '100%',
  },
  disabledButton: {
    backgroundColor: '#a88a5a',
    opacity: 0.7,
  },
  loginText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'work_sans'
  },
  forgetPasswordButton: {
    backgroundColor: 'transparent',
    marginTop: 20,
  },
  forgetPasswordText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2aa4eb',
    marginBottom: 20,
    textAlign: 'left',
    fontFamily: 'work_sans'
  },
  bottomHalfContent: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
  },
  signUpButton: {
    backgroundColor: '#2aa4eb',
    borderColor: '#2aa4eb',
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
  },
  signUpText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'work_sans'
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    position: 'relative',
  },
  showHideButton: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
