import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Footer from "../../components/Footer";
import { usePremiumScreen } from "../../hooks/screens/premium";

export function PremiumScreen(): JSX.Element {
  const {
    billingPeriod,
    selectedTier,
    isLoading,
    subscriptionTiers,
    setBillingPeriod,
    setSelectedTier,
    handleSubscribe,
    handleGoBack,
  } = usePremiumScreen();

  const renderTierCard = (tier: (typeof subscriptionTiers)[0]) => {
    const isSelected = selectedTier === tier.id;
    const price = tier.price[billingPeriod];
    const yearlyDiscount =
      billingPeriod === "yearly"
        ? Math.round((1 - tier.price.yearly / 12 / tier.price.monthly) * 100)
        : 0;

    return (
      <TouchableOpacity
        key={tier.id}
        onPress={() => {
          setSelectedTier(tier.id);
        }}
        style={StyleSheet.flatten([
          styles.tierCard,
          isSelected && styles.tierCardSelected,
          tier.popular && styles.tierCardPopular,
        ])}
        accessibilityLabel={`${tier.name} tier`}
      >
        {tier.popular ? (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>Most Popular</Text>
          </View>
        ) : null}

        <Text style={styles.tierName}>{tier.name}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.priceSymbol}>$</Text>
          <Text style={styles.priceAmount}>
            {billingPeriod === "yearly" ? (price / 12).toFixed(2) : price}
          </Text>
          <Text style={styles.pricePeriod}>
            /{billingPeriod === "yearly" ? "mo" : "month"}
          </Text>
        </View>

        {billingPeriod === "yearly" && yearlyDiscount > 0 && (
          <Text style={styles.discount}>Save {yearlyDiscount}%</Text>
        )}

        <View style={styles.featuresContainer}>
          {tier.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={StyleSheet.flatten([
            styles.subscribeButton,
            isSelected && styles.subscribeButtonSelected,
          ])}
          onPress={() => handleSubscribe(tier.id)}
          disabled={isLoading}
        >
          {isLoading && selectedTier === tier.id ? (
            <ActivityIndicator color="#fff" testID="loading-indicator" />
          ) : (
            <Text style={styles.subscribeButtonText}>
              {isSelected ? "Subscribe Now" : "Select Plan"}
            </Text>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={["#ec4899", "#8b5cf6", "#3b82f6"]}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.backButton}
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.title}>Upgrade to Premium</Text>
          <Text style={styles.subtitle}>
            Find your perfect match with advanced features
          </Text>
        </View>

        <View style={styles.billingToggle}>
          <TouchableOpacity
            style={StyleSheet.flatten([
              styles.billingOption,
              billingPeriod === "monthly" && styles.billingOptionActive,
            ])}
            onPress={() => {
              setBillingPeriod("monthly");
            }}
          >
            <Text
              style={StyleSheet.flatten([
                styles.billingText,
                billingPeriod === "monthly" && styles.billingTextActive,
              ])}
            >
              Monthly
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={StyleSheet.flatten([
              styles.billingOption,
              billingPeriod === "yearly" && styles.billingOptionActive,
            ])}
            onPress={() => {
              setBillingPeriod("yearly");
            }}
          >
            <Text
              style={StyleSheet.flatten([
                styles.billingText,
                billingPeriod === "yearly" && styles.billingTextActive,
              ])}
            >
              Yearly
            </Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveText}>Save 20%</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.tiersContainer}>
          {subscriptionTiers.map(renderTierCard)}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            • Cancel anytime • Secure payment • Money-back guarantee
          </Text>
        </View>
      </ScrollView>

      {/* Professional Premium Footer */}
      <Footer
        showCopyright
        showLegal
        showVersion={false}
        showSupport
        variant="premium"
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  billingToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  billingOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    position: "relative",
  },
  billingOptionActive: {
    backgroundColor: "#fff",
  },
  billingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
  },
  billingTextActive: {
    color: "#8b5cf6",
  },
  saveBadge: {
    position: "absolute",
    top: -8,
    right: 8,
    backgroundColor: "#10b981",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  saveText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
  tiersContainer: {
    padding: 20,
    gap: 16,
  },
  tierCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  tierCardSelected: {
    borderColor: "#8b5cf6",
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tierCardPopular: {
    borderColor: "#10b981",
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    right: 20,
    backgroundColor: "#10b981",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  tierName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  priceSymbol: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#1f2937",
  },
  pricePeriod: {
    fontSize: 16,
    color: "#6b7280",
    marginLeft: 4,
  },
  discount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
    marginBottom: 16,
  },
  featuresContainer: {
    marginVertical: 16,
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: "#4b5563",
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  subscribeButtonSelected: {
    backgroundColor: "#8b5cf6",
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  footer: {
    padding: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
});
