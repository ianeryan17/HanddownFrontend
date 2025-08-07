import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import config from '../config';

const SignUp = ({ navigateTo }) => {
  const [emailText, setEmailText] = useState(''); // State to store the input value
  const [passwordText, setPasswordText] = useState(''); // State to store the input value
  const [passwordText2, setPasswordText2] = useState(''); // State to store the input value
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [showPassword2, setShowPassword2] = useState(false); // State to toggle confirm password visibility

  const handleSignUp = async () => {
    if (!emailText || !passwordText || !passwordText2) {
      alert("Error", "All fields are required.");
      return;
    }
    
    if (passwordText !== passwordText2) {
      alert("Error", "Passwords do not match.");
      return;
    }

    const formData = new FormData();
    formData.append('email', emailText);
    formData.append('password', passwordText);

    console.log("handleSignUp called");
  
    // Print the JSON before sending it
    try {
      console.log("Sending form data: ", formData); // Log to verify the data

      console.log("Attempting to send request to:", `${config.baseUrl}/onboarding/email-verification/`);

      const response = await fetch(`${config.baseUrl}/onboarding/email-verification/`, {
        method: 'POST',
        body: formData, // Send the form data instead of JSON
      });

      console.log("Response Status:", response.status); // Log response status
      console.log("Response Headers:", response.headers); // Log headers
      const data = await response.json();
      console.log("Server Response:", data); // Print response to console

      if (response.ok) {
        alert("Success", "Account created successfully!");
        navigateTo('EmailAuth'); // Navigate to login after successful signup
      } else {
        alert("Error", data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      alert("Error", "Failed to connect to the server.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.background}>
       
        {/* Headers */}
        <View style={styles.logo}>
          <Text style={styles.logoText}>Welcome to Handdown!</Text>
        </View>

        <View style={styles.content}>
          {/* Top Half Content */}
          <View style={styles.topHalfContent}>
            <TextInput
            style={styles.inputBoxes}
            placeholder="Email"
            placeholderTextColor= '#737373'
            value={emailText}
            onChangeText={setEmailText} // Updates state as the text changes
            />
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.inputBoxes, { flex: 1, marginBottom: 0 }]}
                placeholder="Password"
                placeholderTextColor= '#737373'
                value={passwordText}
                onChangeText={setPasswordText} // Updates state as the text changes
                secureTextEntry={!showPassword} // Toggle password visibility
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
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.inputBoxes, { flex: 1, marginBottom: 0 }]}
                placeholder="Confirm Password"
                placeholderTextColor= '#737373'
                value={passwordText2}
                onChangeText={setPasswordText2} // Updates state as the text changes
                secureTextEntry={!showPassword2} // Toggle password visibility
              />
              <TouchableOpacity 
                style={styles.showHideButton} 
                onPress={() => setShowPassword2(!showPassword2)}
              >
                <Ionicons 
                  name={showPassword2 ? "eye" : "eye-off"} 
                  size={24} 
                  color="#2aa4eb" 
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.signUpButton} 
              onPress={handleSignUp}
            >
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Half Content */}
          <View style={styles.bottomHalfContent}>
            
            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={() => navigateTo('Login')}
            >
              <Text style={styles.loginText}>Returning User? Click Here to Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      
      </View>
    </SafeAreaView>
  );
};

export default SignUp;

// white: '#ffffff'
// blue: '#2aa4eb'
// brown: '#846425'
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  background: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  logo: {
    marginTop: 150,
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
    flex: 1,
    alignItems: 'left',
    width: '100%',
    marginTop: 30,
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
    fontSize: 20,
    color: '#000000',
    fontFamily: 'work_sans',
  },
  signUpButton: {
    backgroundColor: '#846425',
    borderColor: '#ffffff',
    borderWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 5,
    width: '100%',
  },
  signUpText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'work_sans',
  },
  bottomHalfContent: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
  },
  loginButton: {
    backgroundColor: '#2aa4eb',
    borderColor: '#2aa4eb',
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
  },
  loginText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'work_sans',
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
  showHideText: {
    color: '#2aa4eb',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'work_sans',
  },
});
