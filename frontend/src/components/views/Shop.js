// Shop.js
import "../../styles/shopStyles.css";
import React from "react";

import Cart from './Cart'

export default function Shop({ onAddItem, cartItems, onRemoveItem, totalCost, itemCount }) {
    const items = [
        {
            id: 1,
            name: "Apple",
            price: 10,
            image:
                "https://static.vecteezy.com/system/resources/previews/002/125/334/original/apple-fruit-free-vector.jpg"
        },
        {
            id: 2,
            name: "Orange",
            price: 20,
            image:
                "https://static.vecteezy.com/system/resources/previews/003/789/381/original/fresh-orange-fruit-icon-vector.jpg"
        },
        {
            id: 3,
            name: "Grapes",
            price: 30,
            image:
                "https://static.vecteezy.com/system/resources/previews/011/386/432/original/grapes-fruit-icon-design-template-free-vector.jpg"
        }
    ];

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
