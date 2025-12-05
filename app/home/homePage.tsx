import { signOut } from 'aws-amplify/auth';
import { TouchableOpacity, View, Text,StyleSheet, FlatList, Platform } from 'react-native'; // Import Platform
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImageBackground } from "react-native";
import { createMMKV } from 'react-native-mmkv'

interface SensorItem {
  id: number;
  title: string;
  measured: string;
  value: string; 
  image: any;
  message: string;
}

const DATA = [
  {
    id: 1,
    title: 'CO2 Levels',
    measured: 'ppm',
    value: '450',
    image: require('../../assets/images/co2.jpg'),
    message : 'Good air quality',
  },
  {
    id: 2,
    title: 'Temperature',
    measured: '°C',
    value: '22',
    image: require('../../assets/images/temperature.jpg'),
    message : "Comfortable temperature",
  },
  {
    id: 3,
    title: 'Humidity',
    measured: '%',
    value: '70',
   image: require('../../assets/images/humidity.jpg'),
   message : 'Uncomfortable humidity levels',
  },
  {
    id: 4,
    title: 'Indoor Pressure',
    measured: 'hPa',
    value: '1013',
    image: require('../../assets/images/pressure.jpg'),
    message : 'Normal indoor pressure',
  },
];

const homePage = () => {
  const storage = createMMKV(
    {
      id :"homePageStorage"
    }
  )
  
  const isVlaueOk = (item: SensorItem): boolean => {
    const numericValue = parseFloat(item.value);
    if (isNaN(numericValue) || !isFinite(numericValue)) {
        return false; 
    }

    switch (item.id) {
      case 1: 
        return numericValue >= 400 && numericValue <= 1000;
      case 2: 
        return numericValue >= 20 && numericValue <= 24;
      case 3: 
        return numericValue >= 30 && numericValue <= 60;
      case 4:
        return numericValue >= 1000 && numericValue <= 1020;
      default:
        return true;
    }
  }
 
  return (
    <SafeAreaView style={styles.safeArea}>
      
      <FlatList
        data={DATA}
        showsVerticalScrollIndicator = {false}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }: { item: SensorItem }) => {
          const isOk = isVlaueOk(item);
          const shadowStyle = isOk ? styles.okShadow : styles.alertShadow;

          return (
            <ImageBackground
              source={item.image}          
              style={[styles.card, shadowStyle]} 
              imageStyle={styles.cardImage} 
            >
              <View style={styles.overlay}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardValue}>
                  {item.value} {item.measured}
                </Text>
                <Text style={styles.textCard}>{item.message}</Text>
              </View>
            </ImageBackground>
          );
        }}
      />

    </SafeAreaView>
  );
}

export default homePage;

const styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: '#262632ff',
    width: '90%',
    maxWidth: 300,
    marginHorizontal: 'auto',
    marginBottom: 10,
    marginTop: 10,
  },
  textCard:{
    color: 'white',
    fontSize: 16, 
    marginBottom: 10,
    marginTop: 10,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 120, 
  },
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
  okShadow: {
    boxShadow:  "0 4px 6px rgba(0, 255, 0, 1)",
  },
  alertShadow: {
   boxShadow:  "0 4px 6px rgba(255, 0, 0, 1)",
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