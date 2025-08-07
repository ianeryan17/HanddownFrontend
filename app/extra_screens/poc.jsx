import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";

export default function POC() {
  const [imageUri, setImageUri] = useState(null);

  const fetchImage = async (listingId) => {
    try {
      const response = await fetch(`http://10.243.62.204:8000/listings/get-listing/${listingId}`);
      const data = await response.json();
  
      if (data.imageUrl) {
        setImageUri(data.imageUrl);
      } else {
        console.error("Error: Image URL not found.");
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const closeImage = () => {
    setImageUri(null);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => fetchImage("FxviZDunH2dogL0c54Ps")}>
        <Text style={styles.buttonText}>Fetch Image 1</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => fetchImage("6QWaFwpuNrXk4KTKo5cD")}>
        <Text style={styles.buttonText}>Fetch Image 2</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => fetchImage("j4UzyiNNiqny9TCANcix")}>
        <Text style={styles.buttonText}>Fetch Image 3</Text>
      </TouchableOpacity>

      {imageUri && (
        <>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <TouchableOpacity style={styles.closeButton} onPress={closeImage}>
            <Text style={styles.closeButtonText}>Close Image</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#ffffff",
    borderColor: "#000000",
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  image: {
    marginTop: 20,
    width: 100,
    height: 100,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#ff0000",
    borderColor: "#000000",
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
