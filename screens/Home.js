import React, { useState, useCallback, useEffect } from 'react'
import { View, Text, SafeAreaView, StyleSheet, FlatList, Platform, RefreshControl, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';

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
    const methods = ["Shia Ithna-Ansari", "University of Islamic Sciences, Karachi", "Islamic Society of North America", "Muslim World League", "Umm Al-Qura University, Makkah", "Egyptian General Authority of Survey", "Institute of Geophysics, University of Tehran", "Gulf Region", "Kuwait", "Qatar", "Majlis Ugama Islam Singapura, Singapore", "Union Organization islamic de France", "Diyanet İşleri Başkanlığı, Turkey","Spiritual Administration of Muslims of Russia"]

    const [currentDate, changeCurrentDate] = useState(initCurrentDate);
    const [currentDay, changeCurrentDay] = useState(initCurrentDay);
    const [currentMonth, changeCurrentMonth] = useState(initCurrentMonth);
    const [currentYear, changeYear] = useState(initCurrentYear);
    const [currentFirstOfMonth, changeFirstOfMonth] = useState(initFirstOfMonth);
    const [currentNumberOfDays, changeNumberofDays] = useState(initNumberofDays);
    const [location, setLocation] = useState(null)
    const [errorMessage, setErrorMessage] = useState("Oops, something went wrong!");
    const [salahTimesToday, setSalahTimesToday] = useState({})
    const [salahTimesTomorrow, setSalahTimesTomorrow] = useState({})
    const [locationHuman, setLocationHuman] = useState("")
    const [initCurrentSeconds, changeCurrentSeconds] = useState(new Date().getUTCSeconds())
    const [initCurrentMinutes, changeCurrentMinutes] = useState(new Date().getMinutes())
    const [initCurrentHours, changeCurrentHours] = useState(new Date().getHours())
    const [nextSalahName, changeNextSalahName] = useState()
    const [nextSalahTime, changeNextSalahTime] = useState()
    const [nextSalahDiff, setSalahDiff] = useState()
    const [salahMethod, setSalahMethod] = useState(0)
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
                        console.log("location", result.timestamp)
                        getSalahTimes(Date.now(), result.coords.longitude, result.coords.latitude);
                        getRevLocation(result.coords.latitude, result.coords.longitude)
                        getSalahTimesTomorrow(Date.now() + (24 * 60 * 60 * 1000), result.coords.latitude, result.coords.longitude)
                    }).catch(" an error with getting geolocation", err)
                }
            }).catch(err => {
                console.log("an error with Geolocation permissions", err)
            })
        }
    }, []);//get location

    const getSalahTimes = useCallback((timestamp, longitude, latitude) => {
        fetch(`http://api.aladhan.com/v1/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=${salahMethod}`).then(result => {
            result.json().then(res => {
                console.log("salah times 1", res.data.timings)
                setSalahTimesToday(res.data.timings) //sets salah times for today
            }).catch(err => {
                console.log("there's been an error with prayertime fetch2", err)
            })
        }).catch(err => { console.warn(err) })
    }, [salahMethod]) //gets initial salah times for that day and place

    const getSalahTimesTomorrow = useCallback((timestamp, longitude, latitude) => {
        fetch(`http://api.aladhan.com/v1/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=${salahMethod}`).then(result => {
            result.json().then(res => {
                console.log("salah ttimes 2", res.data.timings)
                setSalahTimesTomorrow(res.data.timings) //sets salah times for tomorrow
            }).catch(err => {
                console.log("there's been an error with prayertime fetch2", err)
            })
        }).catch(err => { console.warn(err) })
    }, [salahMethod]);

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
    const makeDateTimeSalahTom = salah => {
        return Date.parse(new Date(Date.now() + (24 * 60 * 60 * 1000)).toDateString() + " " + salah + ":00")
    };
    function msToTime(duration) {
        var milliseconds = parseInt((duration % 1000) / 100),
            seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return (hours + ":" + minutes + ":" + seconds);
    };
    const calculateSalahTime = setInterval(() => {
        let salahTimes = [makeDateTimeSalah(salahTimesToday.Fajr), makeDateTimeSalah(salahTimesToday.Dhuhr), makeDateTimeSalah(salahTimesToday.Asr), makeDateTimeSalah(salahTimesToday.Maghrib), makeDateTimeSalah(salahTimesToday.Isha)];
        if (Date.now() < salahTimes[0]) {
            changeNextSalahName(salahNames[0])
            setSalahDiff(msToTime(salahTimes[0] - Date.now()))
            changeNextSalahTime(new Date(salahTimes[0]).toLocaleTimeString());
        }
        else if (Date.now() < salahTimes[1] && Date.now() > salahTimes[0]) {
            changeNextSalahName(salahNames[1]);
            setSalahDiff(msToTime(salahTimes[1] - Date.now()));
            changeNextSalahTime(new Date(salahTimes[0]).toLocaleTimeString());
        }
        else if (Date.now() < salahTimes[2] && Date.now() > salahTimes[1]) {
            changeNextSalahName(salahNames[2]);
            setSalahDiff(msToTime(salahTimes[2] - Date.now()));
            changeNextSalahTime(new Date(salahTimes[2]).toLocaleTimeString());
        }
        else if (Date.now() < salahTimes[3] && Date.now() > salahTimes[2]) {
            changeNextSalahName(salahNames[4])
            setSalahDiff(msToTime(salahTimes[3] - Date.now()))
            changeNextSalahTime(new Date(salahTimes[3]).toLocaleTimeString())
        }
        else if (Date.now() < salahTimes[4] && Date.now() > salahTimes[3]) {
            changeNextSalahName(salahNames[4])
            setSalahDiff(msToTime(salahTimes[4] - Date.now()))
            changeNextSalahTime(new Date(salahTimes[4]).toLocaleTimeString());
        }
        else {
            if (salahTimesTomorrow.Fajr) {
                changeNextSalahName(salahNames[0] + ", tomorrow")
                let tomFajr = makeDateTimeSalahTom(salahTimesTomorrow.Fajr);
                setSalahDiff(msToTime(tomFajr - Date.now()));
                changeNextSalahTime(new Date(tomFajr).toLocaleTimeString());
            } else {
                changeNextSalahName(salahNames[0] + ", tomorrow");
                setSalahDiff("00:00:00");
                changeNextSalahTime("00:00:00");
            }
        }
    }, 6000);

    return (
        <SafeAreaView style={{ height: "100%", width: "100%", backgroundColor: 'rgba(52, 52, 52, 0.2)' }} >
            <View style={styles.page}>

                <View style={{ backgroundColor: 'rgba(52, 52, 52, 0.1)', justifyContent: 'space-between', alignItems: 'stretch' }}>
                    <Text style={{ color: "white" }}>{initCurrentHours}: {initCurrentMinutes} : {initCurrentSeconds} </Text>
                    <Text style={{ color: "white" }} > {locationHuman}</Text>
                    <Picker
                        onValueChange={(itemValue, itemIndex) => setSalahMethod(itemIndex)}>
                        {methods.map(method => (
                            <Picker.Item label={method} />
                        ))}
                    </Picker>
                </View>
                <View style={{ height: 150, width: "100%", padding: 10, justifyContent: 'center' }}>
                    <Text style={styles.heading}>Welcome  to eman</Text>
                    <Text style={styles.date}>{currentDate}/{currentMonth}/{currentYear}</Text>
                </View>
                <View style={{ alignItems: 'center', justifyContent: "center", padding: 10 }}>
                    <Text style={{ color: "white", fontWeight: 200, fontSize: 20 }}>Next Salah:</Text>
                    <Text style={{ color: "white", fontWeight: 400, fontSize: 30 }}>{nextSalahName}</Text>
                    <Text style={{ color: "white", fontWeight: 300, fontSize: 30 }}>{nextSalahTime}</Text>
                    <Text style={{ color: "white", fontWeight: 200, fontSize: 25 }}>{nextSalahDiff}</Text>
                </View>

            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    page: {
        flex: 10,
        marginTop: 10,
        flexDirection: 'column'

    },
    heading: {
        fontSize: 40,
        fontWeight: 500,
        marginBottom: 5,
        alignSelf: 'flex-start',
        alignSelf: 'center',
        color: "white"
    },
    time: {
        color: "white"
    },
    date: {
        alignSelf: 'center',
        color: "white",
        fontSize: 20,
        fontWeight: 400,
        marginBottom: 5,
    },
    location: {
        alignSelf: 'flex-start'
    },
    list: {
        flexDirection: 'row',
        marginBottom: 30,
    },
    color: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 2,
        height: 40,
        width: 40,
        marginRight: 10,
    },

});

export default Home;