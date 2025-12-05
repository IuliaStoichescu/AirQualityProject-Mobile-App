import { signOut } from 'aws-amplify/auth';
import { TouchableOpacity, View, Text,StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImageBackground } from "react-native";

const DATA = [
  {
    id: 1,
    title: 'CO2 Levels',
    measured: 'ppm',
    value: '450',
    image: require('../../assets/images/co2.jpg'),
  },
  {
    id: 2,
    title: 'Temperature',
    measured: '°C',
    value: '22',
    //image: require('../assets/temperature.jpg'),
  },
  {
    id: 3,
    title: 'Humidity',
    measured: '%',
    value: '45',
   // image: require('../assets/humidity.jpg'),
  },
  {
    id: 4,
    title: 'Indoor Pressure',
    measured: 'hPa',
    value: '1013',
    //image: require('../assets/pressure.jpg'),
  },
];


const homePage = () => {
  
   return (
         <SafeAreaView style={styles.safeArea}>
         <View style={styles.container}>
         <Text>Tab Home</Text>
         <FlatList
          data={DATA}
          showsVerticalScrollIndicator = {false}
          renderItem={({ item }) => (
            <ImageBackground
              source={item.image}          
              style={styles.card}
              imageStyle={styles.cardImage} 
            >
              <View style={styles.overlay}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardValue}>
                  {item.value} {item.measured}
                </Text>
              </View>
            </ImageBackground>
          )}

          keyExtractor={(item) => item.id.toString()}
         >
         </FlatList>
         </View>
         </SafeAreaView>
   );
}

export default homePage;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,                 
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  card: {
  width: "100%",
  height: 140,
  borderRadius: 30,
  overflow: "hidden",      
  marginVertical: 12,
  alignSelf: "center",
  justifyContent: "center",
},

cardImage: {
  borderRadius: 30, 
  width: "100%",       
},

overlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.4)",  
  justifyContent: "center",
  padding: 20,
},

cardTitle: {
  fontSize: 18,
  fontWeight: "600",
  color: "white",
},

cardValue: {
  fontSize: 26,
  fontWeight: "bold",
  marginTop: 6,
  color: "white",
},

});