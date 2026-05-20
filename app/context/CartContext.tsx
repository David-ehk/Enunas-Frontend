'use client'
import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

// Cart Item Type
export interface CartItem {
  id: string
  productId: string
  name: string
  brand: string
  price: number
  currency: string
  size: string
  color?: {
    id: string
    name: string
    hex: string
  }
  image: string
  quantity: number
  defaultListingId?: string
  productPath?: string
}

interface CartContextType {
  // Cart State
  isCartOpen: boolean
  cartItems: CartItem[]
  
  // Cart Actions
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  
  // Item Actions
  addToCart: (item: Omit<CartItem, 'id' | 'quantity'>) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  
  // Computed Values
  itemCount: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([]) // ← Diese Zeile war wichtig!

  // Cart Actions
  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)
  const toggleCart = () => setIsCartOpen(prev => !prev)

  // ✅ localStorage: Beim Start laden
  useEffect(() => {
    const saved = localStorage.getItem('cart')
    if (saved) {
      try {
        setCartItems(JSON.parse(saved))
      } catch (error) {
        console.error('Fehler beim Laden des Carts:', error)
      }
    }
  }, [])

  // ✅ localStorage: Bei Änderung speichern
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems))
    }
  }, [cartItems])

  // Add Item to Cart
  const addToCart = (item: Omit<CartItem, 'id' | 'quantity'>) => {
    setCartItems(prev => {
      const existingItem = prev.find(
        i => i.productId === item.productId && 
             i.size === item.size && 
             i.color?.id === item.color?.id
      )

      if (existingItem) {
        return prev.map(i =>
          i.id === existingItem.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }

      const newItem: CartItem = {
        ...item,
        id: `${item.productId}-${item.size}-${item.color?.id || 'default'}-${Date.now()}`,
        quantity: 1
      }
      return [...prev, newItem]
    })
  }

  // Remove Item
  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId))
  }

  // Update Quantity
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }

    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    )
  }

  // Clear Cart
  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('cart')
  }

  // Computed Values
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        isCartOpen,
        cartItems,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart muss innerhalb von CartProvider verwendet werden')
  }
  return context
}