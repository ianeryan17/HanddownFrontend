import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Modal, FlatList, ActivityIndicator, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from './usercontext';
import config from './config';
// import { Dropdown } from 'react-native-element-dropdown';

const categories = [
  "Books", "Clothes", "Accessories", "Furniture", "Bedding",
  "Electronics", "Kitchenware", "School Supplies", 
  "Home Decor", "Formalwear", "Costumes", "Sports Equipment", 
   "Outdoor", "Housing", "Groceries", "Arts & Craft", "Transportation"
];

const AddListing = ({ navigation }) => {
  const { userId } = useUser();
  // console.log("User ID received from global context:", userId); // Debugging

  //TEXT ADDING FUNCTIONALITY
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState();
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  

  //IMAGE ADDING FUNCTIONALITY
  const pickImage = async () => {
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


  //TAG FUNCTIONALITY
  const toggleTag = (tag) => {
    setSelectedTags((prevSelected) =>
      prevSelected.includes(tag)
        ? prevSelected.filter((t) => t !== tag) // Remove if already selected
        : [...prevSelected, tag] // Add if not selected
    );
  };

  //TRANSACTION FUNCTIONALITY
  const [price, setPrice] = useState();
  const [listingType, setListingType] = useState();
  const [transactionType, setTransactionType] = useState();

  const handleChange = (text) => {
    // Remove non-numeric characters, except for the decimal point
    const cleanedText = text.replace(/[^0-9.]/g, '');
    setPrice(cleanedText);
  };

  //POSTING FUNCTIONALITY
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const postListing = async () => {
    if (!title.trim()) {
      alert("Error", "Title is required.");
      return;
    }
    if (!description.trim()) {
      alert("Error", "Description is required.");
      return;
    }
    if (!selectedImage) {
      alert("Error", "Please select an image.");
      return;
    }
    if (!listingType) {
      alert("Error", "Please select a listing type.");
      return;
    }
    if (!transactionType) {
      alert("Error", "Please select a transaction type.");
      return;
    }

    setIsLoading(true);
    console.log("postListing called");
    const formData = new FormData();
    formData.append('title', title);
    formData.append('long_description', description);
    formData.append('listing_type', listingType);
    formData.append('transaction_type', transactionType);
    formData.append('profile_offerer_id', userId);

    if (!price) {
      formData.append('price', 0);
    } else {
      formData.append('price', price);
    }

    const tagString = selectedTags.join("%20");
    formData.append('tags', tagString);

    if (selectedImage) {
      const uriParts = selectedImage.split('.');
      const fileType = uriParts[uriParts.length - 1];
    
      formData.append('image', {
        uri: selectedImage,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      });
    }

    console.log("Sending form data: ", formData);
   
    try {
      const response = await fetch(`${config.baseUrl}/listings/create-listing`, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response Status:", response.status); // Log response status
      console.log("Response Headers:", response.headers); // Log headers
      // const responseText = await response.text();
      // console.log("Raw response:", responseText);
      const data = await response.json();
      console.log("Server Response:", data); // Print response to console

      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        alert("Error", data.message || "Something went wrong.");
      }
      
    } catch (error) {
      console.error("Error during posting listing:", error);
      alert("Error", "Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigation.navigate('Profile');
  };

  // Reset the screen when AddListing is focused (i.e., when navigating back)
  const scrollViewRef = useRef();

  // Reset the screen when AddListing is focused (i.e., when navigating back)
  useFocusEffect(
    React.useCallback(() => {
      // Reset form fields when AddListing is focused
      setTitle('');
      setSelectedImage(null);
      setDescription('');
      setSelectedTags([]);
      setListingType();
      setTransactionType();
      setPrice();

      scrollViewRef.current?.scrollTo({ y: 0, animated: true }); // STILL NOT WORKING, NEEDS MORE TIME TO GET TO WORK
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>New Listing</Text>
        <View style={styles.titleSection}>
          <TextInput
            style={styles.titleInput}
            placeholder="Add a title for your listing..."
            placeholderTextColor="#737373"
            value={title}
            onChangeText={setTitle}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
            autoCorrect={true}
            maxLength={34}
          />
        </View>

        <View style={styles.imageSection}>
          <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
            ) : (
              <Text style={styles.imageText}>Add an image...</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.descriptionSection}>
          <TextInput
            style={styles.descriptionInput}
            multiline
            placeholder="Add a description of your listing..."
            placeholderTextColor="#737373"
            value={description}
            onChangeText={setDescription}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()} 
            autoCorrect={true}
          />
        </View>

        <View style={styles.dividingLine} />

        <View style={styles.tagSection}>
          <View style={styles.tagLabelContainer}>
            <Text style={styles.tagLabel}>Add Tags</Text>
          </View>
          <TouchableOpacity onPress={() => setTagModalVisible(true)}>
            <Ionicons name="add-circle-outline" size={24} color="#846425" />
          </TouchableOpacity>
        </View>

        {selectedTags.length > 0 ? (
          <View style={styles.selectedTagsSection}>
            <FlatList
              data={selectedTags}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.selectedTagContainer}>
                  <Text style={styles.selectedTagText}>{item}</Text>
                </View>
              )}
            />
          </View>
        ) : null}

        <Modal
          animationType="slide"
          transparent={true}
          visible={tagModalVisible}
          onRequestClose={() => setTagModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Tags:</Text>

              <View style={styles.modalTagsContainer}>
                {categories.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.modalTagButton,
                      selectedTags.includes(item) ? styles.modalSelectedTag : null
                    ]}
                    onPress={() => toggleTag(item)}
                  >
                    <Text style={selectedTags.includes(item) ? styles.modalSelectedTagText : styles.modalTagText}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setTagModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={styles.dividingLine} />

        {/* Post Type Section */}
        <View style={styles.tagSection}>
          <View style={styles.transactionsLabelContainer}>
            <Text style={styles.transactionLabel}>Post Type</Text>
          </View>
          <View style={styles.transactionContainer}>
            <TouchableOpacity
              style={[
                styles.transactionButton,
                listingType === "Listing" && styles.selectedTransactionButton,
              ]}
              onPress={() => {
                setListingType("Listing");
                setTransactionType(null); // Reset transaction type
              }}
            >
              <Text style={styles.transactionButtonText}>Listing</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.transactionButton,
                listingType === "Request" && styles.selectedTransactionButton,
              ]}
              onPress={() => {
                setListingType("Request");
                setTransactionType(null); // Reset transaction type
              }}
            >
              <Text style={styles.transactionButtonText}>Request</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transaction Type Section */}
        {listingType && (
          <View style={styles.tagSection}>
            <View style={styles.transactionsLabelContainer}>
              <Text style={styles.transactionLabel}>Transaction Type</Text>
            </View>
            <View style={styles.transactionContainer}>
              {listingType === "Listing" ? (
                <>
                  <TouchableOpacity
                    style={[
                      styles.transactionButton,
                      transactionType === "Lend" && styles.selectedTransactionButton,
                    ]}
                    onPress={() => setTransactionType("Lend")}
                  >
                    <Text style={styles.transactionButtonText}>Lend</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.transactionButton,
                      transactionType === "Sell" && styles.selectedTransactionButton,
                    ]}
                    onPress={() => setTransactionType("Sell")}
                  >
                    <Text style={styles.transactionButtonText}>Sell</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={[
                      styles.transactionButton,
                      transactionType === "Borrow" && styles.selectedTransactionButton,
                    ]}
                    onPress={() => setTransactionType("Borrow")}
                  >
                    <Text style={styles.transactionButtonText}>Borrow</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.transactionButton,
                      transactionType === "Buy" && styles.selectedTransactionButton,
                    ]}
                    onPress={() => setTransactionType("Buy")}
                  >
                    <Text style={styles.transactionButtonText}>Buy</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}

        {/* Price Section (Only for Buy or Sell) */}
        {(transactionType === "Buy" || transactionType === "Sell") && (
          <View style={styles.tagSection}>
            <View style={styles.transactionsLabelContainer}>
              <Text style={styles.transactionLabel}>Price</Text>
            </View>
            <View style={styles.priceInputContainer}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={styles.priceInput}
                placeholderTextColor="#737373"
                keyboardType="numeric"
                value={price} // Display the dollar sign before the price
                onChangeText={handleChange}
              />
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.postButton, isLoading && styles.postButtonDisabled]} 
          onPress={postListing}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.postButtonText}>Post Listing</Text>
          )}
        </TouchableOpacity>

        <Modal
          animationType="fade"
          transparent={true}
          visible={showSuccessModal}
          onRequestClose={handleSuccessModalClose}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.successModalContent}>
              <Text style={styles.successModalTitle}>Listing successfully posted!</Text>
              <TouchableOpacity 
                style={styles.successModalButton}
                onPress={handleSuccessModalClose}
              >
                <Text style={styles.successModalButtonText}>Profile Page </Text>
                <Ionicons name="arrow-forward" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
};

