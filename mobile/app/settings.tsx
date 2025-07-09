import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Feather name="settings" size={60} color="black" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(221, 183, 116)',
  },
  title: {
    fontSize: 32,
    fontFamily: 'LXGWWenKaiMonoTC-Bold',
    marginBottom: 20,
  },
}); 
