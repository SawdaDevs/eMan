import React, { useState, useCallback, useEffect } from 'react'
import { View, Text, SafeAreaView, StyleSheet, FlatList, Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
// import { FlatList } from 'react-native-gesture-handler';
const initCurrentDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDate()
const initCurrentDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay()
const initCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getMonth()
const initCurrentYear = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getFullYear()
const initFirstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay()
const initNumberofDays = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const salahNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]


const Home = () => {
    //need date and time now
    //get time for next salah
    //click on something and show whole month?
    //change location
    const [currentDate, changeCurrentDate] = useState(initCurrentDate);
    const [currentDay, changeCurrentDay] = useState(initCurrentDay);
    const [currentMonth, changeCurrentMonth] = useState(initCurrentMonth);
    const [currentYear, changeYear] = useState(initCurrentYear);
    const [currentFirstOfMonth, changeFirstOfMonth] = useState(initFirstOfMonth);
    const [currentNumberOfDays, changeNumberofDays] = useState(initNumberofDays);
    const [location, setLocation] = useState(null)
    const [errorMessage, setErrorMessage] = useState("Oops, something went wrong!");


    const getLocation = useCallback(() => {
        if (Platform.OS === 'android' && !Constants.isDevice) {
            setErrorMessage(
                'Oops, this will not work on Sketch in an Android emulator. Try it on your device!'
            );
        } else {
            (async () => {
                let { status } = await Location.requestPermissionsAsync();
                if (status !== 'granted') {
                    setErrorMessage('Permission to access location was denied');
                }

                let location = await Location.getCurrentPositionAsync({});
                setLocation(location);
                console.log(location)
            })();
        }

    }, []);
    useEffect(() => {
        getLocation();
    }, [])
    return (
        <View>
            <Text>Welcome  to eman</Text>
        </View>
    );
};

export default Home;