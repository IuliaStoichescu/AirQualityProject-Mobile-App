import { View, Text, StyleSheet } from 'react-native';
import {Animated,  TouchableOpacity,StatusBar,} from 'react-native';
import * as React from 'react';
import { TabView, SceneMap } from 'react-native-tab-view';
import FirstRoute from '../../src/screens/firstPage';
import SecondRoute from '../../src/screens/secondPage';
import ThirdRoute from '../../src/screens/thirdPage';
import FourthRoute from '../../src/screens/fourthPage';
import { Ionicons } from '@expo/vector-icons';
import iconSet from '@expo/vector-icons/build/Fontisto';
import {getIconName} from '../../src/constants/sensors'

export default class TabViewExample extends React.Component{
  
  state = {
    index: 0,
    routes: [
      { key: 'first', title: 'CO2', icon: 'cloud-outline' },
      { key: 'second', title: 'Temperature', icon: 'thermometer-outline' },
      { key: 'third', title: 'Humidity', icon: 'water-outline' },
      { key: 'fourth', title: 'Pressure', icon: 'speedometer-outline' },
    ],
  };

  _handleIndexChange = (index: any) => this.setState({ index });

  _renderTabBar = (props: { navigationState: { routes: any[]; }; position: { interpolate: (arg0: { inputRange: any; outputRange: any; }) => any; }; }) => {
    const inputRange = props.navigationState.routes.map((x, i) => i);

    return (
      <View style={styles.tabBar}>
        {props.navigationState.routes.map((route, i) => {
          const opacity = props.position.interpolate({
            inputRange,
            outputRange: inputRange.map((inputIndex) =>
              inputIndex === i ? 1 : 0.5
            ),
          });

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabItem}
              onPress={() => this.setState({ index: i })}
            >
          <Animated.View style={{ opacity, alignItems: 'center' }}>
            <Ionicons
              name={getIconName(route.key)}
              size={22}
              color="#000"
              style={{ marginBottom: 4 }}
            />
            <Animated.Text>{route.title}</Animated.Text>
          </Animated.View>
        </TouchableOpacity>

          );
        })}
      </View>
    );
  };

  _renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
    third: ThirdRoute,
    fourth: FourthRoute,
  });

  render() {
    return (
      <TabView
        navigationState={this.state}
        renderScene={this._renderScene}
        renderTabBar={this._renderTabBar}
        onIndexChange={this._handleIndexChange}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#262632ff',
  },
  tabBar: {
    flexDirection: 'row',
    paddingTop: StatusBar.currentHeight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
   // backgroundColor: "#4CAF50",
    //borderRadius: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
});
