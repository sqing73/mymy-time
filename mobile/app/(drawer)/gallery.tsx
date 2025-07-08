import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Feather name="user" size={60} color="black" />
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
