import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Using Ionicons as an example

const ResetPassword = ({ navigateTo }) => {
  const [firstName, setFirstName] = useState(''); // State to store the input value
  const [lastName, setLastName] = useState(''); // State to store the input value
  const [tuftsID, setTuftsID] = useState(''); // State to store the input value

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.background}>
       
        {/* Headers */}
        <TouchableOpacity //temporary for testing
          style={styles.backButton} 
          onPress={() => navigateTo('ResetEmailAuth')} 
        >
          {/* Use the Ionicons back arrow icon */}
          <Ionicons name="arrow-back" size={24} color="#2aa4eb" />
        </TouchableOpacity>
        
        <View style={styles.logo}>
          <Text style={styles.logoText}>Reset your Password</Text>
        </View>

        <View style={styles.content}>
          {/* Top Half Content */}
          <View style={styles.topHalfContent}>
            <TextInput
            style={styles.inputBoxes}
            placeholder="New Password"
            placeholderTextColor= '#737373'
            value={firstName}
            onChangeText={setFirstName} // Updates state as the text changes
            />
            <TextInput
            style={styles.inputBoxes}
            placeholder="Confirm Password"
            placeholderTextColor= '#737373'
            value={lastName}
            onChangeText={setLastName} // Updates state as the text changes
            />
            <TouchableOpacity 
              style={styles.signUpButton} 
              onPress={() => navigateTo('Login')}
            >
              <Text style={styles.signUpText}>Return to Login</Text>
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

export default ResetPassword;

// white: '#ffffff'
// blue: '#2aa4eb'
// brown: '#846425'
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff', // Same background color for the safe area
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
  logo: {
    marginTop: 100,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'left',
    paddingHorizontal: 20,
  },
  logoText: {
    color: '#2aa4eb',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'left',
    fontFamily: 'work_sans'
  },
  descriptionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2aa4eb',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'left',
    paddingHorizontal: 20,
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
    width: '100%', // Ensure it stretches the full width
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
    paddingVertical: 23,
    marginBottom: 16,
    fontFamily: 'work_sans'
  },
  signUpButton: {
    backgroundColor: '#846425',
    borderColor: '#ffffff',
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  signUpText: {
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
    marginBottom: 40,
  },
  loginButton: {
    backgroundColor: '#ffffff',
    borderColor: '#000',
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
  },
  loginText: {
    color: '#2aa4eb',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'work_sans'
  },
});
