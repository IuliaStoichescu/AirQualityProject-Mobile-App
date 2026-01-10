import { FlatList, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIot } from '../../src/iot/iot_context';
import { BASE_DATA, isVlaueOk, numericBasedMessage, SensorItem } from '../../src/constants/sensors';

const homePage = () => {
 /* const { latest } = useIot();
  const payload = (latest ?? {}) as MqttPayload;
  console.log("Latest MQTT Payload:", payload);

  const batteryValue = payload["Battery"] !== undefined ? Number(payload["Battery"]) : 0;
  const batteryLevelStr = batteryValue.toFixed(1);

  const DATA: SensorItem[] = BASE_DATA.map((item) => {
    const rawValue = payload[String(item.id)];
    const numericValue = rawValue !== undefined ? parseFloat(String(rawValue)) : parseFloat(item.value);
    return {
      id: item.id,
      title: item.title,
      measured: item.measured,
      value: String(numericValue),//for display purposes
      image: item.image,
      message: item.message,
    };
  });*/

   const { sensorData, connState } = useIot();
  // console.log("SensorData on Home Screen:", sensorData);
  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={sensorData}
        showsVerticalScrollIndicator = {false}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }: { item: SensorItem }) => {
          const isOk = isVlaueOk(item);
          const shadowStyle = isOk ? styles.okShadow : styles.alertShadow;
          const msg = numericBasedMessage(item);
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
                <Text style={styles.textCard}>{msg}</Text>
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
  circle: {
   width: 44,
   height: 44,
   borderRadius: 44/2
},
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
    backgroundColor: '#ffffffff',               
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