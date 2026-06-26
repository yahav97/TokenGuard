// app/index.tsx (או src/app/index.tsx)

import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { TokenGuardMobileClient } from '../TokenGuardMobileClient';

export default function AppDemo() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // אתחול המערכת (החלף למפתח אמיתי שיצרת בפורטל)
  const tgClient = new TokenGuardMobileClient("tg-sk-admin123456789")

  const handleSendRequest = async () => {
    if (!prompt) return;
    
    setIsLoading(true);
    setResponse('');
    
    // השתמש במפתח מחלקה אמיתי שיש לך בדאטה בייס (למשל המחלקה שפתחנו מקודם)
    const result = await tgClient.generate("dept_mobile_001", prompt);
    
    if (result && result.status === "success") {
      setResponse(`Source: ${result.source}\n\n${result.response}`);
    } else {
      setResponse("❌ Connection failed. Check backend terminal for errors.");
    }
    
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>TokenGuard Mobile App</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Ask the AI something..."
        placeholderTextColor="#666"
        value={prompt}
        onChangeText={setPrompt}
      />
      
      <TouchableOpacity style={styles.button} onPress={handleSendRequest} disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? 'Sending...' : 'Send via Gateway'}</Text>
      </TouchableOpacity>

      {isLoading && <ActivityIndicator size="large" color="#818CF8" style={{ marginTop: 20 }} />}

      {response ? (
        <View style={styles.responseBox}>
          <Text style={styles.responseText}>{response}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#141414', justifyContent: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#222', color: '#fff', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#333', marginBottom: 15 },
  button: { backgroundColor: '#818CF8', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  responseBox: { marginTop: 20, padding: 15, backgroundColor: '#1A1A1A', borderRadius: 10, borderWidth: 1, borderColor: '#333' },
  responseText: { color: '#10B981', fontSize: 14 }
});