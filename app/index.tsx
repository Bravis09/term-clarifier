import React, { useState } from 'react';
import {
    ActivityIndicator,
    Button,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

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

      let foundDefinition = '';
      const allSynonyms: string[] = [];

      data.forEach((entry: any) => {
        entry.meanings?.forEach((meaning: any) => {
          meaning.definitions?.forEach((def: any) => {
            if (!foundDefinition && def.definition) {
              foundDefinition = def.definition;
            }
            if (Array.isArray(def.synonyms)) {
              allSynonyms.push(...def.synonyms);
            }
          });

          if (Array.isArray(meaning.synonyms)) {
            allSynonyms.push(...meaning.synonyms);
          }
        });

        if (Array.isArray(entry.synonyms)) {
          allSynonyms.push(...entry.synonyms);
        }
      });

      setDefinition(foundDefinition || 'No definition found');
      setSynonyms([...new Set(allSynonyms)]);
    } catch (err: any) {
      setError(err.message.includes('Term') ? 'Term not found' : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
        definition && (
          <View style={styles.card}>
            <Text style={styles.label}>Definition:</Text>
            <Text style={styles.definition}>{definition}</Text>

            {synonyms.length > 0 && (
              <>
                <Text style={styles.label}>Synonyms:</Text>
                <View style={styles.synonyms}>
                  {synonyms.map((syn, index) => (
                    <Text key={index} style={styles.synonym}>
                      {syn}
                    </Text>
                  ))}
                </View>
              </>
            )}
          </View>
        )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 50,
    backgroundColor: '#fff',
    flexGrow: 1,
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
