import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import colors from '../colors';
import { Entypo } from '@expo/vector-icons';

const Home = () => {
    const navigation = useNavigation();
    const [userData, setUserData] = useState({});

    useEffect(() => {
        // Fetch the user data here and set it in the 'userData' state
        // For example:
        // fetchUserData().then((data) => {
        //   setUserData(data);
        // });
    }, []);

    return (
        <View style={styles.container}>
        <Image
            source={{ uri: userData.progressPicture }}
            style={styles.progressPicture}
        />
        <Text style={styles.weightText}>Weight: {userData.weight} lbs</Text>
        {userData.targetWeight && (
            <Text style={styles.targetWeightText}>
            Target Weight: {userData.targetWeight} lbs
            </Text>
        )}
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPicture: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 20,
  },
  weightText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  targetWeightText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Home;
