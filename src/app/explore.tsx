import { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useFileStore } from '@/store/fileStore';
import { FileManager } from '@/services/fileManager';

export default function FilesScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const files = useFileStore((state) => state.files);
  const removeFile = useFileStore((state) => state.removeFile);
  const [refreshing, setRefreshing] = useState(false);

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  const handleDeleteFile = async (id: string, path: string) => {
    const success = await FileManager.deleteFile(path);
    if (success) {
      removeFile(id);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // In a real app, you might reload from disk here
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Received Files</ThemedText>
          {files.length > 0 && (
            <ThemedText type="small" style={styles.fileCount}>
              {files.length} file{files.length !== 1 ? 's' : ''}
            </ThemedText>
          )}
        </ThemedView>

        {files.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <ThemedText type="default" style={styles.emptyText}>
              No files received yet
            </ThemedText>
            <ThemedText type="small" style={styles.emptySubtext}>
              Files sent from your desktop will appear here
            </ThemedText>
          </ThemedView>
        ) : (
          <ThemedView style={styles.filesList}>
            {files.map((file) => (
              <ThemedView key={file.id} style={styles.fileItem}>
                <ThemedView style={styles.fileInfo}>
                  <ThemedText type="default" style={styles.fileName}>
                    {file.name}
                  </ThemedText>
                  <ThemedText type="small" style={styles.fileDetails}>
                    {FileManager.formatFileSize(file.size)} • {new Date(file.receivedAt).toLocaleDateString()}
                  </ThemedText>
                </ThemedView>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteFile(file.id, file.path)}
                >
                  <ThemedText style={styles.deleteText}>×</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            ))}
          </ThemedView>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
  },
  header: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    alignItems: 'center',
  },
  fileCount: {
    opacity: 0.6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
    gap: Spacing.two,
  },
  emptyText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    opacity: 0.6,
    textAlign: 'center',
  },
  filesList: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  fileInfo: {
    flex: 1,
    gap: Spacing.one,
  },
  fileName: {
    fontWeight: '500',
    marginRight: Spacing.two,
  },
  fileDetails: {
    opacity: 0.6,
  },
  deleteButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.one,
  },
  deleteText: {
    fontSize: 24,
    fontWeight: '300',
    opacity: 0.5,
  },
});