export default AddListing;



















const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingBottom: 200,
  },
  header: {
    fontSize: 30,
    marginTop: 25,
    color: '#2aa4eb',
    fontFamily: 'work_sans',
  },
  titleSection: {
    width: '90%',
    marginTop: 25,
  },
  titleInput: {
    height: 50,
    borderRadius: 5,
    backgroundColor: '#f5f5f5',
    padding: 10,
    color: '#000000',
    fontSize: 20,
    fontFamily: 'work_sans',
  },
  imageSection: {
    width: '90%',
  },
  imageBox: {
    height: 300,
    width: 250,
    backgroundColor: '#2aa4eb',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 25,
    borderRadius: 50,
  },
  imageText: {
    color: '#ffffff',
    fontSize: 25,
    fontFamily: 'work_sans',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    resizeMode: 'cover',
  },
  descriptionSection: {
    width: '90%',
    marginTop: 25,
  },
  descriptionInput: {
    height: 150,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    padding: 10,
    color: '#000000',
    fontSize: 20,
    textAlignVertical: 'top',
    fontFamily: 'work_sans',
  },

  tagSection: {
    width: '90%',
    marginTop: 20,
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "space-between",
  },
  tagLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tagIcon: {
    marginRight: 8,
  },
  tagLabel: {
    fontSize: 20,
    color: '#846425',
    alignItems: 'left',
    fontFamily: 'work_sans',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 15,
    fontFamily: 'work_sans',
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#846425",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 20,
    fontFamily: 'work_sans',
  },
  modalTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTagButton: {
    backgroundColor: '#2aa4eb',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#2aa4eb',
    paddingVertical: 5,
    paddingHorizontal: 10,
    margin: 5,
  },
  modalSelectedTag: {
    backgroundColor: '#846425',
    borderColor: '#846425',
  },
  modalTagText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
    fontFamily: 'work_sans'
  },
  modalSelectedTagText: {
    color: '#ffffff',
    fontFamily: 'work_sans',
    fontSize: 18,
  },
  selectedTagsSection: {
    width: '90%',
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedTagContainer: {
    backgroundColor: '#2aa4eb',
    borderRadius: 15,
    padding: 10,
    margin: 5,
  },
  selectedTagText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'work_sans',
  },

  dividingLine: {
    borderBottomColor: '#846425',  // Set the color of the dividing line
    borderBottomWidth: 1,  // Set the thickness of the dividing line
    marginTop: 20,
    width: '90%',  // Optional: Adjusts the width of the line
  },

  transactionsLabelContainer: {
    flex: 1,
  },
  transactionLabel: {
    fontSize: 20,
    color: "#846425",
    fontFamily: "work_sans",
  },
  transactionContainer: {
    flex: 1.5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionButton: {
    backgroundColor: "#846425",
    width: "45%",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#846425",
  },
  selectedTransactionButton: {
    backgroundColor: "#2aa4eb",
    borderColor: "#2aa4eb",
  },
  transactionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "work_sans",
    textAlign: "center",
  },
  priceInputContainer: {
    flex: 1.5,
    alignItems: "center",
    flexDirection: 'row',
    position: 'relative'
  },
  dollarSign: {
    right: 5,
    fontSize: 20,
    color: '#000',
  },
  priceInput: {
    backgroundColor: '#f5f5f5',
    borderColor: "#846425",
    borderWidth: 1,
    borderRadius: 5,
    width: "100%",
    padding: 10,
    fontSize: 20,
    fontFamily: 'work_sans',
  },
  postButton: {
    backgroundColor: '#846425',
    width: '90%',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 25,
  },
  postButtonDisabled: {
    backgroundColor: '#84642580', // Semi-transparent version of the original color
  },
  postButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'work_sans',
  },
  successModalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  successModalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#846425",
    textAlign: "center",
    fontFamily: "work_sans",
  },
  successModalButton: {
    backgroundColor: "#846425",
    padding: 15,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  successModalButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 5,
    fontFamily: "work_sans",
  },
});
