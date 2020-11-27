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
    const[salahTimesToday, setSalahTimesToday] = useState({})
    const [locationHuman, setLocationHuman] = useState("")

    
    const locationAPIKey = process.env.LOCATION_API_KEY

    const getLocation = useCallback(() => {
        if (Platform.OS === 'android' && !Constants.isDevice) {
            setErrorMessage(
                'Oops, this will not work on Sketch in an Android emulator. Try it on your device!'
            );
        } else {
            Location.getPermissionsAsync().then(res => {
                if (res.status == 'granted') {
                    Location.getCurrentPositionAsync().then(result => {
                        console.log("this is the result of getting GeoLocation", result)
                        setLocation(result)
                        // console.log(new Date().getTime())
                        console.log("location", result.timestamp)
                        getSalahTimes(result.timestamp, result.coords.longitude, result.coords.latitude);
                        getRevLocation(result.coords.latitude,result.coords.longitude)
                    }).catch(" an error with getting geolocation", err)
                }
            }).catch(err=>{
                console.log("an error with Geolocation permissions", err)
            })
        }
    }, []);//get location

    const getSalahTimes = useCallback( (timestamp, longitude, latitude) => {
        fetch(`http://api.aladhan.com/v1/timings/${timestamp}?latitude=${longitude}&longitude=${latitude}&method=2`).then(result => {
            result.json().then(res=>{
                console.log(res.data.timings)
                setSalahTimesToday(res.data.timings) //sets salah times for today
                
            }).catch(err=>{
                console.log("there's been an error with prayertime fetch2", err)
            })
        }).catch(err=>{console.warn(err)})
    }, []) //gets initial salah times for that day and place

    const getRevLocation = useCallback((lat, lon)=>{
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${locationAPIKey}`).then(result=>{
            result.json().then(res=>{
                console.log(res.results);
                console.log(res.results[3].formatted_address)//the approximate place of user, neighbourhood
                setLocationHuman(res.results[3].formatted_address)
            })
        })
    },[location]); //get human location details for latitude and longitude of location

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