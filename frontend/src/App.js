import './styles/AppStyles.css'
import React, { useState } from 'react'

import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useParams,
  useNavigate
} from "react-router-dom";

//Views
import Home from './components/views/Home'
import Shop from './components/views/Shop'
import Cart from './components/views/Cart'
import NotFound from './components/views/NotFound'

export default function App() {
  const [cartItems, setCartItems] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  const addItemToCart = (item) => {
    const isItemInCart = cartItems.some((cartItem) => cartItem.id === item.id);

    if (isItemInCart) {
      const newCartItems = cartItems.map((cartItem) => {
        if (cartItem.id === item.id) {
          return { ...cartItem, quantity: cartItem.quantity + 1 };
        } else {
          return cartItem;
        }
      });

      setCartItems(newCartItems);
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }

    setTotalCost(totalCost + item.price);
    setItemCount(itemCount + 1);
  };

  const removeItemFromCart = (item) => {
    const isLastItem = item.quantity === 1;
    setTotalCost(totalCost - item.price);
    setItemCount(itemCount - 1);

    if (!isLastItem) {
      const updatedItem = { ...item, quantity: item.quantity - 1 };
      const updatedCartItems = cartItems.map((cartItem) =>
        cartItem.id === updatedItem.id ? updatedItem : cartItem
      );
      setCartItems(updatedCartItems);
    } else {
      const newCartItems = cartItems.filter(
        (cartItem) => cartItem.id !== item.id
      );
      setCartItems(newCartItems);
    }
  };

  return (
    <Router>
      <div className="App">
        <nav>
          <Link className="nav" to="/">
            Home
          </Link>
          <Link className="nav" id="shop" to="/shop">
            Shop
          </Link>
          <Link className="nav" id="cart" to="/cart">
            Cart
          </Link>
        </nav>
      </div>
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />
        <Route
          path="/shop"
          element={<Shop
            onAddItem={addItemToCart} 
            cartItems={cartItems}
            onRemoveItem={removeItemFromCart}
            totalCost={totalCost}
            itemCount={itemCount} />}
        />
        <Route
          path="/cart"
          element={<Cart
            cartItems={cartItems}
            onRemoveItem={removeItemFromCart}
            totalCost={totalCost}
            itemCount={itemCount}
          />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}