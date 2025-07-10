import { StyleSheet, SafeAreaView, View, Text, FlatList, Dimensions, Pressable, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image } from "expo-image";
import { useState, useEffect } from "react";
import { getImagesFromFileSystem } from "@/lib/imageUtils";
import { useTimerStore } from "@/stores/timerStore";

const { width } = Dimensions.get('window');
const numColumns = 2;
const imageSize = (width - 60) / numColumns; // 60 = padding + gap

interface GalleryImage {
  uri: string;
  name: string;
}

export default function GalleryScreen() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setBackgroundImage } = useTimerStore();

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      // Load images from file system
      const galleryImages = await getImagesFromFileSystem();
      setImages(galleryImages);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  const handleImagePress = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleSetAsBackground = () => {
    if (selectedImage) {
      setBackgroundImage({ uri: selectedImage.uri });
      handleCloseModal();
      router.back();
    }
  };

  const renderImage = ({ item }: { item: GalleryImage }) => (
    <Pressable 
      style={styles.imageContainer} 
      onPress={() => handleImagePress(item)}
    >
      <Image
        source={{ uri: item.uri }}
        style={styles.image}
        contentFit="contain"
        placeholder="loading..."
        transition={200}
        cachePolicy="memory-disk"
      />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <Feather name="arrow-left" size={24} color="black" />
        </Pressable>
        <Text style={styles.title}>Gallery</Text>
        <View style={styles.placeholder} />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading images...</Text>
        </View>
      ) : images.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather name="image" size={64} color="gray" />
          <Text style={styles.emptyText}>No images yet</Text>
          <Text style={styles.emptySubtext}>Generated images will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={images}
          renderItem={renderImage}
          keyExtractor={(item) => item.uri}
          numColumns={numColumns}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={true}
        />
      )}

      <Modal
        visible={selectedImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalCloseButton} onPress={handleCloseModal}>
            <Feather name="x" size={24} color="white" />
          </Pressable>
          {selectedImage && (
            <>
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.modalImage}
                contentFit="contain"
                transition={200}
                cachePolicy="memory-disk"
              />
              <View style={styles.modalButtonContainer}>
                <Pressable style={styles.setBackgroundButton} onPress={handleSetAsBackground}>
                  <Feather name="home" size={20} color="white" />
                  <Text style={styles.setBackgroundButtonText}>Set as Background</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(221, 183, 116)",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: 'LXGWWenKaiMonoTC-Bold',
    color: 'black',
  },
  placeholder: {
    width: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'LXGWWenKaiMonoTC-Regular',
    color: 'black',
  },
  emptyText: {
    fontSize: 20,
    fontFamily: 'LXGWWenKaiMonoTC-Bold',
    color: 'gray',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    fontFamily: 'LXGWWenKaiMonoTC-Regular',
    color: 'gray',
    marginTop: 8,
  },
  gridContainer: {
    padding: 20,
  },
  imageContainer: {
    margin: 5,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: imageSize,
    height: imageSize,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    padding: 8,
  },
  modalImage: {
    width: width - 40,
    height: width - 40,
  },
  modalButtonContainer: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  setBackgroundButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'white',
  },
  setBackgroundButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'LXGWWenKaiMonoTC-Regular',
    marginLeft: 8,
  },
}); 
