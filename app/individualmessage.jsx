import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useUser } from './usercontext';
import config from './config';

const Conversation = ({ route, navigateBack }) => {
  const { conversationId, listingId, otherUserId, isOfferer } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileListings, setProfileListings] = useState([]);
  const [expandedListingModalVisible, setExpandedListingModalVisible] = useState(false);
  const [modalImageLoading, setModalImageLoading] = useState(true);
  const flatListRef = useRef(null);
  const { userId } = useUser();

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${config.baseUrl}/conversations/get-all-messages/${conversationId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Convert Firebase document data to array of messages and sort by timestamp
      const messageArray = Object.entries(data)
        .map(([docId, docData]) => ({
          id: docId,
          text: docData.text || '',
          sender_id: docData.sender_id,
          timestamp: docData.timestamp
        }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      // Only update state if messages have changed
      if (JSON.stringify(messageArray) !== JSON.stringify(messages)) {
        console.log('New messages found, updating state');
        setLoading(true);
        setMessages(messageArray);
        setLoading(false);
      } else {
        console.log('Messages unchanged, skipping update');
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setLoading(false);
    }
  };

  const fetchListingDetails = async () => {
    try {
      const response = await fetch(`${config.baseUrl}/listings/get-listing/${listingId}`);
      if (!response.ok) throw new Error('Failed to fetch listing');
      const data = await response.json();
      setListing(data);
    } catch (error) {
      console.error("Error fetching listing:", error);
    }
  };

  const fetchOtherUserDetails = async () => {
    try {
      const response = await fetch(`${config.baseUrl}/profile/profile-access/${otherUserId}`);
      if (!response.ok) throw new Error('Failed to fetch user profile');
      const data = await response.json();
      setOtherUser(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchProfileDetails = async (profileId) => {
    try {
      const response = await fetch(`${config.baseUrl}/profile/profile-access/${profileId}`);
      const profileData = await response.json();
      setSelectedProfile(profileData);
      
      // Fetch only the listings for this specific profile
      const listingsResponse = await fetch(`${config.baseUrl}/profile/get-profile-offerings/${profileId}`);
      const listingsData = await listingsResponse.json();
      setProfileListings(listingsData);
      
      setProfileModalVisible(true);
    } catch (error) {
      console.error("Error fetching profile details:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchListingDetails();
    fetchOtherUserDetails();
    // Set up polling for new messages - every 10 seconds
    const interval = setInterval(fetchMessages, 1000);
    return () => clearInterval(interval);
  }, [conversationId, listingId, otherUserId]);

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ 
          animated: true,
          offset: 400 // Add extra offset to ensure visibility
        });
      }, 100);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      console.log('Sending message:', {
        conversationId,
        message: newMessage.trim(),
        sender_id: userId
      });

      const response = await fetch(`${config.baseUrl}/conversations/send-message/${conversationId}/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message_contents: newMessage.trim()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Message sent successfully:', result);
      
      setNewMessage('');
      await fetchMessages();
      // Ensure we scroll after the messages are updated
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.sender_id === userId;
    const messageTime = new Date(item.timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.sentMessage : styles.receivedMessage
      ]}>
        <Text style={[
          styles.messageText,
          isCurrentUser ? styles.sentMessageText : styles.receivedMessageText
        ]}>
          {item.text}
        </Text>
        <Text style={[
          styles.messageTime,
          isCurrentUser ? styles.sentMessageTime : styles.receivedMessageTime
        ]}>
          {messageTime}
        </Text>
      </View>
    );
  };

  const handleListingImagePress = () => {
    setModalImageLoading(true);
    setExpandedListingModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 5 : 0}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
              <Ionicons name="chevron-back-sharp" size={30} color="#846425" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => fetchProfileDetails(otherUserId)}
              style={styles.profileButton}
            >
              <Image
                source={otherUser?.imageUrl ? { uri: otherUser.imageUrl } : require('../assets/profilestockphoto.jpg')}
                style={styles.profileImage}
              />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.title}>{listing?.title || "Loading..."}</Text>
              <Text style={styles.subtitle}>{otherUser ? `${otherUser.fname} ${otherUser.lname}` : "Loading..."}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleListingImagePress}>
            <Image
              source={listing?.imageUrl ? { uri: listing.imageUrl } : require('../assets/profilestockphoto.jpg')}
              style={styles.listingImage}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.messagesContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#846425" />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              style={styles.messagesList}
              onContentSizeChange={scrollToBottom}
              onLayout={scrollToBottom}
              inverted={false}
              maintainVisibleContentPosition={{
                minIndexForVisible: 0,
                autoscrollToTopThreshold: 10,
              }}
            />
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor="#737373"
            multiline
            autoCorrect={true}
            autoCapitalize="sentences"
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={24} color="#846425" />
          </TouchableOpacity>
        </View>

        {/* Profile Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={profileModalVisible}
          onRequestClose={() => setProfileModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.modalBackButton}
                onPress={() => setProfileModalVisible(false)}
              >
                <Ionicons name="chevron-back-sharp" size={30} color="#846425" />
              </TouchableOpacity>
              <ScrollView contentContainerStyle={{paddingBottom: 20, paddingTop: 10}}>
                <View style={styles.profileSection}>
                  <Image 
                    source={selectedProfile?.imageUrl ? { uri: selectedProfile.imageUrl } : require("../assets/profilestockphoto.jpg")} 
                    style={styles.modalProfileImage} 
                  />
                  <View style={styles.infoContainer}>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoText}>{selectedProfile?.fname} {selectedProfile?.lname}</Text>
                    </View>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoText2}>{selectedProfile?.email}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.tagSection}>
                  <View style={styles.subsection}>
                    <Text style={styles.sectionTitle}>Interests</Text>
                    <FlatList
                      data={selectedProfile?.interests ? selectedProfile.interests.split(/[\s%20]+/).filter(tag => tag.trim() !== '') : []}
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
                    <Text style={styles.sectionTitle}>Offerings</Text>
                    <FlatList
                      data={selectedProfile?.offerings ? selectedProfile.offerings.split(/[\s%20]+/).filter(tag => tag.trim() !== '') : []}
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

                <View style={styles.modalListingsSection}>
                  <Text style={styles.modalSectionTitle}>Listings</Text>
                  <View style={styles.modalListingsContainer}>
                    {profileListings.map((item, index) => (
                      <TouchableOpacity 
                        key={item.id} 
                        style={styles.modalListing}
                      >
                        <Image
                          source={{ uri: item.imageUrl }}
                          style={styles.modalListingImage}
                        />
                        <Text style={styles.modalListingText}>{item.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

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
                style={styles.modalBackButton}
                onPress={() => setExpandedListingModalVisible(false)}
              >
                <Ionicons name="chevron-back-sharp" size={30} color="#846425" />
              </TouchableOpacity>
              <ScrollView contentContainerStyle={{paddingBottom: 20, paddingTop: 20}}>
                <View>
                  <Text style={styles.modalTitle}>Title:</Text>
                  <Text style={styles.longDescription}>{listing?.title}</Text>
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
                      source={listing?.imageUrl ? {uri: listing.imageUrl} : require("../assets/profilestockphoto.jpg")}
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
                    {listing?.long_description || "No description provided"}
                  </Text>
                </View>

                <View>
                  <Text style={styles.modalTitle}>Tags:</Text>
                  {listing?.tags ? (
                    <View style={styles.selectedTagsSection}>
                      <FlatList
                        data={typeof listing.tags === 'string' ? listing.tags.split('%20') : listing.tags}
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
                      <Text style={styles.listingDetailValue}>{listing?.listing_type || "Not specified"}</Text>
                    </View>
                    <View style={styles.listingDetailRow}>
                      <Text style={styles.listingDetailLabel}>Transaction Type:</Text>
                      <Text style={styles.listingDetailValue}>{listing?.transaction_type || "Not specified"}</Text>
                    </View>
                    <View style={styles.listingDetailRow}>
                      <Text style={styles.listingDetailLabel}>Price:</Text>
                      <Text style={styles.listingDetailValue}>${listing?.price || "0"}</Text>
                    </View>
                  </View>
                </View>

                <View>
                  <Text style={styles.modalTitle}>Posted By:</Text>
                  <Text style={styles.longDescription}>
                    {otherUser ? `${otherUser.fname} ${otherUser.lname}` : "Loading..."}
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Conversation;

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerInfo: {
    marginLeft: 10,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#846425',
    fontFamily: 'work_sans',
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#737373',
    fontFamily: 'work_sans',
    marginTop: 5,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2aa4eb',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f5f5f5',
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'work_sans',
  },
  sentMessageText: {
    color: '#ffffff',
  },
  receivedMessageText: {
    color: '#000000',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  sentMessageTime: {
    color: '#ffffff',
  },
  receivedMessageTime: {
    color: '#737373',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginTop: Platform.OS === 'ios' ? 0 : 0,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontFamily: 'work_sans',
  },
  sendButton: {
    padding: 10,
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
  profileButton: {
    padding: 5,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    paddingTop: 40,
    borderRadius: 10,
    width: "100%",
    maxHeight: "90%",
    alignSelf: "center",
  },
  modalBackButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 10,
    paddingTop: 20,
    zIndex: 1,
  },
  profileSection: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    width: '100%',
    justifyContent: 'space-between',
    borderBottomColor: '#2aa4eb',
    borderBottomWidth: 1,
  },
  modalProfileImage: {
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
    width: '100%',
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
  modalListingsSection: {
    width: '100%',
  },
  modalSectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: '#2aa4eb',
    fontFamily: 'work_sans',
  },
  modalListingsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalListing: {
    width: '49%',
    backgroundColor: '#2aa4eb',
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalListingImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#ccc',
    marginBottom: 5,
    borderRadius: 5,
  },
  modalListingText: {
    color: '#ffffff',
    fontSize: 17,
    textAlign: 'center',
    fontFamily: 'work_sans',
    paddingVertical: 5
  },
  listingImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginLeft: 10,
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
  modalImage: {
    width: '100%',
    height: '100%',
  },
});
