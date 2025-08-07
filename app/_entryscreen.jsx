import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const EntryScreen = ({ navigateTo }) => {

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Marketplace App!</Text>
      <Text style={styles.subtitle}>This screen is for testing purposes only.</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigateTo('Main')}>
        <Text style={styles.buttonText}>Go to Feed</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigateTo('Login')}>
        <Text style={styles.buttonText}>Start Onboarding</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigateTo('FontCheck')}>
        <Text style={styles.buttonText}>FontCheck</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigateTo('POC')}>
        <Text style={styles.buttonText}>POC</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EntryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'work_sans',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    fontFamily: 'work_sans',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6200EE',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
