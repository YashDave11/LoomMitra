import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import { apiClient } from "@/lib/apiClient";
import type { Product } from "@/lib/types";
import { Header, Text, Input, Button, LoadingState, ErrorState } from "@/components/ui";
import { colors, spacing } from "@/theme";

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  
  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setStatus("loading");
    try {
      const p = await apiClient.getProduct(id);
      setProduct(p);
      setTitle(p.title);
      setDescription(p.description || "");
      setPrice(p.price.toString());
      setStock(p.stock.toString());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function onSave() {
    if (!product) return;
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock, 10);
    
    if (!title.trim() || isNaN(parsedPrice) || isNaN(parsedStock)) {
      Alert.alert("Invalid Input", "Please fill out all required fields correctly.");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.updateProduct(product.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        price: parsedPrice,
        stock: parsedStock,
      });
      Alert.alert("Success", "Product updated successfully", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch {
      Alert.alert("Error", "Failed to update product.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") return <LoadingState />;
  if (status === "error" || !product) return <ErrorState title="Failed to load product" onRetry={load} />;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <Header onBack={() => router.back()} title="Edit Product" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Input 
            label="Title *"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Handwoven Silk Saree"
          />
          <Input 
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the product..."
            multiline
            numberOfLines={4}
          />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input 
                label="Price (₹) *"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.gap} />
            <View style={{ flex: 1 }}>
              <Input 
                label="Stock *"
                value={stock}
                onChangeText={setStock}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <Button 
          label="Save Changes" 
          size="lg" 
          onPress={onSave} 
          loading={submitting} 
          style={{ marginTop: spacing.xl }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  section: { gap: spacing.lg },
  row: { flexDirection: "row" },
  gap: { width: spacing.md },
});
