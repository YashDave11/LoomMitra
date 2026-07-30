import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { Camera, ImagePlus, X } from "lucide-react-native";
import type { LocalFile } from "@/lib/apiClient";
import { colors, radius, spacing, touch } from "@/theme";
import { Button, Text } from "@/components/ui";

interface Props {
  files: LocalFile[];
  onChange: (files: LocalFile[]) => void;
}

/** Guess a filename + mime from an asset picked by expo-image-picker. */
function toLocalFile(asset: ImagePicker.ImagePickerAsset): LocalFile {
  const name = asset.fileName ?? asset.uri.split("/").pop() ?? `photo-${Date.now()}.jpg`;
  const type = asset.mimeType ?? "image/jpeg";
  return { uri: asset.uri, name, type };
}

/**
 * Camera + gallery photo picker used by the listing wizard. Big buttons and a
 * 3-up thumbnail grid; each thumb has a 32dp remove target.
 */
export function ImageUploader({ files, onChange }: Props) {
  const { t } = useTranslation("product");

  async function pickFromCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t("wizard.takePhoto"), t("form.images.hint"));
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!res.canceled) {
      const newFiles = [...files, ...res.assets.map(toLocalFile)];
      if (newFiles.length > 5) {
        Alert.alert(t("form.images.label"), t("form.images.limitExceeded", { defaultValue: "Maximum 5 images allowed." }));
      }
      onChange(newFiles.slice(0, 5));
    }
  }

  async function pickFromGallery() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!res.canceled) {
      const newFiles = [...files, ...res.assets.map(toLocalFile)];
      if (newFiles.length > 5) {
        Alert.alert(t("form.images.label"), t("form.images.limitExceeded", { defaultValue: "Maximum 5 images allowed." }));
      }
      onChange(newFiles.slice(0, 5));
    }
  }

  function remove(uri: string) {
    onChange(files.filter((f) => f.uri !== uri));
  }

  return (
    <View style={styles.wrap}>
      <Button
        label={t("wizard.takePhoto")}
        size="lg"
        icon={<Camera size={22} color={colors.inkOnDark} />}
        onPress={pickFromCamera}
      />
      <Button
        label={t("wizard.gallery")}
        size="lg"
        variant="outline"
        icon={<ImagePlus size={22} color={colors.ink} />}
        onPress={pickFromGallery}
      />

      {files.length > 0 ? (
        <View style={styles.grid}>
          {files.map((f) => (
            <View key={f.uri} style={styles.thumbWrap}>
              <Image source={{ uri: f.uri }} style={styles.thumb} contentFit="cover" />
              <Pressable
                onPress={() => remove(f.uri)}
                accessibilityRole="button"
                accessibilityLabel={t("wizard.removePhoto")}
                style={styles.removeBtn}
                hitSlop={8}
              >
                <X size={16} color={colors.inkOnDark} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  thumbWrap: { width: "31%", aspectRatio: 1, borderRadius: radius.md, overflow: "hidden" },
  thumb: { width: "100%", height: "100%" },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
});
