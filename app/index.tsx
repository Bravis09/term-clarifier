import React, { useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function HomeScreen() {
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!term.trim()) return;

    setLoading(true);
    setError('');
    setDefinition('');
    setSynonyms([]);

    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${term}`);
      if (!res.ok) throw new Error('Term not found');

      const data = await res.json();
      const meaning = data[0]?.meanings[0]?.definitions[0];
      setDefinition(meaning?.definition || 'No definition found');
      setSynonyms(meaning?.synonyms || []);
    } catch (err: any) {
      setError(err.message.includes('Term') ? 'Term not found' : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Term Clarifier</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter a term"
        value={term}
        onChangeText={setTerm}
      />
      <Button title="Search" onPress={handleSearch} />

      {loading && <ActivityIndicator style={styles.loader} size="large" color="#0000ff" />}
      
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        definition ? (
          <View style={styles.card}>
            <Text style={styles.label}>Definition:</Text>
            <Text style={styles.definition}>{definition}</Text>

            {synonyms.length > 0 && (
              <>
                <Text style={styles.label}>Synonyms:</Text>
                <View style={styles.synonyms}>
                  {synonyms.map((syn, index) => (
                    <Text key={index} style={styles.synonym}>{syn}</Text>
                  ))}
                </View>
              </>
            )}
          </View>
        ) : null
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  loader: {
    marginVertical: 16,
  },
  card: {
    marginTop: 20,
    backgroundColor: '#f2f2f2',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
  },
  definition: {
    marginBottom: 12,
  },
  synonyms: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  synonym: {
    backgroundColor: '#d0e8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    margin: 4,
    borderRadius: 4,
  },
  error: {
    marginTop: 20,
    color: 'red',
    fontWeight: '500',
  },
});
