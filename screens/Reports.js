import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, Button } from 'react-native';
import * as ImagePicker from "expo-image-picker";
import { storage, database, auth } from '../config/firebase';

const Reports = () => {
    const [pastReports, setPastReports] = useState([]);
    const [images, setImages] = useState([]);
    const [weight, setWeight] = useState('');
    const [customFields, setCustomFields] = useState([]);
    const [newCustomField, setNewCustomField] = useState('');

    const fetchPastReports = async () => {
        const userId = auth.currentUser.uid;
        const reportsRef = database.ref(`reports/${userId}`);
        const snapshot = await reportsRef.once('value');
        const reportsData = snapshot.val();

        if (reportsData) {
        const reportsArray = Object.entries(reportsData).map(([key, value]) => ({
            id: key,
            ...value,
        }));
        return reportsArray;
        }

        return [];
    };

    useEffect(() => {
        fetchPastReports().then((data) => {
        setPastReports(data);
        });
    }, []);

    const selectImage = () => {
        const options = {
        title: 'Select Image',
        storageOptions: {
            skipBackup: true,
            path: 'images',
        },
        };

        ImagePicker.showImagePicker(options, (response) => {
        if (response.didCancel) {
            console.log('User cancelled image picker');
        } else if (response.error) {
            console.log('ImagePicker Error: ', response.error);
        } else {
            if (images.length < 5) {
            setImages([...images, response.uri]);
            }
        }
        });
    };

    const addCustomField = () => {
        if (customFields.length < 10) {
        setCustomFields([...customFields, newCustomField]);
        setNewCustomField('');
        }
    };

    const removeCustomField = (index) => {
        const newCustomFields = customFields.filter((_, i) => i !== index);
        setCustomFields(newCustomFields);
    };
    const saveReport = async ({ images, weight, customFields }) => {
        const userId = auth.currentUser.uid;
        const reportsRef =database.ref(`reports/${userId}`);

        // Upload images to Firebase Storage and get the download URLs
        const uploadPromises = images.map(async (imageUri, index) => {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const imageRef = storage.ref().child(`reports/${userId}/${Date.now()}-${index}`);
        await imageRef.put(blob);
        const downloadUrl = await imageRef.getDownloadURL();
        return downloadUrl;
        });

        const imageUrls = await Promise.all(uploadPromises);

        // Save the report data to Firebase Database
        const newReportRef = reportsRef.push();
        await newReportRef.set({
        images: imageUrls,
        weight: parseFloat(weight),
        customFields,
        date: new Date().toISOString(),
        });

        return newReportRef.key;
    };

    const submitReport = () => {
        saveReport({ images, weight, customFields }).then(() => {
        // Refresh the pastReports state or navigate to another screen
        fetchPastReports().then((data) => {
            setPastReports(data);
        });
        });
    };


    return (
        <View style={styles.container}>
        {/* Report creation form */}
        <View style={styles.formContainer}>
            <TouchableOpacity style={styles.selectImageButton} onPress={selectImage}>
            <Text>Select Image</Text>
            </TouchableOpacity>
            <View style={styles.imageContainer}>
            {images.map((image, index) => (
                <Image key={index} source={{ uri: image }} style={styles.previewImage} />
            ))}
            </View>
            <TextInput
            style={styles.weightInput}
            keyboardType="numeric"
            placeholder="Enter your weight"
            onChangeText={text => setWeight(text)}
            value={weight}
            />
            <View style={styles.customFieldsContainer}>
            {customFields.map((field, index) => (
                <View key={index} style={styles.customField}>
                <Text>{field}</Text>
                <TouchableOpacity onPress={() => removeCustomField(index)}>
                    <Text>Remove</Text>
                </TouchableOpacity>
                </View>
            ))}
            </View>
            <TextInput
            style={styles.customFieldInput}
            placeholder="Enter a custom field"
            onChangeText={text => setNewCustomField(text)}
            value={newCustomField}
            />
            <Button title="Add Custom Field" onPress={addCustomField} />
            <Button title="Submit Report" onPress={submitReport} />
        </View>

                {/* List of past reports */}
                <FlatList
            data={pastReports}
            renderItem={({ item }) => (
            <View style={styles.reportItem}>
                <Text>Date: {item.date}</Text>
                <Text>Weight: {item.weight} kg</Text>
                <Text>Last Report Weight: {item.lastWeight} kg</Text>
                <Text>Percentage Change: {item.percentageChange}%</Text>
                {item.customFields.map((field, index) => (
                <Text key={index}>{field}</Text>
                ))}
            </View>
            )}
            keyExtractor={(item, index) => index.toString()}
        />
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  selectImageButton: {
    backgroundColor: '#DDDDDD',
    padding: 10,
    marginBottom: 10,
  },
  imageContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  previewImage: {
    width: 60,
    height: 60,
    marginRight: 5,
  },
  weightInput: {
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 5,
  },
  customFieldsContainer: {
    marginBottom: 10,
  },
  customField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  customFieldInput: {
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 5,
  },
  reportItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
});

export default Reports;

