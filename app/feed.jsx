import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, SafeAreaView, Modal, FlatList, ActivityIndicator, ImageBackground, ScrollView, Animated, Dimensions} from 'react-native';
// import Swiper from 'react-native-deck-swiper';
import { Carousel } from 'react-native-reanimated-carousel';
import backgroundPattern from "../assets/background_images/papyrus.png";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from './usercontext';
import config from './config';

const Feed = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const swiperRef = useRef(null);
  const [currListingTags, setCurrListingTags] = useState([]);
  const [expandedListingModalVisible, setExpandedListingModalVisible] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [profileImageUrls, setProfileImageUrls] = useState({});
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileListings, setProfileListings] = useState([]);
  const [conversationSuccessModalVisible, setConversationSuccessModalVisible] = useState(false);
  const [newConversationData, setNewConversationData] = useState(null);
  const imageLoadingStates = useRef({});
  const backgroundCardOpacity = useRef(new Animated.Value(0)).current;
  const currentCardOpacity = useRef(new Animated.Value(1)).current;
  const [modalImageLoading, setModalImageLoading] = useState(true);
  const { userId } = useUser();
  const [endOfListings, setEndOfListings] = useState(false);

  const [prevIndex, setPrevIndex] = useState(0);


  // Animation values for swipe indicators and icons
  const leftIndicatorOpacity = useRef(new Animated.Value(0)).current;
  const rightIndicatorOpacity = useRef(new Animated.Value(0)).current;
  const upIndicatorOpacity = useRef(new Animated.Value(0)).current;
  const downIndicatorOpacity = useRef(new Animated.Value(0)).current;
  const leftIconOpacity = useRef(new Animated.Value(0)).current;
  const rightIconOpacity = useRef(new Animated.Value(0)).current;
  const upIconOpacity = useRef(new Animated.Value(0)).current;
  const downIconOpacity = useRef(new Animated.Value(0)).current;
  const leftIndicatorWidth = useRef(new Animated.Value(40)).current;
  const rightIndicatorWidth = useRef(new Animated.Value(40)).current;
  const upIndicatorHeight = useRef(new Animated.Value(40)).current;
  const downIndicatorHeight = useRef(new Animated.Value(40)).current;

  const fadeOutIndicators = () => {
    leftIndicatorOpacity.setValue(0);
    rightIndicatorOpacity.setValue(0);
    upIndicatorOpacity.setValue(0);
    downIndicatorOpacity.setValue(0);
    leftIconOpacity.setValue(0);
    rightIconOpacity.setValue(0);
    upIconOpacity.setValue(0);
    downIconOpacity.setValue(0);
    leftIndicatorWidth.setValue(40);
    rightIndicatorWidth.setValue(40);
    upIndicatorHeight.setValue(40);
    downIndicatorHeight.setValue(40);
    // Fade in the background card after indicators are gone
    Animated.timing(backgroundCardOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const preloadImages = async (listings) => {
    console.log('Starting preloadImages with', listings.length, 'listings');
    const imagePromises = listings.map(listing => {
      if (listing.imageUrl) {
        return new Promise((resolve, reject) => {
          console.log('Prefetching image:', listing.imageUrl);
          Image.prefetch(listing.imageUrl)
            .then(() => {
              console.log('Successfully prefetched image:', listing.imageUrl);
              setImagesLoaded(prev => {
                const newCount = prev + 1;
                console.log('Images loaded:', newCount, '/', listings.length);
                return newCount;
              });
              resolve();
            })
            .catch(error => {
              console.error('Error prefetching image:', {
                url: listing.imageUrl,
                error: error.message
              });
              resolve(); // Resolve anyway to not block the process
            });
        });
      }
      return Promise.resolve();
    });

    try {
      await Promise.all(imagePromises);
      console.log('All image prefetch promises completed');
    } catch (error) {
      console.error('Error in preloadImages:', {
        error: error.message,
        stack: error.stack
      });
    }
  };

  const fetchListings = async () => {
    try {
      console.log('Starting to fetch feed for user:', userId);
      setLoading(true);
      
      console.log('Making request to:', `${config.baseUrl}/algo/get-feed-listings/${userId}`);
      const feedResponse = await fetch(`${config.baseUrl}/algo/get-feed-listings/${userId}`);
      
      // if (feedResponse.status === 404) {
      //   console.log('No listings available for new user');
      //   setListings([]);
      //   setEndOfListings(true);
      //   return;
      // }
      
      // if (!feedResponse.ok) {
      //   console.error('Feed response not OK:', feedResponse.status, feedResponse.statusText);
      //   throw new Error('Failed to fetch feed');
      // }
      
      const listingsData = await feedResponse.json();
      console.log('Received feed data:', {
        numberOfListings: listingsData.length,
        firstListing: listingsData[0],
        lastListing: listingsData[listingsData.length - 1]
      });
      
      setListings(listingsData);
      console.log('Listings state updated with', listingsData.length, 'items');
      
      setImagesLoaded(0);
      console.log('Starting image preloading for', listingsData.length, 'listings');
      await preloadImages(listingsData);
      console.log('Image preloading completed');
      
    } catch (error) {
      console.error("Error in fetchListings:", {
        error: error.message,
        stack: error.stack
      });
      setListings([]);
      setEndOfListings(true);
    } finally {
      setLoading(false);
      console.log('Loading state set to false');
    }
  };

  const fetchProfileImage = async (profileId) => {
    if (!profileId || profileImageUrls[profileId]) return;
    
    try {
      imageLoadingStates.current[profileId] = true;
      
      const response = await fetch(`${config.baseUrl}/profile/public-profile-access/${profileId}`);
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

  const fetchProfileDetails = async (profileId) => {
    console.log('Fetching profile details for:', profileId);
    try {
      const response = await fetch(`${config.baseUrl}/profile/public-profile-access/${profileId}`);
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

  const fetchProfileInfo = async (profileId) => {
    console.log('Fetching profile info for:', profileId);
    try {
      const response = await fetch(`${config.baseUrl}/profile/public-profile-access/${profileId}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setSelectedProfile(data);
    } catch (error) {
      console.error("Error fetching profile info:", error);
    }
  };

  const handleProfilePress = (profileId) => {
    if (profileId) {
      fetchProfileDetails(profileId);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    if (listings.length > 0) {
      listings.forEach(listing => {
        if (listing.profile_offerer_id) {
          fetchProfileImage(listing.profile_offerer_id);
        }
      });
    }
  }, [listings]);

  const handleSwipeLeft = async (index) => {
    try {
      const response = await fetch(`${config.baseUrl}/feed/swipe-left/${listings[index].id}?uid=${userId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to register dislike');
      }

      const data = await response.json();
      console.log('Disliked:', listings[index].title);
    } catch (error) {
      console.error("Error registering dislike:", error);
    }
  };

  const handleSwipeRight = async (index) => {
    try {
      const response = await fetch(`${config.baseUrl}/feed/swipe-right/${listings[index].id}?uid=${userId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to register like');
      }

      const data = await response.json();
      console.log('Liked:', listings[index].title);
    } catch (error) {
      console.error("Error registering like:", error);
    }
  };

  const handleSwipeDown = async (index) => {
    try {
      const response = await fetch(`${config.baseUrl}/feed/swipe-down/${listings[index].id}?uid=${userId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to start conversation');
      }

      const data = await response.json();
      console.log('Started conversation with:', listings[index].title);

      // Store the conversation data and show the success modal
      setNewConversationData({
        conversationId: data.conversation_id,
        listingId: listings[index].id,
        otherUserId: listings[index].profile_offerer_id,
        isOfferer: false
      });
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

  const handleSwipeUp = (index) => {
    console.log('Expanded listing:', listings[index].title);
    const tags = listings[index]?.tags ? 
      (typeof listings[index].tags === 'string' ? listings[index].tags.split('%20') : listings[index].tags) 
      : [];
    setCurrListingTags(tags);
    setExpandedListingModalVisible(true);
    setCardIndex(index);
    setModalImageLoading(true);
    if (listings[index]?.profile_offerer_id) {
      fetchProfileInfo(listings[index].profile_offerer_id);
    }
  };

  const allImagesLoaded = imagesLoaded === listings.length && listings.length > 0;

  const refreshFeed = () => {
    setEndOfListings(false);
    setCardIndex(0);
    // Reset the swiper to show the first card again
    if (swiperRef.current) {
      swiperRef.current.jumpToCardIndex(0);
    }
  };

  const handleSwipeAll = () => {
    setEndOfListings(true);
    fadeOutIndicators();
  };

  return (
    // <ImageBackground source={backgroundPattern} style={styles.container} resizeMode="cover">
      <SafeAreaView style={{flex: 1}}>
        <Animated.View style={[
          styles.swipeIndicator,
          styles.leftSwipeIndicator,
          {
            opacity: leftIndicatorOpacity,
            borderTopRightRadius: 500,
            borderBottomRightRadius: 500,
            width: leftIndicatorWidth
          }
        ]}>
          <Animated.View style={[styles.overlayIcon, styles.leftIcon, { opacity: leftIconOpacity }]}>
            <Ionicons name="thumbs-up-sharp" size={50} color="#4CAF50" />
          </Animated.View>
        </Animated.View>
        <Animated.View style={[
          styles.swipeIndicator,
          styles.rightSwipeIndicator,
          {
            opacity: rightIndicatorOpacity,
            borderTopLeftRadius: 500,
            borderBottomLeftRadius: 500,
            width: rightIndicatorWidth
          }
        ]}>
          <Animated.View style={[styles.overlayIcon, styles.rightIcon, { opacity: rightIconOpacity }]}>
            <Ionicons name="thumbs-down-sharp" size={50} color="#F44336" />
          </Animated.View>
        </Animated.View>
        <Animated.View style={[
          styles.swipeIndicator,
          styles.downSwipeIndicator,
          {
            opacity: downIndicatorOpacity,
            borderBottomLeftRadius: 500,
            borderBottomRightRadius: 500,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            height: downIndicatorHeight
          }
        ]}>
          <Animated.View style={[
            styles.overlayIcon, 
            styles.downIcon, 
            { 
              opacity: downIconOpacity,
              top: Animated.subtract(downIndicatorHeight, 40)
            }
          ]}>
            <Ionicons name="chatbubble-ellipses" size={70} color="#FFD700" />
          </Animated.View>
        </Animated.View>
        <Animated.View style={[
          styles.swipeIndicator,
          styles.upSwipeIndicator,
          {
            opacity: upIndicatorOpacity,
            borderTopLeftRadius: 500,
            borderTopRightRadius: 500,
            height: upIndicatorHeight
          }
        ]}>
          <Animated.View style={[
            styles.overlayIcon, 
            styles.upIcon, 
            { 
              opacity: upIconOpacity,
              bottom: Animated.subtract(upIndicatorHeight, 30)
            }
          ]}>
            <Ionicons name="information-circle-outline" size={70} color="#2196F3" />
          </Animated.View>
        </Animated.View>
        {endOfListings ? (
          <View style={styles.endOfListingsContainer}>
            <Text style={styles.endOfListingsText}>End of listings reached.</Text>
            <Text style={styles.endOfListingsSubtext}>Would you like to see them again?</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={refreshFeed}
            >
              <Text style={styles.refreshButtonText}>Show Listings Again</Text>
            </TouchableOpacity>
          </View>
        ) : loading || !allImagesLoaded ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator
              size="large"
              color="#846425"
            />
            <Text style={{ marginTop: 10, color: '#846425', fontFamily: 'work_sans' }}>
              Loading images... {imagesLoaded}/{listings.length}
            </Text>
          </View>
        ) : listings.length > 0 ? (
          <Carousel
            ref={swiperRef}
            data={listings}
            width={width}
            height={height}
            mode="horizontal-stack"
            modeConfig={{ stackInterval: 30, snapDirection: 'left' }}
            onProgressChange={(offset) => {
              // You may update indicator animations here based on offset info
            }}
            onSnapToItem={(index) => {
              // Called after swipe completes
              setCardIndex(index);
              // Determine swipe direction and trigger your handlers
              // Track prevIndex:
              const direction = index > prevIndex ? 'right' : index < prevIndex ? 'left' : 'snap';
              if (direction === 'left') handleSwipeLeft(index);
              if (direction === 'right') handleSwipeRight(index);
              // For up/down interactions, capture gesture better via onGesture event or separate overlay
              setPrevIndex(index);
            }}
            customAnimation={{
              type: 'timing',
              config: { duration: 300 },
            }}
            renderItem={({ item, index }) => (
              // Your card UI, similar to before
              <Animated.View style={[styles.feedContent, { opacity: index === cardIndex ? 1 : backgroundCardOpacity }]}>
                {/* ... content including Image, profile, handleProfilePress ... */}
              </Animated.View>
            )}
          />

          // <Swiper 
          //   ref={swiperRef}
          //   cards={listings}
          //   cardIndex={cardIndex}
          //   renderCard={(item, index) => {
          //     return item ? (
          //       <Animated.View style={[
          //         styles.feedContent,
          //         { opacity: index === cardIndex ? 1 : backgroundCardOpacity }
          //       ]}>
          //         <View style={styles.listingImage}>
          //           {item.imageUrl ? (
          //             <>
          //               {imageLoadingStates.current[item.profile_offerer_id] && (
          //                 <View style={styles.loadingOverlay}>
          //                   <ActivityIndicator size="large" color="#846425" />
          //                 </View>
          //               )}
          //               <Image
          //                 source={{ uri: item.imageUrl }}
          //                 style={[
          //                   styles.lImage,
          //                   { opacity: imageLoadingStates.current[item.profile_offerer_id] ? 0 : 1 }
          //                 ]}
          //                 resizeMode="cover"
          //                 onLoadStart={() => {
          //                   imageLoadingStates.current[item.profile_offerer_id] = true;
          //                 }}
          //                 onLoadEnd={() => {
          //                   imageLoadingStates.current[item.profile_offerer_id] = false;
          //                 }}
          //               />
          //             </>
          //           ) : (
          //             <Text style={styles.listingImageText}>Listing Image</Text>
          //           )}
          //         </View>
          //         <TouchableOpacity 
          //           style={styles.profilePictureContainer}
          //           onPress={() => handleProfilePress(item.profile_offerer_id)}
          //         >
          //           <View style={styles.profilePicture}>
          //             <Image
          //               source={item.profile_offerer_id && profileImageUrls[item.profile_offerer_id] 
          //                 ? { uri: profileImageUrls[item.profile_offerer_id] } 
          //                 : require("../assets/profilestockphoto.jpg")}
          //               style={[
          //                 styles.pImage,
          //                 { opacity: imageLoadingStates.current[item.profile_offerer_id] ? 0 : 1 }
          //               ]}
          //               onError={(error) => {
          //                 console.log('Profile image loading error:', error.nativeEvent.error);
          //                 console.log('Failed URL:', profileImageUrls[item.profile_offerer_id]);
          //                 imageLoadingStates.current[item.profile_offerer_id] = false;
          //               }}
          //               onLoad={() => {
          //                 console.log('Profile image loaded successfully');
          //                 imageLoadingStates.current[item.profile_offerer_id] = false;
          //               }}
          //               resizeMode="cover"
          //               onLoadStart={() => {
          //                 console.log('Starting to load profile image');
          //                 imageLoadingStates.current[item.profile_offerer_id] = true;
          //               }}
          //             />
          //           </View>
          //         </TouchableOpacity>
          //         <View style={styles.listingInfo}>
          //           <Text style={styles.listingInfoText}>
          //             {item.title || "Abbreviated Listing Info"}
          //           </Text>
          //         </View>
          //       </Animated.View>
          //     ) : (
          //       <View>
          //         <Text style={styles.listingInfoText}>Loading...</Text>
          //       </View>
          //     );
          //   }}
          //   onSwipedLeft={handleSwipeLeft}
          //   onSwipedRight={handleSwipeRight}
          //   onSwipedTop={(index) => {
          //     console.log('Up swipe detected');
          //   }}
          //   onSwipedBottom={handleSwipeDown}
          //   onSwiping={(x, y) => {
          //     // Reset background card opacity when starting to swipe
          //     backgroundCardOpacity.setValue(0);
              
          //     // Calculate the absolute values of x and y movement
          //     const absX = Math.abs(x);
          //     const absY = Math.abs(y);
              
          //     // Log initial movement
          //     // console.log('Swipe movement:', { x, y, absX, absY });
              
          //     // Check for up swipe threshold
          //     if (y < 0) {
          //       // console.log('Up swipe:', absY, absY > 250);
          //       if (absY > 160) {
          //         // If we've reached the threshold for an up swipe
          //         handleSwipeUp(cardIndex);
          //         return;
          //       }
          //     }
              
          //     // Determine which direction has the larger movement
          //     if (absX > absY) {
          //       // Horizontal swipe is dominant
          //       if (x > 0) {
          //         // Swiping right
          //         const rightOpacity = Math.min(absX / 50, 1);
          //         const rightWidth = 40 + Math.min(absX / 2, 60); // Start at 40, expand up to 100
          //         leftIconOpacity.setValue(rightOpacity);
          //         leftIndicatorOpacity.setValue(Math.min(absX / 100, 1));
          //         leftIndicatorWidth.setValue(rightWidth);
          //         rightIndicatorOpacity.setValue(0);
          //         rightIconOpacity.setValue(0);
          //         rightIndicatorWidth.setValue(40);
          //         upIndicatorOpacity.setValue(0);
          //         upIconOpacity.setValue(0);
          //         downIndicatorOpacity.setValue(0);
          //         downIconOpacity.setValue(0);
          //       } else if (x < 0) {
          //         // Swiping left
          //         const leftOpacity = Math.min(absX / 50, 1);
          //         const leftWidth = 40 + Math.min(absX / 2, 60); // Start at 40, expand up to 100
          //         rightIconOpacity.setValue(leftOpacity);
          //         rightIndicatorOpacity.setValue(Math.min(absX / 100, 1));
          //         rightIndicatorWidth.setValue(leftWidth);
          //         leftIndicatorOpacity.setValue(0);
          //         leftIconOpacity.setValue(0);
          //         leftIndicatorWidth.setValue(40);
          //         upIndicatorOpacity.setValue(0);
          //         upIconOpacity.setValue(0);
          //         downIndicatorOpacity.setValue(0);
          //         downIconOpacity.setValue(0);
          //       }
          //     } else {
          //       // Vertical swipe is dominant
          //       if (y > 0) {
          //         // Swiping down
          //         const downOpacity = Math.min(absY / 50, 1);
          //         const downHeight = 40 + Math.min(absY / 2, 60); // Start at 40, expand up to 100
          //         downIconOpacity.setValue(downOpacity);
          //         downIndicatorOpacity.setValue(Math.min(absY / 100, 1));
          //         downIndicatorHeight.setValue(downHeight);
          //         upIndicatorOpacity.setValue(0);
          //         upIconOpacity.setValue(0);
          //         upIndicatorHeight.setValue(40);
          //         leftIndicatorOpacity.setValue(0);
          //         leftIconOpacity.setValue(0);
          //         rightIndicatorOpacity.setValue(0);
          //         rightIconOpacity.setValue(0);
          //       } else if (y < 0) {
          //         // Swiping up
          //         const upOpacity = Math.min(absY / 50, 1);
          //         const upHeight = 40 + Math.min(absY / 2, 40); // Start at 40, expand up to 80
          //         upIconOpacity.setValue(upOpacity);
          //         upIndicatorOpacity.setValue(Math.min(absY / 100, 1));
          //         upIndicatorHeight.setValue(upHeight);
          //         downIndicatorOpacity.setValue(0);
          //         downIconOpacity.setValue(0);
          //         downIndicatorHeight.setValue(40);
          //         leftIndicatorOpacity.setValue(0);
          //         leftIconOpacity.setValue(0);
          //         rightIndicatorOpacity.setValue(0);
          //         rightIconOpacity.setValue(0);
          //       }
          //     }
          //   }}
          //   onSwipedAll={handleSwipeAll}
          //   onTapCard={() => fadeOutIndicators()}
          //   onSwipedAborted={() => {
          //     console.log('Swipe aborted');
          //     fadeOutIndicators();
          //   }}
          //   onSwiped={(index, direction) => {
          //     console.log('Card swiped:', { 
          //       index, 
          //       direction, 
          //       cardIndex,
          //       backgroundOpacity: backgroundCardOpacity._value
          //     });
          //     fadeOutIndicators();
          //     if (direction === 'left') handleSwipeLeft(index);
          //     if (direction === 'right') handleSwipeRight(index);
          //     if (direction === 'bottom') handleSwipeDown(index);
          //     if (direction === 'top') {
          //       handleSwipeUp(index);
          //       return;
          //     }
          //     setCardIndex((prevIndex) => (prevIndex + 1) % listings.length);
          //     currentCardOpacity.setValue(1);
          //     backgroundCardOpacity.setValue(1);
          //     console.log('After swipe:', { 
          //       newCardIndex: cardIndex,
          //       backgroundOpacity: backgroundCardOpacity._value
          //     });
          //   }}
          //   stackSize={2}
          //   stackScale={100}
          //   stackSeparation={0}
          //   infinite={false}
          //   containerStyle={{backgroundColor: 'transparent'}}
          //   horizontalSwipe={true}
          //   verticalSwipe={true}
          //   disableTopSwipe={true}
          //   disableBottomSwipe={expandedListingModalVisible}
          //   disableLeftSwipe={expandedListingModalVisible}
          //   disableRightSwipe={expandedListingModalVisible}
          //   overlayLabels={{}}
          //   cardStyle={{ backgroundColor: 'transparent' }}
          //   cardContainerStyle={{ backgroundColor: 'transparent' }}
          //   overlayLabelsStyle={{
          //     fontSize: 45,
          //     fontWeight: 'bold',
          //     borderRadius: 10,
          //     padding: 10,
          //     overflow: 'hidden',
          //   }}
          //   animateOverlayLabelsOpacity={false}
          //   animateCardOpacity={true}
          //   animateCardOpacityDuration={100}
          //   animateOverlayLabelsOpacityDuration={100}
          // />


        ) : (
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No listings available
          </Text>
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
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setExpandedListingModalVisible(false)}
              >
                <Ionicons name="chevron-back-sharp" size={30} color="#846425" />
              </TouchableOpacity>
              <ScrollView contentContainerStyle={{paddingBottom: 20, paddingTop: 30}}>
                <View>
                  <Text style={styles.modalTitle}>Title:</Text>
                  <Text style={styles.longDescription}>{listings[cardIndex]?.title}</Text>
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
                      source={listings[cardIndex]?.imageUrl ? {uri: listings[cardIndex].imageUrl} : require("../assets/profilestockphoto.jpg")}
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
                    {listings[cardIndex]?.long_description || "No description provided"}
                  </Text>
                </View>

                <View>
                  <Text style={styles.modalTitle}>Tags:</Text>
                  {currListingTags.length > 0 ? (
                    <View style={styles.selectedTagsSection}>
                      <FlatList
                        data={currListingTags}
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
                      <Text style={styles.listingDetailValue}>{listings[cardIndex]?.listing_type || "Not specified"}</Text>
                    </View>
                    <View style={styles.listingDetailRow}>
                      <Text style={styles.listingDetailLabel}>Transaction Type:</Text>
                      <Text style={styles.listingDetailValue}>{listings[cardIndex]?.transaction_type || "Not specified"}</Text>
                    </View>
                    <View style={styles.listingDetailRow}>
                      <Text style={styles.listingDetailLabel}>Price:</Text>
                      <Text style={styles.listingDetailValue}>${listings[cardIndex]?.price || "0"}</Text>
                    </View>
                  </View>
                </View>

                <View>
                  <Text style={styles.modalTitle}>Posted By:</Text>
                  <Text style={styles.longDescription}>
                    {selectedProfile ? `${selectedProfile.fname} ${selectedProfile.lname}` : "Loading..."}
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

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
                    style={styles.profileImage} 
                    onError={(error) => {
                      console.log('Profile image loading error:', error.nativeEvent.error);
                    }}
                    resizeMode="cover"
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
                        onPress={() => {
                          setExpandedListingModalVisible(true);
                          setCardIndex(listings.findIndex(listing => listing.id === item.id));
                        }}
                      >
                        <Image
                          source={{ uri: item.imageUrl }}
                          style={styles.modalListingImage}
                          onError={(error) => {
                            console.log('Listing image loading error:', error.nativeEvent.error);
                          }}
                          resizeMode="cover"
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
      </SafeAreaView>
    // </ImageBackground>
  );  
};

export default Feed;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  swipeIndicator: {
    position: 'absolute',
    zIndex: 1000,
  },
  leftSwipeIndicator: {
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
    backgroundColor: '#4CAF50',
  },
  rightSwipeIndicator: {
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
    backgroundColor: '#F44336',
  },
  downSwipeIndicator: {
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#FFD700',
  },
  upSwipeIndicator: {
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#2196F3',
  },
  feedContent: {
    backgroundColor: 'transparent',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 35,
    width: '100%',
    height: '85%',
    borderRadius: 5,
  }, 
  listingImage: {
    // flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
    borderRadius: 5,
  },
  lImage: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  listingImageText: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: 'bold',
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
    paddingTop: 40,
    borderRadius: 10,
    width: "100%",
    maxHeight: "90%",
    alignSelf: "center",
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
  backButton: {
    position: 'absolute',
    top: 20,
    left: 0,
    padding: 10,
    zIndex: 1
  },
  profilePictureContainer: {
    position: 'absolute',
    top: 20, 
    right: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderColor: '#fff',
    borderWidth: 2,
  },
  profilePicture: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff', 
    borderRadius: 40, 
  },
  pImage: {
    width: 76,
    height: 76,
  },
  listingInfo: {
    position: 'absolute', // Overlay on top of the image
    bottom: 0, // Stick to the bottom
    left: 0, // Ensure it spans the full width
    width: '100%', // Full width of the parent container
    height: 94, // Maintain the fixed height
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent blue background
    borderBottomLeftRadius: 5,  // Round only bottom-left
    borderBottomRightRadius: 5, // Round only bottom-right
  },
  listingInfoText: {
    color: '#fff', 
    fontSize: 25,
    fontFamily: 'work_sans',
    fontWeight: 'bold',
  },
  overlayIcon: {
    position: 'absolute',
    zIndex: 1002,
    backgroundColor: 'white',
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftIcon: {
    right: -45,
    top: '15%',
    transform: [{ translateY: -30 }],
  },
  rightIcon: {
    left: -45,
    top: '15%',
    transform: [{ translateY: -30 }],
  },
  upIcon: {
    bottom: 30,
    left: '50%',
    transform: [{ translateX: '-50%' }],
  },
  downIcon: {
    top: 40,
    left: '50%',
    transform: [{ translateX: '-50%' }],
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
  modalBackButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 10,
    paddingTop: 20,
    zIndex: 1,
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
  endOfListingsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  endOfListingsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#846425',
    fontFamily: 'work_sans',
    marginBottom: 10,
    textAlign: 'center',
  },
  endOfListingsSubtext: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'work_sans',
    marginBottom: 20,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#846425',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'work_sans',
    fontWeight: 'bold',
  },
});
