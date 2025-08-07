import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, Modal, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from './usercontext';
import config from './config';

const ParkingLot = ({ navigateBack }) => {
  const navigation = useNavigation();
  const [listings, setListings] = useState([]);
  const [expandedListingModalVisible, setExpandedListingModalVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [modalImageLoading, setModalImageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [offererProfile, setOffererProfile] = useState(null);
  const [conversationSuccessModalVisible, setConversationSuccessModalVisible] = useState(false);
  const [newConversationData, setNewConversationData] = useState(null);
  const { userId } = useUser();

  useFocusEffect(
    React.useCallback(() => {
      const fetchInterestedListings = async () => {
        try {
          setIsLoading(true);
          // First get the user's profile to get their Interested array
          const profileResponse = await fetch(`${config.baseUrl}/profile/profile-access/${userId}`);
          const profileData = await profileResponse.json();
          
          if (profileData && profileData.Interested && profileData.Interested.length > 0) {
            // Fetch details for each interested listing
            const listingPromises = profileData.Interested.map(listingId => 
              fetch(`${config.baseUrl}/listings/get-listing/${listingId}`).then(res => res.json())
            );
            
            const listingsData = await Promise.all(listingPromises);
            setListings(listingsData.filter(listing => listing)); // Filter out any null/undefined listings
          } else {
            setListings([]);
          }
        } catch (error) {
          console.error("Error fetching interested listings:", error);
          setListings([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchInterestedListings();
    }, [])
  );

  const fetchOffererProfile = async (profileId) => {
    try {
      const response = await fetch(`${config.baseUrl}/profile/profile-access/${profileId}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setOffererProfile(data);
    } catch (error) {
      console.error("Error fetching offerer profile:", error);
    }
  };

  const handleListingPress = (listing) => {
    setSelectedListing(listing);
    setExpandedListingModalVisible(true);
    setModalImageLoading(true);
    if (listing.profile_offerer_id) {
      fetchOffererProfile(listing.profile_offerer_id);
    }
  };

  const handleSuperlike = async (listingId) => {
    try {
      const response = await fetch(`${config.baseUrl}/feed/swipe-down/${listingId}?uid=${userId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to start conversation');
      }

      const data = await response.json();
      console.log('Started conversation with:', selectedListing?.title);

      // Store the conversation data and show the success modal
      setNewConversationData({
        conversationId: data.conversation_id,
        listingId: selectedListing.id,
        otherUserId: selectedListing.profile_offerer_id,
        isOfferer: false
      });
      setExpandedListingModalVisible(false);
      setConversationSuccessModalVisible(true);
      
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  const handleRemoveInterested = async (listingId) => {
    try {
      const response = await fetch(`${config.baseUrl}/profile/remove-interested/${listingId}?uid=${userId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to remove from interested');
      }

      // Remove the listing from the local state
      setListings(prevListings => prevListings.filter(listing => listing.id !== listingId));
      setExpandedListingModalVisible(false);
    } catch (error) {
      console.error("Error removing from interested:", error);
    }
  };

  const handleNavigateToConversation = () => {
    setConversationSuccessModalVisible(false);
    if (newConversationData) {
      // First navigate back to the messaging home screen
      navigateBack();
      // Then navigate to the individual message screen
      navigation.navigate('Messaging', {
        screen: 'IndividualMessage',
        params: newConversationData
      });
    }
  };

  const renderListingItem = ({ item, index }) => (
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
  );

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={navigateBack}
          >
            <Ionicons name="arrow-back" size={24} color="#2aa4eb" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Liked Listings</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2aa4eb" />
          </View>
        ) : (
          <View style={styles.listingsSection}>
            <FlatList
              data={listings}
              renderItem={renderListingItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              contentContainerStyle={styles.listingsContainer}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No listings liked yet</Text>
                </View>
              }
            />
          </View>
        )}

        {/* Expanded Listing Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={expandedListingModalVisible}
          onRequestClose={() => setExpandedListingModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.floatingButtonsContainer}>
                <TouchableOpacity 
                  style={[styles.floatingButton, styles.superlikeButton]}
                  onPress={() => handleSuperlike(selectedListing?.id)}
                >
                  <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
                  <Text style={styles.floatingButtonText}>Message</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.floatingButton, styles.deleteButton]}
                  onPress={() => handleRemoveInterested(selectedListing?.id)}
                >
                  <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
                  <Text style={styles.floatingButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.modalBackButton}
                onPress={() => setExpandedListingModalVisible(false)}
              >
                <Ionicons name="chevron-back-sharp" size={30} color="#846425" />
              </TouchableOpacity>
              <ScrollView contentContainerStyle={{paddingBottom: 50, paddingTop: 20}}>
                <View>
                  <Text style={styles.modalTitle}>Title:</Text>
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
                  <Text style={styles.modalTitle}>Description:</Text>
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
                      <Text style={styles.listingDetailLabel}>Price:</Text>
                      <Text style={styles.listingDetailValue}>${selectedListing?.price || "0"}</Text>
                    </View>
                  </View>
                </View>

                <View>
                  <Text style={styles.modalTitle}>Posted By:</Text>
                  <Text style={styles.longDescription}>
                    {offererProfile ? `${offererProfile.fname} ${offererProfile.lname}` : "Loading..."}
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Conversation Success Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={conversationSuccessModalVisible}
          onRequestClose={() => setConversationSuccessModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.successModalContent}>
              <Text style={styles.successModalTitle}>Conversation Created!</Text>
              <Text style={styles.successModalText}>You can now chat with the seller about this listing.</Text>
              <TouchableOpacity 
                style={styles.successModalButton}
                onPress={handleNavigateToConversation}
              >
                <Text style={styles.successModalButtonText}>Go to Conversation</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default ParkingLot;

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2aa4eb',
    fontFamily: 'work_sans',
    marginLeft: 10,
  },
  listingsSection: {
    width: '95%',
    marginBottom: 20,
    alignSelf: 'center',
  },
  listingsContainer: {
    paddingHorizontal: '1%',
    paddingTop: 10,
    paddingBottom: 40,
  },
  listing: {
    width: '49%',
    backgroundColor: '#2aa4eb',
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
    marginRight: '0.5%',
    marginLeft: '0.5%',
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
    alignSelf: 'left',
    color: '#846425',
    marginBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#846425',
    paddingBottom: 5,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#846425',
    fontFamily: 'work_sans',
    textAlign: 'center',
  },
  modalBackButton: {
    position: 'absolute',
    top: 10,
    padding: 10,
    paddingTop: 20,
    zIndex: 1,
  },
  floatingButtonsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    zIndex: 2,
  },
  floatingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    width: '45%',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  superlikeButton: {
    backgroundColor: '#FFD700',
  },
  deleteButton: {
    backgroundColor: '#FF4444',
  },
  floatingButtonText: {
    color: '#FFFFFF',
    marginLeft: 5,
    fontSize: 16,
    fontFamily: 'work_sans',
    fontWeight: 'bold',
  },
  successModalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: 'center',
  },
  successModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#846425',
    fontFamily: 'work_sans',
    marginBottom: 10,
  },
  successModalText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'work_sans',
    textAlign: 'center',
    marginBottom: 20,
  },
  successModalButton: {
    backgroundColor: '#846425',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  successModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'work_sans',
    fontWeight: 'bold',
  },
}); 