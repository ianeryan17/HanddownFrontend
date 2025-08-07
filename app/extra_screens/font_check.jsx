import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';

const FontCheck = () => {
  return (
    <SafeAreaView style={styles.safeArea}>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.lazyDogText}>Welcome to your React Native App!</Text>
        <Text style={styles.openSansText}>Welcome to your React Native App!</Text>
        <Text style={styles.nunitoText}>Welcome to your React Native App!</Text>
        <Text style={styles.loraText}>Welcome to your React Native App!</Text>
        <Text style={styles.quicksandText}>Welcome to your React Native App!</Text>
        <Text style={styles.workSansText}>Welcome to your React Native App!</Text>
      </View>
    </SafeAreaView>
  );
};

export default FontCheck;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', // Same background color for the safe area
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  lazyDogText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'work_sans',
    marginBottom: 10,
  },
  openSansText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'open_sans',
    marginBottom: 10,
  },
  nunitoText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'work_sans',
    marginBottom: 10,
  },
  loraText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'lora',
    marginBottom: 10,
  },
  quicksandText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'quicksand',
    marginBottom: 10,
  },
  workSansText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'work_sans',
    marginBottom: 10,
  },
});
