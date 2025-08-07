import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Using Ionicons as an example
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../usercontext'; // Import the context hook
import config from '../config';

const UserPhoto = ({ navigateTo }) => {
  const { userId } = useUser();
  console.log("User ID received from global context:", userId); // Debugging

  const [selectedImage, setSelectedImage] = useState(null);

  const pickImage = async () => {
    console.log("pickingImage");
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert(
        "Permission Required",
        "We need access to your gallery to upload images. Please enable permissions in settings."
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      console.log(result);
    } else {
      alert('You did not select any image.');
    }

    if (result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleUserPhoto = async () => {
    if (!selectedImage) {
      alert("Error", "A photo was not selected.");
      return;
    }

    console.log("handleUserPhoto called");

    const formData = new FormData();
    const uriParts = selectedImage.split('.');
    const fileType = uriParts[uriParts.length - 1];
  
    formData.append('image', {
      uri: selectedImage,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    });
    console.log("Sending form data: ", formData);

    try {
      const response = await fetch(`${config.baseUrl}/onboarding/profile-photo/${userId}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log("Response Status:", response.status); // Log response status
      // console.log("Response Headers:", response.headers); // Log headers
      const data = await response.json();
      console.log("Server Response:", data); // Print response to console

      if (response.ok) {
        // userId = data.uid;
        alert("Success", "Photo uploaded successfully!");
        navigateTo('InterestTags');
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
      <View style={styles.background}>
       
        {/* Headers */}
        <TouchableOpacity //temporary for testing
          style={styles.backButton} 
          onPress={() => navigateTo('UserInfo')} 
        >
          {/* Use the Ionicons back arrow icon */}
          <Ionicons name="arrow-back" size={24} color="#2aa4eb" />
        </TouchableOpacity>
        
        <View style={styles.logo}>
          <Text style={styles.logoText}>Add your photo!</Text>
        </View>

        <Text style={styles.descriptionText}>
          Adding a photo to your profile will allow other users to form a better connection with you and create a more personal community.
        </Text>

        <View style={styles.content}>
          {/* Top Half Content */}
          <View style={styles.topHalfContent}>
            <View style={styles.profilePictureContainer}>
              <TouchableOpacity style={styles.profilePicture} onPress={pickImage}>
                {selectedImage ? (
                  <Image source={{ uri: selectedImage }} style={styles.image} />
                ) : ( 
                  <View style={styles.profilePicture}>
                    {/* <TouchableOpacity style={styles.profilePictureContainer}> */}
                      <Image 
                        source={require('../../assets/profilestockphoto.jpg')} // Replace with your file path
                        style={styles.pImage} 
                      />
                      <Text style={styles.text}>Add{"\n"}Photo</Text>
                    {/* </TouchableOpacity> */}
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Half Content */}
          <View style={styles.bottomHalfContent}>
            <TouchableOpacity 
              style={styles.signUpButton} 
              onPress={handleUserPhoto}
            >
              <Text style={styles.signUpText}>Continue</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.addLaterButton} 
              onPress={() => navigateTo('InterestTags')}
            >
              <Text style={styles.addLaterText}>Add Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      
      </View>
    </SafeAreaView>
  );
};

export default UserPhoto;

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
    paddingHorizontal: 20,
  },
  logo: {
    marginTop: 40,
    alignItems: 'center',
  },
  logoText: {
    color: '#2aa4eb',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'work_sans',
  },
  descriptionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2aa4eb',
    marginTop: 20,
    marginBottom: 25,
    textAlign: 'left',
    paddingHorizontal: 20,
    fontFamily: 'work_sans',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  topHalfContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  addPhotoContainer: {
    width: 120,
    height: 120,
    borderWidth: 2,
    borderColor: '#7D40E7',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  text: {
    position: 'absolute',
    color: '#846425',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'work_sans',
  },
  profilePictureContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 90,
    overflow: 'hidden',
    borderColor: '#fff',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePicture: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomHalfContent: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 40,
  },
  signUpButton: {
    backgroundColor: '#846425',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  signUpText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'work_sans',
  },
  addLaterButton: {
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
  },
  addLaterText: {
    color: '#2aa4eb',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'work_sans',
  },
});
