import React from "react";

export default function Cart({ cartItems, onRemoveItem, totalCost }) {
    const handleRemoveItem = (item) => {
        onRemoveItem(item);
    };

    return (
        <div className="cart">
            <h2>
                Cart
                <span>
                    <img src="https://static.vecteezy.com/system/resources/previews/009/157/889/original/shopping-cart-shopping-cart-icon-shopping-cart-design-shopping-cart-icon-sign-shopping-cart-icon-isolated-shopping-cart-symbol-free-vector.jpg" alt="Cart" />{" "}
                </span>
                <p className="total-cost">Total cost: ${totalCost}</p>
            </h2>
            <ul>
                {cartItems.length > 0 ?
                    (
                        <div>
                            {cartItems.map((item, index) => (
                                <li key={index}>
                                    <div className="item-info">
                                        <div>
                                            <img src={item.image} alt={item.name} />
                                        </div>
                                        <div className="item-name">
                                            {item.name} <span className="item-price">${item.price}</span>
                                        </div>
                                        Quantity: {item.quantity}{" "}
                                    </div>
                                    <button onClick={() => handleRemoveItem(item)}>
                                        Remove from cart
                                    </button>
                                </li>
                            ))}</div>
                    ) :
                    (<div><h4>Empty Cart</h4></div>
                    )}
            </ul>
        </div>
    );
}
