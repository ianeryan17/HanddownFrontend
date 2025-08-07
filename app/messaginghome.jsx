import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useMessaging } from './messagingcontext';
import { useUser } from './usercontext';
import config from './config';


const Messaging = ({ navigateToConversation, navigateToParkingLot }) => {
  const navigation = useNavigation();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationDetails, setConversationDetails] = useState({});
  const [profileImageUrls, setProfileImageUrls] = useState({});
  const [shouldRefetch, setShouldRefetch] = useState(false);
  const imageLoadingStates = useRef({});
  // const { registerListingDeletedCallback } = useMessaging();
  const { userId } = useUser();

  const fetchListingDetails = async (listingId) => {
    try {
      console.log(`Fetching listing details for listing ID: ${listingId}`);
      const response = await fetch(`${config.baseUrl}/listings/get-listing/${listingId}`);
      if (!response.ok) throw new Error('Failed to fetch listing');
      const data = await response.json();
      // console.log(`Successfully fetched listing:`, data);
      return data;
    } catch (error) {
      console.error("Error fetching listing:", error);
      return null;
    }
  };

  const fetchProfileDetails = async (profileId) => {
    try {
      console.log(`Fetching profile details for profile ID: ${profileId}`);
      const response = await fetch(`${config.baseUrl}/profile/profile-access/${profileId}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      // console.log(`Successfully fetched profile:`, data);
      return data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  const fetchProfileImage = async (profileId) => {
    if (!profileId || profileImageUrls[profileId]) return;
    
    try {
      imageLoadingStates.current[profileId] = true;
      
      const response = await fetch(`${config.baseUrl}/profile/profile-access/${profileId}`);
      const profileData = await response.json();
      if (profileData && profileData.imageUrl) {
        setProfileImageUrls(prev => ({
          ...prev,
          [profileId]: profileData.imageUrl
        }));
      }
    } catch (error) {
      console.error("Error fetching profile image:", error);
    } finally {
      imageLoadingStates.current[profileId] = false;
    }
  };

  const fetchConversationDetails = async (conversations) => {
    console.log('Starting to fetch details for all conversations:', conversations);
    const details = {};
    const processedConversations = new Set(); // Track processed conversations
    
    for (const conv of conversations) {
      // Skip if we've already processed this conversation
      if (processedConversations.has(conv.conversation_id)) {
        console.log(`Skipping duplicate conversation: ${conv.conversation_id}`);
        continue;
      }
      processedConversations.add(conv.conversation_id);
      
      const otherUserId = userId === conv.offering_user_id ? conv.receiving_user_id : conv.offering_user_id;
      console.log(`Current user is ${userId}, other user is ${otherUserId}`);
      
      const [listing, otherProfile] = await Promise.all([
        fetchListingDetails(conv.listing_id),
        fetchProfileDetails(otherUserId)
      ]);
      
      details[conv.conversation_id] = {
        listing,
        otherProfile
      };

      // Fetch profile image for the other user
      await fetchProfileImage(otherUserId);
    }
    setConversationDetails(details);
  };

  const fetchConversations = async () => {
    try {
      // Only prevent fetches if we're already loading and have some conversations
      if (loading && conversations.length > 0) {
        console.log('Already fetching conversations and have data, skipping...');
        return;
      }
      
      setLoading(true);
      if (!userId) {
        console.error("No user ID available");
        return;
      }

      console.log('Fetching conversations for user:', userId);
      const response = await fetch(`${config.baseUrl}/conversations/get-all-conversations/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received conversations:', data);
      
      // Only update state if we have new data
      if (JSON.stringify(data) !== JSON.stringify(conversations)) {
        setConversations(data);
        await fetchConversationDetails(data);
      } else {
        console.log('Conversations data unchanged, skipping update');
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      Alert.alert("Error", "Failed to load conversations. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // const handleListingDeleted = async (listingId) => {
  //   try {
  //     // 1. Get conversations for the listing
  //     const response = await fetch(`http://${ipAddress}:8000/listings/${listingId}/conversations`);
  //     const affectedConversations = await response.json();
      
  //     // 2. Remove conversations from UI
  //     setConversations(prev => 
  //       prev.filter(conv => !affectedConversations.includes(conv.id))
  //     );

  //     // 3. Delete conversations on backend
  //     await fetch(`http://${ipAddress}:8000/listings/${listingId}/conversations`, {
  //       method: 'DELETE'
  //     });
  //   } catch (error) {
  //     console.error("Error handling listing deletion:", error);
  //   }
  // };

  useEffect(() => {
    if (shouldRefetch) {
      fetchConversations();
      setShouldRefetch(false);
    }
  }, [shouldRefetch]);

  const handleDeleteConversation = async (conversationId) => {
    // Optimistically remove the conversation from the UI
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    
    try {
      const response = await fetch(`${config.baseUrl}/conversations/delete-conversation/${conversationId}`, {
        method: 'GET'
      });

      if (response.ok) {
        Alert.alert("Success", "Conversation deleted successfully");
        setShouldRefetch(true); // Trigger a refetch after successful deletion
      } else {
        // If the backend deletion fails, refetch to restore the conversation
        setShouldRefetch(true);
        Alert.alert("Error", "Failed to delete conversation");
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      // If there's an error, refetch to restore the conversation
      setShouldRefetch(true);
      Alert.alert("Error", "Failed to delete conversation");
    }
  };

  const renderMessageItem = ({ item }) => {
    const isOfferer = userId === item.offering_user_id;
    const otherUserId = isOfferer ? item.receiving_user_id : item.offering_user_id;
    const backgroundColor = isOfferer ? '#846425' : '#2aa4eb';
    const details = conversationDetails[item.conversation_id];

    return (
      <TouchableOpacity 
        style={[styles.messageItem, { backgroundColor }]}
        onPress={() => navigateToConversation({
          conversationId: item.conversation_id,
          listingId: item.listing_id,
          otherUserId: otherUserId,
          isOfferer: isOfferer
        })}
        onLongPress={() => {
          Alert.alert(
            "Delete Conversation",
            "Are you sure you want to delete this conversation?",
            [
              {
                text: "Cancel",
                style: "cancel"
              },
              {
                text: "Delete",
                onPress: () => handleDeleteConversation(item.conversation_id),
                style: "destructive"
              }
            ]
          );
        }}
      >
        <View style={styles.profilePictureContainer}>
          <View style={styles.profilePicture}>
            {imageLoadingStates.current[otherUserId] && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" color="#846425" />
              </View>
            )}
            <Image
              source={profileImageUrls[otherUserId] ? 
                { uri: profileImageUrls[otherUserId] } : 
                require('../assets/profilestockphoto.jpg')}
              style={[
                styles.pImage,
                { opacity: imageLoadingStates.current[otherUserId] ? 0 : 1 }
              ]}
              onError={(error) => {
                console.log('Profile image loading error:', error.nativeEvent.error);
                imageLoadingStates.current[otherUserId] = false;
              }}
              onLoad={() => {
                imageLoadingStates.current[otherUserId] = false;
              }}
              onLoadStart={() => {
                imageLoadingStates.current[otherUserId] = true;
              }}
              resizeMode="cover"
            />
          </View>
        </View>

        <View style={styles.messageInfo}>
          <Text style={styles.userName}>
            {details?.otherProfile ? `${details.otherProfile.fname} ${details.otherProfile.lname}` : "Loading..."}
          </Text>
          <Text style={styles.listingName}>
            {details?.listing?.title || "Loading..."}
          </Text>
        </View>

        <Image 
          source={details?.listing?.imageUrl ? 
            { uri: details.listing.imageUrl } : 
            require('../assets/profilestockphoto.jpg')} 
          style={styles.listingImage} 
        />
      </TouchableOpacity>
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      console.log("Messaging screen focused - fetching conversations");
      fetchConversations();
    }, [])
  );

  // Register the callback when component mounts
  // useEffect(() => {
  //   registerListingDeletedCallback(handleListingDeleted);
  // }, []);

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.parkinglotButton}
          onPress={navigateToParkingLot}
        >
          <Text style={styles.parkinglot}>Listings you're interested in!</Text>
        </TouchableOpacity>
        <Text style={styles.messagesLabel}>Current conversations:</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#846425" />
          </View>
        ) : (
          <FlatList
            data={conversations}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.conversation_id.toString()}
            style={styles.messageList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No conversations yet</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default Messaging;

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  parkinglotButton: {
    marginTop: 25,
    marginBottom: 25,
    marginLeft: 10,
    width: '95%',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#2aa4eb',
    borderRadius: 10,
  },
  parkinglot: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'work_sans',
    color: "#ffffff"
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
  },
  listingImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },  
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  messageInfo: {
    flex: 1,
    marginLeft: 15,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'work_sans',
  },
  listingName: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'work_sans',
  },
  messagesLabel: {
    alignSelf: 'flex-start',
    marginLeft: 10,
    marginBottom: 10,
    fontWeight: 'bold',
    fontSize: 20,
    fontFamily: 'work_sans',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#846425',
    fontFamily: 'work_sans',
  },
  profilePictureContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderColor: '#fff',
    borderWidth: 2,
  },
  profilePicture: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 25,
  },
  pImage: {
    width: 46,
    height: 46,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1,
  },
});
