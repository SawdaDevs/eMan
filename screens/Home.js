import React, { useState, useCallback, useEffect } from 'react'
import { View, Text, SafeAreaView, StyleSheet, FlatList, Platform,RefreshControl } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import Constants from 'expo-constants';
import * as Location from 'expo-location';

// import { FlatList } from 'react-native-gesture-handler';
let currentDateTime = new Date()
const initCurrentDate = new Date().getDate()
const initCurrentDay = new Date(new Date().getFullYear(), new Date().getMonth()).getDay()
const initCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth()).getMonth() + 1
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
    const [salahTimesToday, setSalahTimesToday] = useState({})
    const [locationHuman, setLocationHuman] = useState("")
    const [initCurrentSeconds, changeCurrentSeconds] = useState(new Date().getUTCSeconds())
    const [initCurrentMinutes, changeCurrentMinutes] = useState(new Date().getMinutes())
    const [initCurrentHours, changeCurrentHours] = useState(new Date().getHours())
    const [nextSalahName, changeNextSalahName] = useState("")
    const [nextSalahTime, changeNextSalahTime] = useState("")
    const [nextSalahDiff, setSalahDiff] = useState("")
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
                        // console.log("location", result.timestamp)
                        getSalahTimes(result.timestamp, result.coords.longitude, result.coords.latitude);
                        getRevLocation(result.coords.latitude, result.coords.longitude)
                    }).catch(" an error with getting geolocation", err)
                }
            }).catch(err => {
                console.log("an error with Geolocation permissions", err)
            })
        }
    }, []);//get location

    const getSalahTimes = useCallback((timestamp, longitude, latitude) => {
        fetch(`http://api.aladhan.com/v1/timings/${timestamp}?latitude=${longitude}&longitude=${latitude}&method=2`).then(result => {
            result.json().then(res => {
                console.log(res.data.timings)
                setSalahTimesToday(res.data.timings) //sets salah times for today
            }).catch(err => {
                console.log("there's been an error with prayertime fetch2", err)
            })
        }).catch(err => { console.warn(err) })
    }, []) //gets initial salah times for that day and place

    const getRevLocation = useCallback((lat, lon) => {
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${locationAPIKey}`).then(result => {
            result.json().then(res => {
                console.log(res.results);
                console.log(res.results[3].formatted_address)//the approximate place of user, neighbourhood
                setLocationHuman(res.results[3].formatted_address)
            })
        })
    }, []); //get human location details for latitude and longitude of location


    const changeCurrentSecs = setInterval(() => {
        let today = new Date();
        let currentSeconds = today.getSeconds();
        changeCurrentSeconds(currentSeconds)
    }, 1000);

    const changeCurrentMins = setInterval(() => {
        let today = new Date();
        let currentMinute = today.getMinutes();
        changeCurrentMinutes(currentMinute)
    }, 1000);

    const changeCurrentHr = setInterval(() => {
        let today = new Date();
        let currentHour = today.getHours();
        changeCurrentHours(currentHour)
    }, 1000);

    const dateTimeNow = setInterval(() => {
        // console.log(new Date()) 
        return new Date();
    }, 1000)

    const timeNow = setInterval(() => {
        // console.log(new Date().getTime())
        return new Date().getTime();
    }, 1000)

    useEffect(() => {
        getLocation();
    }, []);

    const makeDateTimeSalah = (salah) => {
        return Date.parse(new Date().toDateString() + " " + salah + ":00")
    };

    function msToTime(duration) {
        var milliseconds = parseInt((duration % 1000) / 100),
          seconds = Math.floor((duration / 1000) % 60),
          minutes = Math.floor((duration / (1000 * 60)) % 60),
          hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
      
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
      
        return( hours + ":" + minutes + ":" + seconds);
      };

    const calculateSalahTime = setInterval(() => {
        let salahTimes = [makeDateTimeSalah(salahTimesToday.Fajr), makeDateTimeSalah(salahTimesToday.Dhuhr), makeDateTimeSalah(salahTimesToday.Asr), makeDateTimeSalah(salahTimesToday.Maghrib), makeDateTimeSalah(salahTimesToday.Isha)];

        if (Date.now() < salahTimes[0]) {
            changeNextSalahName(salahNames[0])
            setSalahDiff(msToTime(salahTimes[0] - Date.now()))
            changeNextSalahTime(new Date(salahTimes[0]).toLocaleTimeString());
        }
        else if (Date.now() < salahTimes[1] && Date.now() > salahTimes[0]) {
            changeNextSalahName(salahNames[1])
            setSalahDiff(msToTime(salahTimes[1] -Date.now()))
            
            changeNextSalahTime(new Date(salahTimes[0]).toLocaleTimeString());
        }
        else if(Date.now() < salahTimes[2] && Date.now() > salahTimes[1]) {
            changeNextSalahName(salahNames[2])
            setSalahDiff(msToTime(salahTimes[2] -Date.now()))
            
            
            changeNextSalahTime(new Date(salahTimes[2]).toLocaleTimeString());
        }
        else if (Date.now() < salahTimes[3] && Date.now() > salahTimes[2]) {
            changeNextSalahName(salahNames[4])
            setSalahDiff(msToTime(salahTimes[3] -Date.now()))
            changeNextSalahTime(new Date(salahTimes[3]).toLocaleTimeString())
        }
        else if (Date.now() < salahTimes[4] && Date.now() > salahTimes[3]) {
            changeNextSalahName(salahNames[4])
            setSalahDiff( msToTime(salahTimes[4] -Date.now()))
            changeNextSalahTime(Date(salahTimes[4]).toLocaleTimeString());
        }
        else {
            //what to do to check next day
            //show Fajr, and next day's Fajr...?
        }
    }, 6000)

    return (
        <SafeAreaView>
            <View>
                <Text>Welcome  to eman</Text>
                <Text>{currentDate}/{currentMonth}/{currentYear}</Text>
                <Text> {locationHuman}</Text>
                <Text>{initCurrentHours}: {initCurrentMinutes} : {initCurrentSeconds} </Text>

                <Text>{nextSalahTime}</Text>
                <Text>{nextSalahDiff}</Text>
                <Text>{nextSalahName}</Text>

            </View>
        </SafeAreaView>

    );
};

export default Home;