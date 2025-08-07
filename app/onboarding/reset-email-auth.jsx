import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ResetEmailAuth = ({ navigateTo }) => {
  const [authChars, setAuthChars] = useState (["", "", "", "", "", ""])

  const handleChangeText = (text, index) => {
    if (text.length > 1) text = text.charAt(0); // Only allow one character
    const newAuthChars = [...authChars];
    newAuthChars[index] = text;
    setAuthChars(newAuthChars);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.background}>
        {/* Header */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigateTo('ForgetPassword')} // Assuming 'Login' is the screen to navigate back to
        >
          {/* Use the Ionicons back arrow icon */}
          <Ionicons name="arrow-back" size={24} color="#2aa4eb" />
        </TouchableOpacity>
        
        <View style={styles.content}>
          {/* Top Half Content */}
          <View style={styles.topHalfContent}>
            <Text style={styles.descriptionText}>We’ve sent a verification code to your email. Enter the code below to confirm your identity and proceed to reset your password.</Text>

            <View style={styles.subtitle}>
              <Text style={styles.subtitleText}>Code</Text>
            </View>

            <View style={styles.container}>
              {authChars.map((authChar, index) => (
                <TextInput
                  key={index}
                  style={styles.inputBox}
                  value={authChar}
                  onChangeText={(text) => handleChangeText(text, index)}
                  keyboardType="numeric" // Adjust as needed
                  maxLength={1} // Limit input to one character
                  textAlign="center"
                />
              ))}
            </View>

            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={() => navigateTo('ResetPassword')}
            >
              <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Half Content */}
          <View style={styles.bottomHalfContent}> 
          </View>
        </View>
      
      </View>
    </SafeAreaView>
  );
};

export default ResetEmailAuth;

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
    marginTop: 30,
  },
  descriptionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2aa4eb',
    marginBottom: 50,
    textAlign: 'left',
    fontFamily: 'work_sans'
  },
  subtitle: {
    backgroundColor: '#ffffff',
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
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 30,
    width: '100%',
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
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