import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Image, SafeAreaView, FlatList, Animated, Modal, ActivityIndicator, Alert } from 'react-native';
import pImage from '../assets/profilestockphoto.jpg';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useUser } from './usercontext';
import { useMessaging } from './messagingcontext';
import config from './config';

const Profile = () => {
  const [interestTags, setInterestTags] = useState([]);
  const [givingTags, setGivingTags] = useState([]);
  const [listings, setListings] = useState([]);
  const [expandedListingModalVisible, setExpandedListingModalVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [modalImageLoading, setModalImageLoading] = useState(true);
  const [editTitleModalVisible, setEditTitleModalVisible] = useState(false);
  const [editDescriptionModalVisible, setEditDescriptionModalVisible] = useState(false);
  const [editPriceModalVisible, setEditPriceModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [editMode, setEditMode] = useState(null); // 'title', 'description', 'price', or null
  const [shouldReopenDescription, setShouldReopenDescription] = useState(false);
  const [posterName, setPosterName] = useState('');
  const { userId } = useUser();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const { notifyListingDeleted } = useMessaging();

  // useFocusEffect with profile access
  useFocusEffect(
    React.useCallback(() => {
      const fetchProfileAndListings = async () => {
        try {
          // Fetch profile data
          const profileResponse = await fetch(`${config.baseUrl}/profile/profile-access/${userId}`);
          const profileData = await profileResponse.json();
          
          if (profileData) {
            // Parse interests string into array of tags
            const interestsArray = profileData.interests 
              ? profileData.interests.split(/[\s%20]+/).filter(tag => tag.trim() !== '')
              : [];
            setInterestTags(interestsArray);

            // Parse offerings string into array of tags
            const offeringsArray = profileData.offerings 
              ? profileData.offerings.split(/[\s%20]+/).filter(tag => tag.trim() !== '')
              : [];
            setGivingTags(offeringsArray);

            setUserName(`${profileData.fname} ${profileData.lname}`);
            setUserEmail(profileData.email);
            console.log('Profile image URL:', profileData.imageUrl);
            
            if (profileData.imageUrl) {
              setProfileImageUrl(profileData.imageUrl);
            } else {
              setProfileImageUrl(null);
            }
          }

          // Fetch listings
          try {
            const listingsResponse = await fetch(`${config.baseUrl}/profile/get-profile-offerings/${userId}`);
            if (!listingsResponse.ok) {
              throw new Error('Failed to fetch listings');
            }
            const listingsData = await listingsResponse.json();
            setListings(listingsData || []);  // Ensure we always set an array
          } catch (error) {
            console.error('Error fetching listings:', error);
            setListings([]);  // Set empty array on error
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
  
      fetchProfileAndListings();
  
      return () => {
        // Cleanup if needed
      };
    }, [])
  );
  

  const scrollY = useRef(new Animated.Value(0)).current;
  const textYPosition = useRef(0);
  const [isSticky, setIsSticky] = useState(false);
  const textRef = useRef(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.measureLayout(
        scrollViewRef.current,
        (x, y) => {
          textYPosition.current = y;
        },
      );
    }
  }, []);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false, }
  );

  useEffect(() => {
    const scrollListener = scrollY.addListener(({ value }) => {      
      setIsSticky(value >= (textYPosition.current));
    });

    return () => scrollY.removeListener(scrollListener);
  }, []);

  useEffect(() => {
    if (editMode) {
      setShouldReopenDescription(true);
      setExpandedListingModalVisible(false);
      // Use setTimeout to ensure the expanded modal is closed before opening the edit modal
      const timer = setTimeout(() => {
        switch (editMode) {
          case 'title':
            setEditTitleModalVisible(true);
            break;
          case 'description':
            setEditDescriptionModalVisible(true);
            break;
          case 'price':
            setEditPriceModalVisible(true);
            break;
        }
        setEditMode(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [editMode]);

  const handleEditTitle = async () => {
    console.log('Edit title button clicked');
    setEditMode('title');
  };

  const handleEditDescription = async () => {
    console.log('Edit description button clicked');
    setEditMode('description');
  };

  const handleEditPrice = async () => {
    console.log('Edit price button clicked');
    setNewPrice(selectedListing?.price || '');
    setEditMode('price');
  };

  const handleSaveTitle = async () => {
    try {
      const formData = new FormData();
      formData.append('new_title', newTitle);

      const response = await fetch(`${config.baseUrl}/listings/edit-listing-title/${selectedListing.id}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setListings(prevListings => 
          prevListings.map(listing => 
            listing.id === selectedListing.id 
              ? { ...listing, title: newTitle }
              : listing
          )
        );
        setSelectedListing(prev => ({ ...prev, title: newTitle }));
        setEditTitleModalVisible(false);
        setExpandedListingModalVisible(true);
        Alert.alert('Success', 'Title updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update title');
      }
    } catch (error) {
      console.error('Error updating title:', error);
      Alert.alert('Error', 'Failed to update title');
    }
  };

  const handleSaveDescription = async () => {
    try {
      const formData = new FormData();
      formData.append('new_desc', newDescription);

      const response = await fetch(`${config.baseUrl}/listings/edit-listing-description/${selectedListing.id}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setListings(prevListings => 
          prevListings.map(listing => 
            listing.id === selectedListing.id 
              ? { ...listing, long_description: newDescription }
              : listing
          )
        );
        setSelectedListing(prev => ({ ...prev, long_description: newDescription }));
        setEditDescriptionModalVisible(false);
        setExpandedListingModalVisible(true);
        Alert.alert('Success', 'Description updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update description');
      }
    } catch (error) {
      console.error('Error updating description:', error);
      Alert.alert('Error', 'Failed to update description');
    }
  };

  const handleSavePrice = async () => {
    try {
      const formData = new FormData();
      formData.append('new_price', newPrice);

      const response = await fetch(`${config.baseUrl}/listings/edit-price/${selectedListing.id}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setListings(prevListings => 
          prevListings.map(listing => 
            listing.id === selectedListing.id 
              ? { ...listing, price: newPrice }
              : listing
          )
        );
        setSelectedListing(prev => ({ ...prev, price: newPrice }));
        setEditPriceModalVisible(false);
        setExpandedListingModalVisible(true);
        Alert.alert('Success', 'Price updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update price');
      }
    } catch (error) {
      console.error('Error updating price:', error);
      Alert.alert('Error', 'Failed to update price');
    }
  };

  const handleListingPress = async (listing) => {
    console.log('Listing pressed:', listing);
    setSelectedListing(listing);
    setNewTitle(listing.title);
    setNewDescription(listing.long_description || '');
    setNewPrice(listing.price || '');
    setExpandedListingModalVisible(true);
    setModalImageLoading(true);

    // Fetch poster's profile information
    try {
      const response = await fetch(`${config.baseUrl}/profile/profile-access/${listing.profile_offerer_id}`);
      if (response.ok) {
        const profileData = await response.json();
        setPosterName(`${profileData.fname} ${profileData.lname}`);
      }
    } catch (error) {
      console.error('Error fetching poster profile:', error);
      setPosterName('Unknown User');
    }
  };

  const handleCloseEditTitle = () => {
    setEditTitleModalVisible(false);
    setExpandedListingModalVisible(true);
  };

  const handleCloseEditDescription = () => {
    setEditDescriptionModalVisible(false);
    setExpandedListingModalVisible(true);
  };

  const handleCloseEditPrice = () => {
    setEditPriceModalVisible(false);
    setExpandedListingModalVisible(true);
  };

  const handleDeleteListing = async () => {
    try {
      // First, clean up conversations
      const convResponse = await fetch(`${config.baseUrl}/listings/${selectedListing.id}/conversations`, {
        method: 'DELETE'
      });

      if (!convResponse.ok) {
        console.error("Failed to clean up conversations");
      }

      // Then delete the listing
      const response = await fetch(`${config.baseUrl}/listings/delete-listing/${selectedListing.id}`, {
        method: 'GET',
      });

      if (response.ok) {
        // Remove the listing from the local state
        setListings(prevListings => prevListings.filter(listing => listing.id !== selectedListing.id));
        setExpandedListingModalVisible(false);
        
        // Notify messaging system about the deletion
        notifyListingDeleted(selectedListing.id);
        
        Alert.alert('Success', 'Listing and associated conversations deleted successfully');
      } else {
        Alert.alert('Error', 'Failed to delete listing');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      Alert.alert('Error', 'Failed to delete listing');
    }
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: handleDeleteListing,
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
        <View style={styles.container}>
          {isSticky && (
            <View style={[styles.listingHeaderContainer, styles.stickyHeader]}>
              <Text style={styles.listingHeader}>Current Listings</Text>
            </View>
          )}

          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.content}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <View style={styles.profileSection}>
              <Image 
                source={profileImageUrl ? { uri: profileImageUrl } : pImage} 
                style={styles.profileImage} 
                onError={(error) => {
                  console.log('Image loading error:', error.nativeEvent.error);
                  console.log('Failed URL:', profileImageUrl);
                }}
                onLoad={() => console.log('Image loaded successfully')}
                resizeMode="cover"
                onLoadStart={() => console.log('Starting to load image')}
              />
              <View style={styles.infoContainer}>
                <View style={styles.infoBox}>
                  {/* <Text style={styles.infoText}> Ian Ryan </Text> */}
                  <Text style={styles.infoText}>{userName}</Text>
                </View>
                <View style={styles.infoBox}>
                  {/* <Text style={styles.infoText2}> ian.ryan@tufts.edu </Text> */}
                  <Text style={styles.infoText2}>{userEmail}</Text>
                </View>
              </View>
            </View>

            <View style={styles.tagSection}>
              <View style={styles.subsection}>
                <Text style={styles.sectionTitle}>Your Interests</Text>
                <FlatList
                  data={interestTags} // Array of user-selected tags
                  keyExtractor={(item, index) => index.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tagsContainer}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.tag}>
                      <Text style={styles.tagText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
              
              <View style={styles.subsection}>
                <Text style={styles.sectionTitle}>What You Have to Offer</Text>
                <FlatList
                  data={givingTags}
                  keyExtractor={(item, index) => index.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tagsContainer}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.tag}>
                      <Text style={styles.tagText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>

            <View style={styles.listingSection}>
              {!isSticky && (
                <View ref={textRef} style={styles.listingHeaderContainer}>
                  <Text style={styles.listingHeader}>Current Listings</Text>
                </View>
              )}

              <View style={{ height: isSticky ? 37 : 0, backgroundColor: "white" }} /> 

              <View style={styles.listingsContainer}>
                {listings.map((item, index) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={[styles.listing, index % 2 === 0 ? { marginRight: '2%' } : null]}
                    onPress={() => handleListingPress(item)}
                  >
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.listingImage}
                      onError={(error) => {
                        console.log('Listing image loading error:', error.nativeEvent.error);
                        console.log('Failed listing URL:', item.imageUrl);
                      }}
                    />
                    <View style={styles.textContainer}>
                      <Text style={styles.listingText}>{item.title}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Expanded Listing Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={expandedListingModalVisible}
            onRequestClose={() => setExpandedListingModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setExpandedListingModalVisible(false)}
                >
                  <Ionicons name="chevron-back-sharp" size={30} color="#846425" />
                </TouchableOpacity>
                <ScrollView contentContainerStyle={{paddingBottom: 20, paddingTop: 20}}>
                  <View>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Title:</Text>
                      <TouchableOpacity 
                        style={styles.editButton}
                        onPress={handleEditTitle}
                      >
                        <Ionicons name="pencil" size={20} color="#846425" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.longDescription}>{selectedListing?.title}</Text>
                  </View>
                  
                  <View style={{marginVertical: 10}}>
                    <Text style={styles.modalTitle}>Image(s):</Text>
                    <View style={{height: 300, width: '50%', marginTop: 10, borderRadius: 5, overflow: 'hidden', alignSelf: 'center'}}>
                      {modalImageLoading && (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator size="large" color="#846425" />
                        </View>
                      )}
                      <Image 
                        source={selectedListing?.imageUrl ? {uri: selectedListing.imageUrl} : require("../assets/profilestockphoto.jpg")}
                        style={[
                          styles.modalImage,
                          { opacity: modalImageLoading ? 0 : 1 }
                        ]}
                        resizeMode="cover"
                        onLoadStart={() => setModalImageLoading(true)}
                        onLoadEnd={() => setModalImageLoading(false)}
                        onError={() => setModalImageLoading(false)}
                      />
                    </View>
                  </View>

                  <View>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Description:</Text>
                      <TouchableOpacity 
                        style={styles.editButton}
                        onPress={handleEditDescription}
                      >
                        <Ionicons name="pencil" size={20} color="#846425" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.longDescription}>
                      {selectedListing?.long_description || "No description provided"}
                    </Text>
                  </View>

                  <View>
                    <Text style={styles.modalTitle}>Tags:</Text>
                    {selectedListing?.tags ? (
                      <View style={styles.selectedTagsSection}>
                        <FlatList
                          data={typeof selectedListing.tags === 'string' ? selectedListing.tags.split('%20') : selectedListing.tags}
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
                    ) : <Text style={styles.longDescription}>No tags</Text>}
                  </View>

                  <View style={{marginTop: 15}}>
                    <Text style={styles.modalTitle}>Listing Details:</Text>
                    <View style={styles.listingDetailsContainer}>
                      <View style={styles.listingDetailRow}>
                        <Text style={styles.listingDetailLabel}>Post Type:</Text>
                        <Text style={styles.listingDetailValue}>{selectedListing?.listing_type || "Not specified"}</Text>
                      </View>
                      <View style={styles.listingDetailRow}>
                        <Text style={styles.listingDetailLabel}>Transaction Type:</Text>
                        <Text style={styles.listingDetailValue}>{selectedListing?.transaction_type || "Not specified"}</Text>
                      </View>
                      <View style={styles.listingDetailRow}>
                        <View style={styles.priceContainer}>
                          <Text style={styles.listingDetailLabel}>Price:</Text>
                          <TouchableOpacity 
                            style={styles.editButton}
                            onPress={handleEditPrice}
                          >
                            <Ionicons name="pencil" size={20} color="#846425" />
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.listingDetailValue}>${selectedListing?.price || "0"}</Text>
                      </View>
                    </View>
                  </View>

                  <View>
                    <Text style={styles.modalTitle}>Posted By:</Text>
                    <Text style={styles.longDescription}>{posterName || "Loading..."}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDeletePress}
                  >
                    <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.deleteButtonText}>Delete Listing</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Edit Title Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={editTitleModalVisible}
            onRequestClose={handleCloseEditTitle}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.editModalContent}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleCloseEditTitle}
                >
                  <Ionicons name="chevron-back-sharp" size={30} color="#846425" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Edit Title</Text>
                <TextInput
                  style={styles.editInput}
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholder="Enter new title"
                  placeholderTextColor="#846425"
                />
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveTitle}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Edit Description Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={editDescriptionModalVisible}
            onRequestClose={handleCloseEditDescription}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.editModalContent}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleCloseEditDescription}
                >
                  <Ionicons name="chevron-back-sharp" size={30} color="#846425" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Edit Description</Text>
                <TextInput
                  style={[styles.editInput, styles.descriptionInput]}
                  value={newDescription}
                  onChangeText={setNewDescription}
                  placeholder="Enter new description"
                  placeholderTextColor="#846425"
                  multiline
                  numberOfLines={6}
                />
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveDescription}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Edit Price Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={editPriceModalVisible}
            onRequestClose={handleCloseEditPrice}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.editModalContent}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleCloseEditPrice}
                >
                  <Ionicons name="chevron-back-sharp" size={30} color="#846425" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Edit Price</Text>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.dollarSign}>$</Text>
                  <TextInput
                    style={[styles.editInput, styles.priceInput]}
                    value={newPrice}
                    onChangeText={setNewPrice}
                    placeholder="Enter new price"
                    placeholderTextColor="#846425"
                    keyboardType="numeric"
                  />
                </View>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSavePrice}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    alignItems: 'center',
    paddingVertical: 20,
    flexGrow: 1,
  },
  profileSection: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    width: '90%',
    justifyContent: 'space-between',
    borderBottomColor: '#2aa4eb',
    borderBottomWidth: 1,
  },
  profileImage: {
    width: 175,
    height: 175,
    backgroundColor: '#ccc',
    borderRadius: 100,
  },
  infoContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 10,
  },
  infoBox: {
    backgroundColor: 'transparent',
    padding: 7,
    borderRadius: 5,
  },
  infoText: {
    color: '#2aa4eb',
    fontSize: 25,
    fontFamily: 'work_sans',
  },
  infoText2: {
    color: '#2aa4eb',
    fontSize: 20,
    fontFamily: 'work_sans',
  },
  tagSection: {
    width: '90%',
    marginBottom: 20,
    borderBottomColor: "#2aa4eb",
    borderBottomWidth: 1,
  },
  subsection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2aa4eb',
    fontFamily: 'work_sans',
  },
  tagsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  tag: {
    backgroundColor: '#2aa4eb',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  tagText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'work_sans',
  },
  listingHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    paddingVertical: 5,
    marginBottom: 5,
    color: '#2aa4eb',
    fontFamily: 'work_sans',
  },
  listingSection: {
    width: '90%',
    marginBottom: 20,
  },
  listingHeaderContainer: {
    backgroundColor: "white",
  },
  stickyHeader: {
    position: "absolute",
    zIndex: 100,
    width: '90%',
    alignSelf: 'center',
  },
  listingsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  listing: {
    width: '49%',
    backgroundColor: '#2aa4eb',
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
    minHeight: 205,
  },
  listingImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#ccc',
    borderRadius: 5,
  },
  textContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingText: {
    color: '#ffffff',
    fontSize: 17,
    textAlign: 'center',
    fontFamily: 'work_sans',
    paddingVertical: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 50
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 60,
    borderRadius: 10,
    width: "100%",
    height: "90%",
    alignItems: "left",
    justifyContent: "space-between",
    marginTop: "auto",
    marginBottom: 20,
    position: 'relative'
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: "bold",
    fontFamily: 'work_sans',
    alignSelf: 'stretch',
    color: '#846425',
    marginBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#846425',
    paddingBottom: 5,
    width: '100%',
  },
  longDescription: {
    marginVertical: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    padding: 15,
    color: '#000000',
    fontSize: 16,
    fontFamily: 'work_sans',
    lineHeight: 24,
  },
  selectedTagsSection: {
    width: '100%',
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
  backButton: {
    position: 'absolute',
    top: 20,
    left: 0,
    padding: 10,
    zIndex: 1
  },
  listingDetailsContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    padding: 15,
    marginVertical: 15,
  },
  listingDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  listingDetailLabel: {
    fontSize: 16,
    fontFamily: 'work_sans',
    color: '#846425',
    fontWeight: 'bold',
  },
  listingDetailValue: {
    fontSize: 16,
    fontFamily: 'work_sans',
    color: '#000000',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {
    padding: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editModalContent: {
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 60,
    borderRadius: 10,
    width: "90%",
    maxHeight: "80%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "-45%",
  },
  editInput: {
    width: '100%',
    height: 50,
    borderWidth: 2,
    borderColor: '#846425',
    borderRadius: 5,
    paddingHorizontal: 15,
    marginVertical: 20,
    fontSize: 16,
    fontFamily: 'work_sans',
    color: '#000000',
  },
  descriptionInput: {
    height: 150,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  saveButton: {
    backgroundColor: '#846425',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'work_sans',
    fontWeight: 'bold',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 10,
  },
  dollarSign: {
    fontSize: 20,
    color: '#846425',
    marginRight: 10,
    fontFamily: 'work_sans',
  },
  priceInput: {
    flex: 1,
    width: 'auto',
  },
  deleteButton: {
    backgroundColor: '#FF4444',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'work_sans',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
