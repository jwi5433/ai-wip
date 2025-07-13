import React, { useState } from "react";
import { Alert } from "react-native";
import { Button, H3, Input, Paragraph, YStack } from "tamagui";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  return (
    <YStack flex={1} jc="center" p="$4" space="$3" bg="$background">
      <YStack ai="center" pb="$4">
        <H3>Welcome</H3>
        <Paragraph color="$gray10">
          Create an account to start matching
        </Paragraph>
      </YStack>
      <Input
        size="$4"
        placeholder="email@address.com"
        onChangeText={setEmail}
        value={email}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Input
        size="$4"
        placeholder="Password"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
        autoCapitalize="none"
      />
      <YStack pt="$2" space="$2">
        <Button
          backgroundColor="$pink9"
          color="$black"
          disabled={loading}
          onPress={signInWithEmail}
        >
          Sign in
        </Button>
        <Button variant="outlined" disabled={loading} onPress={signUpWithEmail}>
          Sign up
        </Button>
      </YStack>
    </YStack>
  );
}
