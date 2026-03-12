import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

export const useRealtimeProducts = (onProductAdded, onProductUpdated, onProductDeleted) => {
  const { socket, connected } = useSocket();

  useEffect(() => {
    if (!socket || !connected) return;

    // Listen for new products
    const handleProductAdded = (product) => {
      console.log('📦 New product added:', product);
      toast.success(`New product available: ${product.name}`);
      if (onProductAdded) {
        onProductAdded(product);
      }
    };

    // Listen for product updates
    const handleProductUpdated = (product) => {
      console.log('📦 Product updated:', product);
      if (onProductUpdated) {
        onProductUpdated(product);
      }
    };

    // Listen for product deletions
    const handleProductDeleted = (data) => {
      console.log('📦 Product deleted:', data.productId);
      if (onProductDeleted) {
        onProductDeleted(data.productId);
      }
    };

    socket.on('product-added', handleProductAdded);
    socket.on('product-updated', handleProductUpdated);
    socket.on('product-deleted', handleProductDeleted);

    return () => {
      socket.off('product-added', handleProductAdded);
      socket.off('product-updated', handleProductUpdated);
      socket.off('product-deleted', handleProductDeleted);
    };
  }, [socket, connected, onProductAdded, onProductUpdated, onProductDeleted]);

  return { connected };
};
