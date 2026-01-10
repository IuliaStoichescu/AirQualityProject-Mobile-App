export interface SensorItem {
  id: number;
  title: string;
  measured: string;
  value: string; 
  image: any;
  message: string;
}

export const BASE_DATA = [
  {
    id: 1,
    title: 'CO2 Levels',
    measured: 'ppm',
    value: '-',
    image: require('../../assets/images/co2.jpg'),
    message : 'Good air quality',
  },
  {
    id: 2,
    title: 'Temperature',
    measured: '°C',
    value: '-',
    image: require('../../assets/images/temperature.jpg'),
    message : "Comfortable temperature",
  },
  {
    id: 3,
    title: 'Humidity',
    measured: '%',
    value: '-',
   image: require('../../assets/images/humidity.jpg'),
   message : 'Uncomfortable humidity levels',
  },
  {
    id: 4,
    title: 'Indoor Pressure',
    measured: 'hPa',
    value: '-',
    image: require('../../assets/images/pressure.jpg'),
    message : 'Normal indoor pressure',
  },
]as const;

 export const numericBasedMessage = (item: SensorItem): string => {
    const numericValue = parseFloat(item.value);
    if (isNaN(numericValue) || !isFinite(numericValue)) {
        return "No data available"; 
    }
    switch (item.id) {
      case 1: 
        if(numericValue == 400) return "Normal air quality";
        else if(numericValue >= 400 && numericValue <= 1000) return "Typical indoor air quality";
        else if(numericValue > 1000 && numericValue <= 2000) return "Poor air quality. May experience drowsiness. Consider ventilating";
        else if(numericValue > 2000 && numericValue <= 5000) return "Very poor air quality.May experience headaches, fatigue, stagnant, stuffiness, poor concentration, loss of focus, increased heart rate, nauseafy air. Immediate action required!";
        else return "Extremely poor air quality. Serious health effects possible. Evacuate the area immediately!";
      case 2: 
        if(numericValue < 16) return "Temperature is low. Consider warming up.";
        else if(numericValue >= 16 && numericValue <= 20) return "Cooler air is acceptable as the body temperature drops to prepare your body for sleep.";
        else if(numericValue > 20 && numericValue <= 24) return "Temperature is comfortable. Ideal for productivity and general comfort.";
        else return "Temperature is high for indoors. Consider cooling down.";
      case 3: 
        if(numericValue < 30) return "Humidity is low, throat and skin may feel dry. Risk of bateria and viruses spreading. Consider using a humidifier.";
        else if(numericValue >= 30 && numericValue <= 60) return "Humidity is comfortable. Ideal for most indoor settings.";
        else return "Humidity is high. Risk of mold growth and discomfort. Consider using a dehumidifier.";
      case 4:
        if(numericValue < 1000) return "Pressure is low. May cause discomfort such as headaches or dizziness.";
        else if(numericValue >= 1000 && numericValue <= 1020) return "Pressure is normal. No action needed.";
        else return "Pressure is high. Consider ventilating the area.";
      default:
        return "No data available";
    }
  }

  export const isVlaueOk = (item: SensorItem): boolean => {
      const numericValue = parseFloat(item.value);
      if (isNaN(numericValue) || !isFinite(numericValue)) {
          return false; 
      }
  
      switch (item.id) {
        case 1: 
          return numericValue >= 400 && numericValue <= 1000;
        case 2: 
          return numericValue >= 16 && numericValue <= 24;
        case 3: 
          return numericValue >= 30 && numericValue <= 60;
        case 4:
          return numericValue >= 1000 && numericValue <= 1020;
        default:
          return true;
      }
    }