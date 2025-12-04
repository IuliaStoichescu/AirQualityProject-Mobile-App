// app/index.tsx
import { View, Text, StyleSheet, ImageBackground, Pressable, Button } from 'react-native';
import { Link } from "expo-router";
import {Href} from 'expo-router'

const MY_ROUTE = "/authLogic/loginPage" as Href

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Link href={MY_ROUTE} asChild>
        <Button title="Go to Login" />
      </Link>
    </View>
  );
}
 const style = StyleSheet.create({
   button: {
     marginTop: 20,
   },
 });