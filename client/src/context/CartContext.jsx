import { createContext, useContext, useState } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (dish) => {
        const existing = cartItems.find((item) => item._id === dish._id);
        if (existing) {
            toast.success(`+1 ${dish.name}`, {
                icon: '🍽️',
                style: { background: '#1a1a2e', color: '#f0f0f0', border: '1px solid rgba(200,150,62,0.3)' },
            });
            setCartItems((prev) =>
                prev.map((item) =>
                    item._id === dish._id ? { ...item, qty: item.qty + 1 } : item
                )
            );
        } else {
            toast.success(`${dish.name} added to order!`, {
                icon: '✅',
                style: { background: '#1a1a2e', color: '#f0f0f0', border: '1px solid rgba(200,150,62,0.3)' },
            });
            setCartItems((prev) => [...prev, { ...dish, qty: 1 }]);
        }
    };

    const removeFromCart = (id) => {
        setCartItems((prev) => prev.filter((item) => item._id !== id));
    };

    const updateQty = (id, qty) => {
        if (qty < 1) return removeFromCart(id);
        setCartItems((prev) =>
            prev.map((item) => (item._id === id ? { ...item, qty } : item))
        );
    };

    const clearCart = () => setCartItems([]);

    const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart, totalItems, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
};
