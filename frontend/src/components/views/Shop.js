import '../../styles/shopStyles.css'
import React, { useState, useEffect } from "react";
import Cart from './Cart';
import axios from 'axios'; 
export default function Shop({ onAddItem, cartItems, onRemoveItem, totalCost, itemCount }) {
    const [items, setItems] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:3000/api/fruits/')
            .then(response => setItems(response.data.data.fruits))
            .catch(error => console.error('Error fetching items:', error));
    }, []);

    const handleAddItem = (item) => {
        onAddItem(item);
    };

    return (
        <div>
            <h1>Shopping Cart</h1>
            <ItemList items={items} onAddItem={handleAddItem} />
            <Cart
                cartItems={cartItems}
                onRemoveItem={onRemoveItem}
                totalCost={totalCost}
                itemCount={itemCount}
            />
        </div>
    );
}

function ItemList({ items, onAddItem }) {
    return (
        <div className="item-list">
            <h2>Items</h2>
            <ul>
                {items.map((item) => (
                    <li key={item.id}>
                        <div className="item-info">
                            <div>
                                <img src={item.image} alt={item.name} />
                            </div>
                            <div className="item-name">
                                {item.name} <span className="item-price">${item.price} </span>
                            </div>
                        </div>
                        <button onClick={() => onAddItem(item)}>Add to cart</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
