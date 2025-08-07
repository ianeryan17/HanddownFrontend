import React, { use, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Using Ionicons as an example
import { useUser } from '../usercontext'; // Import the context hook
import config from '../config';

const UserInfo = ({ navigateTo }) => {
  const { userId } = useUser();
  console.log("User ID received from global context:", userId); // Debugging

  const [firstName, setFirstName] = useState(''); // State to store the input value
  const [lastName, setLastName] = useState(''); // State to store the input value
  const [tuftsID, setTuftsID] = useState(''); // State to store the input value

  const handleUserInfo = async () => {
    if (!firstName || !lastName || !tuftsID) {
      alert("Error", "All fields are required.");
      return;
    }

    const requestBody = {
      fname: firstName,
      lname: lastName,
      tuftsid: tuftsID
    };

    console.log("handleUserInfo called");

    try {
      console.log("userid:", userId)
      console.log("Sending body request: ", requestBody); // Log to verify the data

      const response = await fetch(`${config.baseUrl}/onboarding/basic-info/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response Status:", response.status); // Log response status
      // console.log("Response Headers:", response.headers); // Log headers
      const data = await response.json();
      console.log("Server Response:", data); // Print response to console

      if (!response.ok) {
        throw new Error(data.detail || "Adding user info failed");
      }

      // if (response.ok) {
      // userId = data.uid;
      // console.log("newUserId: ", userId);
      alert("Success", "Account created successfully!");
      navigateTo('UserPhoto');
      // } else {
      //   alert("Error", data.message || "Something went wrong.");
      // }
    } catch (error) {
      console.error("Error during signup:", error);
      alert("Error", "Failed to connect to the server.");
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.background}>
       
        {/* Headers */}
        <TouchableOpacity //temporary for testing
          style={styles.backButton} 
          onPress={() => navigateTo('EmailAuth')} 
        >
          {/* Use the Ionicons back arrow icon */}
          <Ionicons name="arrow-back" size={24} color="#2aa4eb" />
        </TouchableOpacity>
        
        <View style={styles.logo}>
          <Text style={styles.logoText}>Welcome to the Handdown Community!</Text>
        </View>

        <Text style={styles.descriptionText}>Enter your information to begin building your handdown profile.</Text>

        <View style={styles.content}>
          {/* Top Half Content */}
          <View style={styles.topHalfContent}>
            <TextInput
            style={styles.inputBoxes}
            placeholder="First Name"
            placeholderTextColor= '#737373'
            value={firstName}
            onChangeText={setFirstName} // Updates state as the text changes
            />
            <TextInput
            style={styles.inputBoxes}
            placeholder="Last Name"
            placeholderTextColor= '#737373'
            value={lastName}
            onChangeText={setLastName} // Updates state as the text changes
            />
            <TextInput
            style={styles.inputBoxes}
            placeholder="Tufts ID"
            placeholderTextColor= '#737373'
            value={tuftsID}
            onChangeText={setTuftsID} // Updates state as the text changes
            />
            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={handleUserInfo}
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

export default UserInfo;

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
    paddingHorizontal: 20,
  },
  logo: {
    marginTop: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#2aa4eb',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'work_sans'
  },
  descriptionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2aa4eb',
    marginTop: 25,
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
    marginTop: 35,
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
    color: '#000000',
  },
  continueButton: {
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
    marginBottom: 40,
  },
});
