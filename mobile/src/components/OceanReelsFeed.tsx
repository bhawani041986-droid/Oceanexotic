import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, Dimensions, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Volume2, VolumeX, ShoppingBag, Heart, Share2, MoreHorizontal } from 'lucide-react-native';
import { Image } from 'expo-image';
import axios from 'axios';

// The backend endpoint serving the products
const API_URL = 'https://oceanexotic.com/api/seller/products';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_status: string;
  main_image_url: string;
  video_url?: string;
  category: string;
}

const ReelItem = ({ item, isVisible }: { item: Product, isVisible: boolean }) => {
  const [isMuted, setIsMuted] = useState(true);

  // Initialize the video player
  const player = useVideoPlayer(item.video_url || '', (player) => {
    player.loop = true;
    player.muted = true;
  });

  // Play or pause based on visibility
  useEffect(() => {
    if (isVisible) {
      player.play();
    } else {
      player.pause();
    }
  }, [isVisible, player]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    player.muted = !isMuted;
  };

  return (
    <View style={styles.container}>
      <VideoView 
        style={styles.video} 
        player={player} 
        allowsFullscreen={false} 
        allowsPictureInPicture={false}
        contentFit="cover"
      />
      
      {/* Overlay Content */}
      <View style={styles.overlay}>
        {/* Right Action Bar */}
        <View style={styles.actionBar}>
          <Pressable style={styles.actionButton}>
            <Heart size={28} color="white" />
            <Text style={styles.actionText}>Like</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton}>
            <Share2 size={28} color="white" />
            <Text style={styles.actionText}>Share</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton} onPress={toggleMute}>
            {isMuted ? (
              <VolumeX size={28} color="white" />
            ) : (
              <Volume2 size={28} color="white" />
            )}
          </Pressable>
        </View>

        {/* Bottom Info Bar */}
        <View style={styles.infoBar}>
          <View style={styles.productBadge}>
            <Image 
              source={{ uri: item.main_image_url || 'https://oceanexotic.com/og-image.jpg' }} 
              style={styles.productThumb} 
            />
            <View>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
            </View>
          </View>
          <Text style={styles.description} numberOfLines={2}>
            {item.description || 'Premium OceanExotic Seafood'}
          </Text>
          
          <Pressable style={styles.buyButton}>
            <ShoppingBag size={18} color="white" />
            <Text style={styles.buyText}>ADD TO CART</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default function OceanReelsFeed() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const response = await axios.get(API_URL);
        const data = response.data;
        if (data.status === 'success' && data.data) {
          // Filter only products that have a video attached
          const videoProducts = data.data.filter((p: Product) => p.video_url && p.video_url !== '');
          setProducts(videoProducts);
        }
      } catch (error) {
        console.error("Failed to fetch Ocean Reels:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReels();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (products.length === 0) {
    // If no videos, return empty view so it doesn't take up space
    return null;
  }

  return (
    <View style={{ height: SCREEN_HEIGHT * 0.7, width: SCREEN_WIDTH, backgroundColor: '#000' }}>
      <FlatList
        data={products}
        horizontal
        renderItem={({ item, index }) => (
          <ReelItem item={item} isVisible={activeVideoIndex === index} />
        )}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={({ viewableItems }) => {
          if (viewableItems.length > 0) {
            setActiveVideoIndex(viewableItems[0].index || 0);
          }
        }}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
    backgroundColor: '#000',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
  },
  actionBar: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 100,
    gap: 24,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  infoBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  productBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  productThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  productName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productPrice: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '800',
  },
  description: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 16,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  buyText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '900',
  }
});
