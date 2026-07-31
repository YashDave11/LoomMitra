import { useState, useEffect } from "react";
import { Alert, ScrollView, StyleSheet, View, Dimensions, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { ShieldCheck, MapPin, Search, QrCode, X } from "lucide-react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

import { apiClient, ApiError } from "@/lib/apiClient";
import type { DiscoverProduct } from "@/lib/types";
import { Header, Text, Input, Button, Card, Badge } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { optionLabel } from "@/lib/productOptions";
import { colors, radius, spacing } from "@/theme";

export default function CustomerVerifyScreen() {
  const { t } = useTranslation(["product", "common"]);
  const [productId, setProductId] = useState("");
  const [searching, setSearching] = useState(false);
  const [product, setProduct] = useState<DiscoverProduct | null>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [showScanner, setShowScanner] = useState(false);
  const [scanned, setScanned] = useState(false);

  // Parse QR data, which might be a raw ID or a URL with ?p=ID or ?id=ID
  function parseQRData(data: string) {
    if (!data) return "";
    
    // First, try regex to safely extract ?p= or ?id= regardless of URL parsing
    const match = data.match(/[\?&](?:p|id)=([^&#]+)/);
    if (match && match[1]) {
      return match[1];
    }
    
    // Fallback: if it's a URL but no p/id param, or a raw string
    try {
      // This might fail in some React Native environments if URL is malformed
      const url = new URL(data);
      const p = url.searchParams.get("p") || url.searchParams.get("id");
      if (p) return p;
      
      const parts = url.pathname.split("/").filter(Boolean);
      return parts.pop() || data;
    } catch {
      return data;
    }
  }

  async function lookup(idToLookUp?: string) {
    // Ensure idToLookUp is actually a string (not an event object)
    const rawId = typeof idToLookUp === "string" ? idToLookUp : productId;
    const id = rawId.trim();
    
    if (!id) return;
    setSearching(true);
    setProduct(null);
    try {
      const p = await apiClient.getDiscoverProduct(id);
      setProduct(p);
      setProductId(id); // update input to reflect scanned ID
    } catch (err) {
      Alert.alert("Not Found", "Could not find a product with that ID.");
    } finally {
      setSearching(false);
    }
  }

  async function openScanner() {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert("Permission Required", "Camera access is needed to scan QR codes.");
        return;
      }
    }
    setScanned(false);
    setShowScanner(true);
  }

  if (showScanner) {
    return (
      <View style={styles.scannerContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={({ data }) => {
            if (scanned) return;
            setScanned(true);
            setShowScanner(false);
            const id = parseQRData(data);
            setProductId(id);
            lookup(id);
          }}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />
        <SafeAreaView style={styles.scannerOverlayContainer}>
          <View style={styles.scannerHeader}>
            <Text variant="h2" style={{ color: "white" }}>Scan QR Code</Text>
            <Button 
              icon={<X size={24} color={colors.inkOnDark} />} 
              onPress={() => setShowScanner(false)}
              variant="primary"
            />
          </View>
          <View style={styles.scannerTargetArea}>
            <View style={styles.scannerTargetBox} />
          </View>
          <View style={styles.scannerFooter}>
            <Text style={{ color: "white", textAlign: "center" }}>
              Align the QR code within the frame to scan.
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Header title="Verify Authenticity" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text color={colors.neutral500} style={{ marginBottom: spacing.md }}>
          Scan or enter a product's LoomMitra QR code ID to verify its origin and authenticity.
        </Text>

        <Card style={styles.searchCard}>
          <Input
            value={productId}
            onChangeText={setProductId}
            placeholder="Enter Product ID..."
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <Button
              style={{ flex: 1 }}
              label="Look Up"
              icon={<Search size={20} color={colors.inkOnDark} />}
              onPress={() => lookup()}
              loading={searching}
            />
            <Button
              variant="outline"
              icon={<QrCode size={20} color={colors.ink} />}
              onPress={openScanner}
            />
          </View>
        </Card>

        {product && (
          <Card style={styles.resultCard}>
            <View style={styles.verifiedHeader}>
              <ShieldCheck size={24} color={colors.success} />
              <Text variant="bodyStrong" color={colors.success}>Product Verified</Text>
            </View>

            <View style={styles.imageContainer}>
              {product.images?.[0] ? (
                <Image source={{ uri: product.images[0].url }} style={styles.image} contentFit="cover" />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text color={colors.neutral400}>No Image</Text>
                </View>
              )}
            </View>

            <View style={styles.details}>
              <Badge label={product.type} tone="neutral" />
              <Text variant="h2">{product.title}</Text>
              
              {product.location ? (
                <View style={styles.row}>
                  <MapPin size={16} color={colors.neutral500} />
                  <Text color={colors.neutral500}>{optionLabel(t, "cluster", product.location)}</Text>
                </View>
              ) : null}

              {product.description ? (
                <Text color={colors.neutral700}>{product.description}</Text>
              ) : null}

              <View style={styles.grid}>
                {product.material && (
                  <View style={styles.gridItem}>
                    <Text variant="caption" color={colors.neutral500}>Material</Text>
                    <Text variant="bodyStrong">{optionLabel(t, "material", product.material)}</Text>
                  </View>
                )}
                <View style={styles.gridItem}>
                  <Text variant="caption" color={colors.neutral500}>Price</Text>
                  <Text variant="bodyStrong">{formatPrice(product.price)}</Text>
                </View>
              </View>

              {product.user?.weaverProfile && (
                <View style={styles.weaverBox}>
                  <View style={styles.weaverAvatar}>
                    <Text variant="bodyStrong" style={{ color: colors.inkOnDark }}>
                      {product.user.weaverProfile.name?.charAt(0) || "W"}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyStrong">{product.user.weaverProfile.name}</Text>
                    <Text variant="caption" color={colors.neutral500}>{product.user.weaverProfile.cluster} Cluster</Text>
                  </View>
                  <Badge label="Verified" tone="success" />
                </View>
              )}
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing["4xl"] },
  searchCard: { padding: spacing.lg, gap: spacing.md, marginBottom: spacing.lg },
  resultCard: { borderColor: colors.success, borderWidth: 2, padding: 0, overflow: "hidden" },
  verifiedHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, backgroundColor: colors.success + "15" },
  imageContainer: { width: "100%", aspectRatio: 4/5, backgroundColor: colors.neutral100 },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  details: { padding: spacing.lg, gap: spacing.md },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  gridItem: { flex: 1, minWidth: "40%", padding: spacing.md, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.neutral200 },
  weaverBox: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, backgroundColor: colors.neutral100, borderRadius: radius.md, marginTop: spacing.sm },
  weaverAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.ink, justifyContent: "center", alignItems: "center" },
  scannerContainer: { flex: 1, backgroundColor: "black" },
  scannerOverlayContainer: { flex: 1, justifyContent: "space-between" },
  scannerHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: spacing.lg, backgroundColor: "rgba(0,0,0,0.5)" },
  scannerTargetArea: { flex: 1, justifyContent: "center", alignItems: "center" },
  scannerTargetBox: { width: 250, height: 250, borderWidth: 2, borderColor: "white", borderRadius: radius.md, backgroundColor: "transparent" },
  scannerFooter: { padding: spacing.lg, backgroundColor: "rgba(0,0,0,0.5)" },
});
