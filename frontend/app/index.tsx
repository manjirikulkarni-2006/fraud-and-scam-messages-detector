import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { analyzeMessage } from "@/src/api";

const SmsAndroid = require("react-native-get-sms-android");

const { width, height } = Dimensions.get("window");
 
interface AnalysisResult {
  prediction: string;
  confidence: number;
  spam_type: string;
  explanation: string;
}

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [charCount, setCharCount] = useState<number>(0);

  const handleAnalyze = async (): Promise<void> => {
    if (!message.trim()) return;

    try {
      setLoading(true);

      const result: AnalysisResult = await analyzeMessage(message);

      router.push({
        pathname: "/details",
        params: {
          message: message,
          result: result.prediction,
          confidence: result.confidence,
          type: result.spam_type,
          explanation: result.explanation,
        },
      });

      setMessage("");
      setCharCount(0);
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (text: string): void => {
    setMessage(text);
    setCharCount(text.length);
  };

  const clearMessage = (): void => {
    setMessage("");
    setCharCount(0);
  };

  const readLatestSMS = async (): Promise<void> => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: "SMS Permission",
          message: "This app needs access to read SMS messages.",
          buttonPositive: "Allow",
        }
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert("Permission Denied", "SMS permission denied");
        return;
      }

      const filter = {
        maxCount: 200,
      };

      SmsAndroid.list(
        JSON.stringify(filter),

        (fail: string) => {
          console.log("Failed: " + fail);
        },

        (count: number, smsList: string) => {
          const arr = JSON.parse(smsList);

          if (arr.length > 0) {
            const sortedSMS = arr
              .filter((sms: any) => sms.body && sms.date)
              .sort(
                (a: any, b: any) =>
                  parseInt(b.date) - parseInt(a.date)
              );

            console.log("TOP 5 SMS:");
            console.log(sortedSMS.slice(0, 5));

            const latestSMS = sortedSMS[0];

            console.log("LATEST SMS:", latestSMS);

            setMessage(latestSMS.body || "");
            setCharCount((latestSMS.body || "").length);
          } else {
            Alert.alert("No SMS Found");
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconEmoji}>🛡️</Text>
            </View>

            <Text style={styles.title}>
              Scam Alert
            </Text>

            <Text style={styles.subtitle}>
              Multilingual Scam Detection
            </Text>
          </View>

          {/* Input Section */}
          <View style={styles.inputSection}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>Enter Message</Text>

              <Text
                style={[
                  styles.charCount,
                  charCount > 500 && styles.charCountWarning,
                ]}
              >
                {charCount}/1000
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Paste suspicious message here..."
                placeholderTextColor="#999"
                multiline
                value={message}
                onChangeText={handleTextChange}
                maxLength={1000}
                editable={!loading}
                textAlignVertical="top"
              />

              {message.length > 0 && !loading && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearMessage}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Features Badges */}
            <View style={styles.badgesContainer}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Multilingual</Text>
              </View>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>Real-time</Text>
              </View>


              <View style={styles.badge}>
                <Text style={styles.badgeText}>Privacy Safe</Text>
              </View>
            </View>
          </View>

          {/* Analyze Button */}
          <TouchableOpacity
            style={[
              styles.button,
              (!message.trim() || loading) && styles.buttonDisabled,
            ]}
            onPress={handleAnalyze}
            disabled={!message.trim() || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#ffffff" size="small" />

                <Text style={styles.buttonText}>Analyzing...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonIcon}>🔍</Text>

                <Text style={styles.buttonText}>Analyze Message</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Read SMS Button */}
          <TouchableOpacity
            style={[styles.button, { marginTop: -10, marginBottom: 24 }]}
            onPress={readLatestSMS}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>📩</Text>

              <Text style={styles.buttonText}>Read Latest SMS</Text>
            </View>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9ff",
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 20 : 40,
    paddingBottom: 30,
  },

  headerSection: {
    alignItems: "center",
    marginBottom: 32,
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  iconEmoji: {
    fontSize: 48,
  },

  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#1a1a2e",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 42,
  },

  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },

  inputSection: {
    marginBottom: 28,
  },

  inputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },

  charCount: {
    fontSize: 13,
    color: "#999",
  },

  charCountWarning: {
    color: "#ff6b6b",
    fontWeight: "600",
  },

  inputContainer: {
    position: "relative",
  },

  input: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 18,
    minHeight: 160,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  clearButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },

  clearButtonText: {
    fontSize: 18,
    color: "#999",
    fontWeight: "600",
  },

  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 12,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  badgeIcon: {
    fontSize: 16,
    marginRight: 6,
  },

  badgeText: {
    fontSize: 15,
    color: "#555",
    fontWeight: "500",
  },

  button: {
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 32,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },

  buttonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
  },

  buttonContent: {
    backgroundColor: "#5a67d8",
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingContainer: {
    backgroundColor: "#5a67d8",
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  buttonIcon: {
    fontSize: 20,
    marginRight: 10,
    color: "#ffffff",
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },

  tipsSection: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  tipsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },

  tipItem: {
    flexDirection: "row",
    marginBottom: 14,
    alignItems: "flex-start",
  },

  tipCheck: {
    width: 22,
    fontSize: 16,
    color: "#4caf50",
    fontWeight: "bold",
    marginRight: 10,
  },

  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },

  footerText: {
    textAlign: "center",
    fontSize: 12,
    color: "#aaa",
    marginTop: 8,
  },
});