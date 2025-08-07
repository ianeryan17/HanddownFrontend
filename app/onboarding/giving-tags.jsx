import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Using Ionicons as an example
import { useUser } from '../usercontext'; // Import the context hook
import config from '../config';

const categories = [
  "Books", "Clothes", "Accessories", "Furniture", "Bedding",
  "Electronics", "Kitchenware", "School Supplies", 
  "Home Decor", "Formalwear", "Costumes", "Sports Equipment", 
   "Outdoor", "Housing", "Groceries", "Arts & Craft", "Transportation"
];

const GivingTags = ({navigateTo}) => {
  const { userId } = useUser();
  console.log("User ID received from global context:", userId); // Debugging
  const [selectedTags, setSelectedTags] = useState([]);

  const toggleTag = (tag) => {
    setSelectedTags((prevSelected) =>
      prevSelected.includes(tag)
        ? prevSelected.filter((t) => t !== tag) // Remove if already selected
        : [...prevSelected, tag] // Add if not selected
    );
  };

  const handleGivingTags = async () => {
    // const requestBody = selectedTags;
    const tagString = selectedTags.join("%20");

    console.log("handleGivingTags called");

    try {
      console.log("userid:", userId)
      // console.log("Sending body request: ", requestBody); // Log to verify the data

      const response = await fetch(`${config.baseUrl}/onboarding/profile-offerings/${userId}?offerings=${tagString}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify(requestBody),
      });

      console.log("Response Status:", response.status); // Log response status
      // console.log("Response Headers:", response.headers); // Log headers
      const data = await response.json();
      console.log("Server Response:", data); // Print response to console
      // userId = data.uid;

      if (response.ok) {
        alert("Success", "Account created successfully!");
        navigateTo('Main'); 
      } else {
        alert("Error", data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      alert("Error", "Failed to connect to the server.");
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.blueBackground}>
       
        {/* Headers */}
        <TouchableOpacity //temporary for testing
          style={styles.backButton} 
          onPress={() => navigateTo('InterestTags')} 
        >
          {/* Use the Ionicons back arrow icon */}
          <Ionicons name="arrow-back" size={24} color="#2aa4eb" />
        </TouchableOpacity>
        
        <View style={styles.logo}>
          <Text style={styles.logoText}>Add what you have to offer!</Text>
        </View>


        <View style={styles.content}>
          {/* Top Half Content */}
          <View style={styles.topHalfContent}>
            <Text style={styles.descriptionText}>Sharing items you want to pass on helps us match your offerings with interested users and fosters a more connected, sustainable community.</Text>

            <View style={styles.subtitle}>
              <Text style={styles.subtitleText}>Categories</Text>
            </View>

            {/* Category Tag Buttons */}
            <View style={styles.wrapper}>
              <View style={styles.tagsContainer}>
                {categories.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.tagButton,
                      selectedTags.includes(item) && styles.selectedTag
                    ]}
                    onPress={() => toggleTag(item)}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        selectedTags.includes(item) && styles.selectedTagText
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Bottom Half Content */}
          <View style={styles.bottomHalfContent}>
            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={handleGivingTags}
            >
              <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      
      </View>
    </SafeAreaView>
  );
};

export default GivingTags;

// white: '#ffffff'
// blue: '#2aa4eb'
// brown: '#846425'
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff', // Same background color for the safe area
  },
  blueBackground: {
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
    marginTop: 10,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#2aa4eb',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'work_sans'
  },
  content: {
    flex: 1,
    alignItems: 'left',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  topHalfContent: {
    flex: 4,
    alignItems: 'left',
    width: '100%',
    marginTop: 20,
  },
  descriptionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2aa4eb',
    marginBottom: 15,
    textAlign: 'left',
    fontFamily: 'work_sans'
  },
  subtitle: {
    backgroundColor: '#ffffff',
    justifyContent: 'left',
    alignItems: 'left',
    marginTop: 10,
    marginBottom: 15,
  },
  subtitleText: {
    color: '#2aa4eb',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'work_sans'
  },
  wrapper: {
    width: '100%',
    paddingHorizontal: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Wrap tags into new lines
    justifyContent: 'center', // Center-align them
    alignItems: 'center',
  },
  tagButton: {
    backgroundColor: '#2aa4eb',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#2aa4eb', // Brown border
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 5,
  },
  selectedTag: {
    backgroundColor: '#846425', // Brown when selected
    borderColor: '#846425',
  },
  tagText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'work_sans'
  },
  selectedTagText: {
    color: '#ffffff',
    fontFamily: 'work_sans'
  },
  bottomHalfContent: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
  },
  continueButton: {
    backgroundColor: '#846425',
    borderColor: '#ffffff',
    borderWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  continueText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'work_sans'
  },
});
