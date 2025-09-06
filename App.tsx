import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { StyleSheet} from 'react-native';



// Create a React Query client
const queryClient = new QueryClient();

// Dummy fetch function
const fetchWelcome = async () => {
  return new Promise<string>((resolve) =>
    setTimeout(() => resolve('Welcome to My Mental Health App! 🎉'), 1000)
  );
};

// Component using v5 useQuery
const WelcomeMessage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['welcome'],
    queryFn: fetchWelcome,
  });

  if (isLoading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (error) return <Text>Error loading message</Text>;

  return <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{data}</Text>;
};



export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#a0d8f1',
        }}
      >
        <WelcomeMessage />
        <Text className="text-white text-lg font-bold">
        Hello Tailwind!
      </Text>
      </View>
     
    </QueryClientProvider>
  );
}
