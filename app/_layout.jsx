import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // Using Ionicons as an example
import { useFonts } from 'expo-font';
import { ActivityIndicator, View } from 'react-native';
import Feed from './feed'; // Assuming Feed is in the same folder
import FSearch from './search'; // Create this file for your search screen
import AddListing from './addlisting'; // Create this file for your addlisting screen
import MessagingFunctionality from './messagingstack';
import Profile from './profile'; // Create this file for your profile screen
import EntryScreen from './_entryscreen';
import Login from './onboarding/login';
import ForgetPassword from './onboarding/forget-password';
import SignUp from './onboarding/signup';
import EmailAuth from './onboarding/email-auth';
import UserInfo from './onboarding/user-info';
import UserPhoto from './onboarding/user-photo';
import InterestTags from './onboarding/interest-tags';
import GivingTags from './onboarding/giving-tags';
import ResetEmailAuth from './onboarding/reset-email-auth';
import ResetPassword from './onboarding/reset-password';
import FontCheck from './extra_screens/font_check';
import POC from './extra_screens/poc';
import { UserProvider } from './usercontext'; // Import the provider
import { MessagingProvider } from './messagingcontext';
import LoadingManager from './loadingmanager';
import MessagingHome from './messaginghome';
import ParkingLot from './parkinglot';
import IndividualMessage from './individualmessage';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2aa4eb', // Active tab color
        tabBarInactiveTintColor: '#8e8e8e', // Inactive tab color
      }}
    >
      <Tab.Screen
        name="Feed"
        component={Feed}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
          tabBarLabel: 'Feed',
          headerShown: false,
          title: 'Feed Window',
        }}
      />
      <Tab.Screen
        name="Search"
        component={FSearch}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" color={color} size={size} />
          ),
          tabBarLabel: 'Search',
          headerShown: false,
          title: 'Search Window',
        }}
      />
      <Tab.Screen
        name="AddListing"
        component={AddListing}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" color={color} size={size} />
          ),
          tabBarLabel: 'Add Listing',
          headerShown: false,
          title: 'Add Listing Window',
        }}
      />
      <Tab.Screen
        name="Messaging"
        component={MessagingFunctionality}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" color={color} size={size} />
          ),
          tabBarLabel: 'Messages',
          headerShown: false,
          title: 'Messaging Window',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
          tabBarLabel: 'Profile',
          headerShown: false,
          title: 'Profile Window',
        }}
      />
    </Tab.Navigator>
  );
};

const AppContent = () => {
  const [screen, setScreen] = useState('Login');
  const [counter, setCounter] = useState(0);

  const navigateTo = (nextScreen, params) => {
    setScreen(nextScreen);
  };

  const [fontsLoaded] = useFonts({
    "lazy_dog": require("../assets/fonts/lazy_dog.ttf"),
    "open_sans": require("../assets/fonts/open_sans.ttf"),
    "nunito": require("../assets/fonts/nunito.ttf"),
    "lora": require("../assets/fonts/lora.ttf"),
    "quicksand": require("../assets/fonts/quicksand.ttf"),
    "work_sans": require("../assets/fonts/work_sans.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (counter == 0) {
    console.log("loaded");
    setCounter(1);
  }

  return (
    <LoadingManager>
      <>
        {screen === 'EntryScreen' && <EntryScreen navigateTo={navigateTo} />}
        {screen === 'Login' && <Login navigateTo={navigateTo} />}
        {screen === 'ForgetPassword' && <ForgetPassword navigateTo={navigateTo} />}
        {screen === 'ResetEmailAuth' && <ResetEmailAuth navigateTo={navigateTo} />}
        {screen === 'ResetPassword' && <ResetPassword navigateTo={navigateTo} />}
        {screen === 'SignUp' && <SignUp navigateTo={navigateTo} />}
        {screen === 'EmailAuth' && <EmailAuth navigateTo={navigateTo} />}
        {screen === 'UserInfo' && <UserInfo navigateTo={navigateTo} />}
        {screen === 'UserPhoto' && <UserPhoto navigateTo={navigateTo} />}
        {screen === 'InterestTags' && <InterestTags navigateTo={navigateTo} />}
        {screen === 'GivingTags' && <GivingTags navigateTo={navigateTo} />}
        {screen === 'POC' && <POC navigateTo={navigateTo} />}
        {screen === 'FontCheck' && <FontCheck navigateTo={navigateTo} />}
        {screen === 'Main' && <TabNavigator />}
        {screen === 'MessagingHome' && <MessagingHome navigateTo={navigateTo} />}
        {screen === 'ParkingLot' && <ParkingLot navigateTo={navigateTo} />}
        {screen === 'IndividualMessage' && <IndividualMessage navigateTo={navigateTo} />}
      </>
    </LoadingManager>
  );
};

const RootLayout = () => {
  return (
    <UserProvider>
      <MessagingProvider>
        <AppContent />
      </MessagingProvider>
    </UserProvider>
  );
};

export default RootLayout;
