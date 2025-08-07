import React, { useState, useEffect} from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, Image, TouchableOpacity, SafeAreaView, ImageBackground, Modal, ScrollView, ActivityIndicator, Keyboard } from 'react-native';
import backgroundPattern from "../assets/background_images/papyrus.png";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useUser } from './usercontext';
import config from './config';

const FSearch = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedListingModalVisible, setExpandedListingModalVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [offererProfile, setOffererProfile] = useState(null);
  const [conversationSuccessModalVisible, setConversationSuccessModalVisible] = useState(false);
  const [newConversationData, setNewConversationData] = useState(null);
  const [likeSuccessModalVisible, setLikeSuccessModalVisible] = useState(false);
  const [dislikeSuccessModalVisible, setDislikeSuccessModalVisible] = useState(false);
  const { userId } = useUser();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    // Dismiss the keyboard
    Keyboard.dismiss();
    
    try {
      setLoading(true);
      console.log('Making search request with query:', searchQuery);
      
      const searchResponse = await fetch(
        `${config.baseUrl}/algo/get-search-listings/${encodeURIComponent(searchQuery)}?profile_id=${userId}`
      );
      
      if (!searchResponse.ok) {
        console.error('Search response not OK:', searchResponse.status, searchResponse.statusText);
        throw new Error('Failed to fetch search results');
      }
      
      const listingsData = await searchResponse.json();
      console.log('Received search results:', {
        numberOfListings: listingsData.length,
        firstListing: listingsData[0],
        lastListing: listingsData[listingsData.length - 1]
      });
      
      setListings(listingsData);
      console.log('Listings state updated with', listingsData.length, 'items');
      
    } catch (error) {
      console.error("Error performing search:", {
        error: error.message,
        stack: error.stack
      });
      setListings([]);
    } finally {
      setLoading(false);
      console.log('Search completed, loading state set to false');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchListings = async () => {
        try {
          const response = await fetch(`${config.baseUrl}/listings/get-all-listings-limited/${userId}`);
          const data = await response.json();
          setListings(data);
        } catch (error) {
          console.error("Error fetching listings:", error);
        }
      };
  
      fetchListings();  // Fetch listings when the screen comes into focus
  
      return () => {
        // Optionally, clean up if needed when the screen goes out of focus
      };
    }, [])  // Empty dependency array means it only runs when the screen is focused
  );

  const fetchOffererProfile = async (profileId) => {
    try {
      const response = await fetch(`${config.baseUrl}/profile/public-profile-access/${profileId}`);
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
    setImageLoading(true);
    if (listing.profile_offerer_id) {
      fetchOffererProfile(listing.profile_offerer_id);
    }
  };

  const handleLike = async (listingId) => {
    try {
      const response = await fetch(`${config.baseUrl}/feed/swipe-right/${listingId}?uid=${userId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to register like');
      }

      console.log('Liked:', selectedListing?.title);
      setExpandedListingModalVisible(false);
      setLikeSuccessModalVisible(true);
    } catch (error) {
      console.error("Error registering like:", error);
    }
  };

  const handleDislike = async (listingId) => {
    try {
      const response = await fetch(`${config.baseUrl}/feed/swipe-left/${listingId}?uid=${userId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to register dislike');
      }

      console.log('Disliked:', selectedListing?.title);
      setExpandedListingModalVisible(false);
      setDislikeSuccessModalVisible(true);
    } catch (error) {
      console.error("Error registering dislike:", error);
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

  const handleNavigateToConversation = () => {
    setConversationSuccessModalVisible(false);
    if (newConversationData) {
      navigation.navigate('Messaging', {
        screen: 'IndividualMessage',
        params: newConversationData
      });
    }
  };

  return (
    // <ImageBackground source={backgroundPattern} style={styles.container} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <View style={styles.searchBarContainer}>
          <TextInput 
            style={styles.searchBar} 
            placeholder="Search..."
            placeholderTextColor= '#737373'
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            autoCorrect={true}
          />
          <TouchableOpacity 
            style={styles.searchIcon}
            onPress={handleSearch}
          >
            <Ionicons name="search" size={20} color="#737373" />
          </TouchableOpacity>
        </View>

        {/* <Text style={styles.suggestedQueries}>Suggested queries</Text> */}

        <View style={styles.listingsSection}>
          <FlatList
            data={listings}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            numColumns={2}
            columnWrapperStyle={{justifyContent: 'space-between'}}
            contentContainerStyle={styles.listingsContainer}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={false}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.listing}
                onPress={() => handleListingPress(item)}
              >
                {item.imageUrl ? (
                  <Image 
                    source={{uri: item.imageUrl}} 
                    style={styles.listingImage} 
                  />
                ) : (
                  <View style={[styles.listingImage, styles.placeholderImage]} />
                )}
                <View style={styles.listingTextContainer}>
                  <Text style={styles.listingText}>{item.title}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>    

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
                  style={[styles.floatingButton, styles.likeButton]}
                  onPress={() => handleLike(selectedListing?.id)}
                >
                  <Ionicons name="thumbs-up" size={24} color="#FFFFFF" />
                  <Text style={styles.floatingButtonText}>Like</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.floatingButton, styles.superlikeButton]}
                  onPress={() => handleSuperlike(selectedListing?.id)}
                >
                  <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
                  <Text style={styles.floatingButtonText}>Message</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.floatingButton, styles.dislikeButton]}
                  onPress={() => handleDislike(selectedListing?.id)}
                >
                  <Ionicons name="thumbs-down" size={24} color="#FFFFFF" />
                  <Text style={styles.floatingButtonText}>Dislike</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.modalBackButton}
                onPress={() => setExpandedListingModalVisible(false)}
              >
                <Ionicons name="chevron-back-sharp" size={30} color="#846425" />
              </TouchableOpacity>
              <ScrollView 
                contentContainerStyle={{paddingBottom: 50, paddingTop: 20}}
                showsVerticalScrollIndicator={false}
              >
                <View>
                  <Text style={styles.modalTitle}>Title:</Text>
                  <Text style={styles.longDescription}>{selectedListing?.title}</Text>
                </View>
                
                <View style={{marginVertical: 10}}>
                  <Text style={styles.modalTitle}>Image(s):</Text>
                  <View style={{height: 300, width: '50%', marginTop: 10, borderRadius: 5, overflow: 'hidden', alignSelf: 'center'}}>
                    {imageLoading && (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#846425" />
                      </View>
                    )}
                    <Image 
                      source={selectedListing?.imageUrl ? {uri: selectedListing.imageUrl} : require("../assets/profilestockphoto.jpg")}
                      style={[
                        styles.modalImage,
                        { opacity: imageLoading ? 0 : 1 }
                      ]}
                      resizeMode="cover"
                      onLoadStart={() => setImageLoading(true)}
                      onLoadEnd={() => setImageLoading(false)}
                      onError={() => setImageLoading(false)}
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
                        showsVerticalScrollIndicator={false}
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

        {/* Like Success Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={likeSuccessModalVisible}
          onRequestClose={() => setLikeSuccessModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.successModalContent}>
              <Text style={styles.successModalTitle}>Liked!</Text>
              <Text style={styles.successModalText}>You've liked this listing.</Text>
              <TouchableOpacity 
                style={styles.successModalButton}
                onPress={() => setLikeSuccessModalVisible(false)}
              >
                <Text style={styles.successModalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Dislike Success Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={dislikeSuccessModalVisible}
          onRequestClose={() => setDislikeSuccessModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.successModalContent}>
              <Text style={styles.successModalTitle}>Disliked!</Text>
              <Text style={styles.successModalText}>You've disliked this listing.</Text>
              <TouchableOpacity 
                style={styles.successModalButton}
                onPress={() => setDislikeSuccessModalVisible(false)}
              >
                <Text style={styles.successModalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    // </ImageBackground>
  );
};

export default FSearch;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  searchBarContainer: {
    flexDirection: 'row',
    width: '93%',
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#846425',
    marginBottom: 10,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  searchBar: {
    flex: 1,
    height: 40,
    fontSize: 20,
    fontFamily: 'work_sans',
    color: '#000000',
  },
  searchIcon: {
    padding: 5,
  },
  // suggestedQueries: {
  //   alignSelf: 'flex-start',
  //   marginLeft: 20,
  //   marginBottom: 10,
  //   fontWeight: 'bold',
  //   fontFamily: 'work_sans',
  //   fontSize: 18,
  // },
  listingsSection: {
    alignItems: 'center',
    width: '95%',
    marginBottom: 20,
  },
  listingsContainer: {
    paddingBottom: 85,
  },
  listing: {
    width: '48%',
    backgroundColor: '#2aa4eb',
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
    marginRight: '1%',
    marginLeft: '1%',
    height: 205,
  },  
  listingImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#ccc',
    borderRadius: 5,
    resizeMode: 'cover',
  },
  placeholderImage: {
    backgroundColor: '#000000',
  },
  listingTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  listingText: {
    color: '#ffffff',
    fontSize: 17,
    textAlign: 'center',
    fontFamily: 'work_sans',
    padding: 5,
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
    width: '30%',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  likeButton: {
    backgroundColor: '#4CAF50',
  },
  superlikeButton: {
    backgroundColor: '#FFD700',
  },
  dislikeButton: {
    backgroundColor: '#F44336',
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'work_sans',
  },
  modalBackButton: {
    position: 'absolute',
    top: 20,
    left: 0,
    padding: 10,
    zIndex: 1
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
});