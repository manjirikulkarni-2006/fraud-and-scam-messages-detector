import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";

const { width } = Dimensions.get("window");

type ScamType = 
  | "phishing" 
  | "lottery" 
  | "banking" 
  | "tech_support" 
  | "romance" 
  | "investment" 
  | "Unknown";

type ScamTypeInfo = {
  icon: string;
  color: string;
  label: string;
};

type WarningSignsMap = Record<string, string[]>;

export default function Details() {
  const params = useLocalSearchParams();
  
  const message = (params.message as string) || "";
  const result = (params.result as string) || "";
  const confidence = parseFloat(params.confidence as string) || 0;
  const type = (params.type as ScamType) || "Unknown";
  const explanation = (params.explanation as string) || "";

  const isSpam = result === "SPAM";
  const confidencePercent = Math.min(100, Math.round(confidence * 100));
  
  const getConfidenceColor = (): string => {
    if (confidencePercent >= 80) return "#10b981";
    if (confidencePercent >= 60) return "#f59e0b";
    if (confidencePercent >= 40) return "#f97316";
    return "#ef4444";
  };

  const getScamTypeInfo = (): ScamTypeInfo => {
  const normalizedType = type?.toLowerCase().trim();

  const types: Record<string, ScamTypeInfo> = {
    "phishing scam": {
      icon: "🎣",
      color: "#7c3aed",
      label: "Phishing Scam",
    },

    "lottery scam": {
      icon: "🎰",
      color: "#7c3aed",
      label: "Lottery Scam",
    },

    "upi payment scam": {
      icon: "💸",
      color: "#7c3aed",
      label: "UPI Payment Scam",
    },

    "loan scam": {
      icon: "💳",
      color: "#7c3aed",
      label: "Loan Scam",
    },

    "job scam": {
      icon: "💼",
      color: "#7c3aed",
      label: "Job Scam",
    },

    "offer scam": {
      icon: "🏷️",
      color: "#7c3aed",
      label: "Offer Scam",
    },

    "suspicious url scam": {
      icon: "🔗",
      color: "#7c3aed",
      label: "Suspicious URL Scam",
    },

    "general scam": {
      icon: "⚠️",
      color: "#7c3aed",
      label: "General Scam",
    },

    safe: {
      icon: "✅",
      color: "#7c3aed",
      label: "Safe Message",
    },
  };

  return (
    types[normalizedType] || {
      icon: "⚠️",
      color: "#7c3aed",
      label: "Suspicious Activity",
    }
  );
};

  const scamTypeInfo = getScamTypeInfo();

  const getTypeDescription = (scamType: ScamType): string => {
    const descriptions: Record<Exclude<ScamType, "Unknown">, string> = {
      phishing: "This message tries to steal your passwords, credit card details, or other sensitive information by pretending to be a legitimate company.",
      lottery: "These scams promise huge prizes but require an upfront payment. Legitimate lotteries never ask for fees to claim winnings.",
      banking: "Fraudsters impersonate your bank to trick you into revealing account credentials or transferring money.",
      tech_support: "Scammers claim your device has problems and offer fake solutions to gain remote access or payment.",
      romance: "Builds fake emotional connections online before requesting money for fabricated emergencies.",
      investment: "Promises guaranteed high returns with little risk - a classic sign of investment fraud.",
    };
    return scamType !== "Unknown" 
      ? descriptions[scamType] 
      : "This message contains scam indicators. Do not share personal information or send money.";
  };

  const getDetailedExplanation = (): string => {
    if (explanation) {
      return explanation;
    }
    
    // Generate detailed explanation based on analysis
    if (!isSpam) {
      return "This message appears to be legitimate based on our analysis. No known scam patterns or suspicious keywords were detected. However, always remain cautious with unsolicited messages.";
    }
    
    let detail = `Based on our analysis, this message has been identified as ${scamTypeInfo.label.toLowerCase()}. `;
    
    if (confidencePercent >= 80) {
      detail += `With ${confidencePercent}% confidence, multiple scam indicators are present. `;
    } else if (confidencePercent >= 60) {
      detail += `With ${confidencePercent}% confidence, several suspicious elements have been detected. `;
    } else {
      detail += `With ${confidencePercent}% confidence, some scam indicators are present but not conclusive. `;
    }
    
    detail += getTypeDescription(type);
    
    if (type === "phishing") {
      detail += " Never click on suspicious links or share personal information.";
    } else if (type === "banking") {
      detail += " Contact your bank directly using official channels if you're concerned about your account.";
    } else if (type === "lottery") {
      detail += " Remember: If it sounds too good to be true, it probably is.";
    }
    
    return detail;
  };

  const getWarningSigns = (scamType: ScamType, messageContent: string): string[] => {
    const hasUrgentWords = /\b(urgent|immediately|asap|quickly|now|today only)\b/i.test(messageContent);
    const hasMoneyRequest = /\b(pay|send money|transfer|bitcoin|crypto|gift card|wire)\b/i.test(messageContent);
    const hasPersonalInfo = /\b(password|ssn|social security|account number|credit card|verify)\b/i.test(messageContent);
    const hasLinks = /\b(https?:\/\/|www\.|click here|link)\b/i.test(messageContent);
    const hasGrammarIssues = /(\b\w+\b\s+\b\w+\b\s+[^.]{50,})/g.test(messageContent);
    
    const commonSigns: string[] = [];
    if (hasUrgentWords) commonSigns.push("Urgency tactics to rush your decision");
    if (hasMoneyRequest) commonSigns.push("Requests for money or payment");
    if (hasPersonalInfo) commonSigns.push("Asking for personal or financial information");
    if (hasLinks) commonSigns.push("Contains suspicious links or URLs");
    if (hasGrammarIssues) commonSigns.push("Poor grammar or unusual sentence structure");
    
    const specificSigns: WarningSignsMap = {
      phishing: ["Suspicious links or attachments", "Fake login pages or verification requests", "Poor grammar or unusual sender address"],
      lottery: ["Claim you won a contest you never entered", "Request for processing fees upfront", "Pressure to keep winnings confidential"],
      banking: ["Threats about account suspension or closure", "Requests for OTP or security codes", "Unusual transaction notifications"],
      tech_support: ["Claims of virus infections without proof", "Requests for remote desktop access", "Unsolicited software installation prompts"],
    };
    
    const additionalSigns = specificSigns[scamType] || [];
    return [...commonSigns, ...additionalSigns].slice(0, 5);
  };

  const warningSigns = isSpam ? getWarningSigns(type, message) : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.6}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={[
          styles.resultCard,
          isSpam ? styles.resultCardDanger : styles.resultCardSafe
        ]}>
          <Text style={[
            styles.resultText,
            isSpam ? styles.resultTextDanger : styles.resultTextSafe
          ]}>
            {isSpam ? "Potential Scam Detected" : "Likely Safe"}
          </Text>
          <Text style={styles.resultSubtext}>
            {isSpam 
              ? "Exercise caution with this message" 
              : "No major red flags found"}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Likely Scam Ratio</Text>
          <View style={styles.confidenceContainer}>
            <View style={styles.confidenceHeader}>
              <Text style={styles.confidenceLabel}>Detection confidence</Text>
              <Text style={[styles.confidenceValue, { color: getConfidenceColor() }]}>
                {confidencePercent}%
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${confidencePercent}%`,
                    backgroundColor: getConfidenceColor()
                  }
                ]} 
              />
            </View>
            <Text style={styles.confidenceNote}>
              {confidencePercent >= 80 
                ? "High confidence - Multiple scam indicators present" 
                : confidencePercent >= 60 
                ? "Medium confidence - Some suspicious elements found"
                : "Low confidence - Few scam indicators detected"}
            </Text>
          </View>
        </View>

        {isSpam && type !== "Unknown" && (
          <View style={styles.card}>
            <View style={styles.typeHeader}>
              <Text style={styles.typeIcon}>{scamTypeInfo.icon}</Text>
              <View>
                <Text style={styles.cardTitle}>Scam Category</Text>
                <Text style={[styles.typeText, { color: scamTypeInfo.color }]}>
                  {scamTypeInfo.label}
                </Text>
              </View>
            </View>
            <Text style={styles.typeDescription}>
              {getTypeDescription(type)}
            </Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Message Content</Text>
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>
              {message || "No message content available"}
            </Text>
          </View>
          {message && (
            <Text style={styles.messageLength}>
              {message.length} characters
            </Text>
          )}
        </View>

        {/* Detailed Explanation Container */}
        <View style={[styles.card, styles.explanationCard]}>
          <View style={styles.explanationHeader}>
            <Text style={styles.explanationIcon}></Text>
            <Text style={styles.cardTitle}>Detailed Analysis</Text>
          </View>
          <View style={styles.explanationContent}>
            <Text style={styles.explanationText}>
              {getDetailedExplanation()}
            </Text>
          </View>
          {!isSpam && (
            <View style={styles.safeNote}>
              <Text style={styles.safeNoteText}>
                ✓ No scam patterns detected
              </Text>
            </View>
          )}
          {isSpam && confidencePercent > 70 && (
            <View style={styles.warningNote}>
              <Text style={styles.warningNoteText}>
                ⚠️ High risk - Do not respond or click any links
              </Text>
            </View>
          )}
        </View>

    
        

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.primaryButtonText}>New analysis</Text>
          </TouchableOpacity>
          
          
        </View>

        <Text style={styles.disclaimer}>
          AI-powered analysis — not a substitute for professional judgment.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 8,
  },
  
  backButton: {
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignSelf: "flex-start",
  },
  backButtonText: {
    fontSize: 16,
    color: "#007aff",
    fontWeight: "500",
  },
  
  resultCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resultCardDanger: {
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  resultCardSafe: {
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },
  resultIconContainer: {
    marginBottom: 12,
  },
  resultIcon: {
    fontSize: 44,
  },
  resultText: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  resultTextDanger: {
    color: "#dc2626",
  },
  resultTextSafe: {
    color: "#10b981",
  },
  resultSubtext: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 0,
  },
  
  confidenceContainer: {
    marginTop: 4,
  },
  confidenceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 8,
  },
  confidenceLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  confidenceValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  confidenceNote: {
    fontSize: 15,
    color: "#454c55",
  },
  
  typeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  typeIcon: {
    fontSize: 28,
  },
  typeText: {
    fontSize: 25,
    fontWeight: "600",
    marginTop: 2,
  },
  typeDescription: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  
  messageContainer: {
    backgroundColor: "#f9fafb",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  messageLength: {
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "right",
  },
  
  explanationCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  explanationIcon: {
    fontSize: 20,
  },
  explanationContent: {
    backgroundColor: "#f8f9fa",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  explanationText: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 22,
  },
  safeNote: {
    backgroundColor: "#d1fae5",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  safeNoteText: {
    fontSize: 13,
    color: "#065f46",
    fontWeight: "500",
    textAlign: "center",
  },
  warningNote: {
    backgroundColor: "#fee2e2",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  warningNoteText: {
    fontSize: 13,
    color: "#991b1b",
    fontWeight: "600",
    textAlign: "center",
  },
  
  warningCard: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#d97706",
    marginBottom: 12,
  },
  warningItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  warningBullet: {
    fontSize: 14,
    color: "#d97706",
    marginRight: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: "#78350f",
    lineHeight: 19,
  },
  
  actionContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    marginBottom: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#007aff",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#007aff",
  },
  secondaryButtonText: {
    color: "#007aff",
    fontSize: 15,
    fontWeight: "500",
  },
  
  disclaimer: {
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 16,
    marginTop: 8,
  },
});