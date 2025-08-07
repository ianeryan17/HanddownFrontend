import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Using Ionicons as an example

const ForgetPassword = ({ navigateTo }) => {
  const [emailText, setEmailText] = useState(''); // State to store the input value

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.background}>
        {/* Header */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigateTo('Login')}
        >
          {/* Use the Ionicons back arrow icon */}
          <Ionicons name="arrow-back" size={24} color="#2aa4eb" />
        </TouchableOpacity>

        <View style={styles.title}>
          <Text style={styles.titleText}>Forgot your Password?</Text>
        </View>
        
        <View style={styles.content}>
          {/* Top Half Content */}
          <View style={styles.topHalfContent}>
            <Text style={styles.descriptionText}>Enter the email address associated with your account, and we'll send you a code to reset your password.</Text>
            <TextInput
            style={styles.inputBoxes}
            placeholder="Email"
            placeholderTextColor= '#737373'
            value={emailText}
            onChangeText={setEmailText} // Updates state as the text changes
            />
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => navigateTo('ResetEmailAuth')}
            >
              <Text style={styles.resetText}>Send Reset Email</Text>
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

export default ForgetPassword;

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
  title: {
    marginTop: 90,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'left',
    alignItems: 'left',
  },
  titleText: {
    color: '#2aa4eb',
    fontSize: 30,
    fontWeight: 'bold',
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
    marginTop: 20,
  },
  descriptionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2aa4eb',
    marginBottom: 20,
    textAlign: 'left',
    fontFamily: 'work_sans',
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
    fontFamily: 'work_sans',
    fontSize: 20,
  },
  resetButton: {
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
  resetText: {
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
    marginBottom: 25,
  },
});