import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../usercontext';
import config from '../config';

const EmailAuth = ({ navigateTo }) => {
  const { setUserId } = useUser();
  const [authChars, setAuthChars] = useState (["", "", "", "", "", ""])
  const inputRefs = useRef([]);

  const handleAddChar = (text, index) => {
    if (text.length > 1) text = text.charAt(0); // Only allow one character
    const newAuthChars = [...authChars];
    newAuthChars[index] = text;
    setAuthChars(newAuthChars);

    if (text && index < authChars.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleDeletePress = (event, index) => {
    if (event.nativeEvent.key === 'Backspace' && !authChars[index] && index > 0) {
      // Move to the previous input field when deleting an empty box
      inputRefs.current[index - 1]?.focus();
    }
  };  

  const handleEmailAuth = async () => {
    // Check that all character boxes are filled
    if (authChars.some(char => char === "")) {
      alert("Please fill in all code fields.");
      return;
    }
  
    // Construct the verification code from input fields
    const verificationCode = authChars.join("");
    console.log("verification code:", verificationCode);
  
    // Make API call to verify the code
    try {
      const response = await fetch(`${config.baseUrl}/onboarding/code-entry/${verificationCode}`);
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.detail || "Verification failed");
      }
  
      console.log("Verification successful:", data);
      console.log("userId from data: ", data[1]);
      const userId = data[1];
      setUserId(userId);
      console.log("userId: ", userId);
      navigateTo('UserInfo'); // Navigate to next step after successful verification
    } catch (error) {
      alert(error.message);
      console.error("Error verifying code:", error);
    }
  };
  

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.background}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigateTo('SignUp')} // Assuming 'Login' is the screen to navigate back to
        >
          <Ionicons name="arrow-back" size={24} color="#2aa4eb" />
        </TouchableOpacity>
        
        <View style={styles.content}>
          <View style={styles.topHalfContent}>
            <Text style={styles.descriptionText}>In order to maintain a closed Tufts community here on Handdown, we’ve sent a code to the Tufts email you used to sign up. Enter the code below to continue the signup process.</Text>

            <View style={styles.subtitle}>
              <Text style={styles.subtitleText}>Code</Text>
            </View>

            <View style={styles.container}>
              {authChars.map((authChar, index) => (
                <TextInput
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  style={styles.inputBox}
                  value={authChar}
                  onChangeText={(text) => handleAddChar(text, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  textAlign="center"
                  autoFocus={index === 0}
                  onKeyPress={(event) => handleDeletePress(event, index)}
                />
              ))}
            </View>

            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={handleEmailAuth}
            >
              <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomHalfContent}> 
          </View>
        </View>
      
      </View>
    </SafeAreaView>
  );
};

export default EmailAuth;

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
  backButton: {
    height: 50,
    marginTop: 10,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'left',
    paddingHorizontal: 20,
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
    marginTop: 65,
  },
  descriptionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2aa4eb',
    marginBottom: 65,
    textAlign: 'left',
    fontFamily: 'work_sans'
  },
  subtitle: {
    backgroundColor: '#fffff',
    justifyContent: 'left',
    alignItems: 'left',
  },
  subtitleText: {
    color: '#2aa4eb',
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: 'work_sans'
  },
  container: {
    flexDirection: 'row', // Arrange inputs horizontally
    justifyContent: 'center', // Center them in the middle
    alignItems: 'center', // Align vertically in center
    marginTop: 10, // Adjust for vertical positioning
  },
  inputBox: {
    width: 50, // Square size
    height: 50, // Square size
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    fontSize: 20,
    marginHorizontal: 5, // Space between boxes
    backgroundColor: '#fff',
    fontFamily: 'work_sans'
  },
  continueButton: {
    backgroundColor: '#846425',
    borderColor: '#ffffff',
    borderWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  continueText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'work_sans'
  },
  bottomHalfContent: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    marginBottom: 25,
  },
});