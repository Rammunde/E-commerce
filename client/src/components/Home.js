import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const products = [
    {
      id: 1,
      image: require('./Images/Mobile.jpg'),
      name: "Product 1",
      price: "$10.00",
      description: "This is a description for product 1.",
    },
    {
      id: 2,
      image: require('./Images/mobile-2.jpg'),
      name: "Product 2",
      price: "$20.00",
      description: "This is a description for product 2.",
    },
    {
      id: 3,
      image: require('./Images/Watch.jfif'),
      name: "Product 3",
      price: "$30.00",
      description: "This is a description for product 3.",
    },
    {
      id: 4,
      image: require('./Images/mobile-3.jpg'),
      name: "Product 4",
      price: "$40.00",
      description: "This is a description for product 4.",
    },
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  

  const productListStyle = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: "20px",
  };

  const cardStyle = {
    border: "1px solid #ddd",
    borderRadius: "8px",
    width: "200px",
    padding: "16px",
    margin: "16px",
    textAlign: "center",
  };

  const imgStyle = {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    borderRadius: "8px 8px 0 0",
  };

  const handleReadMore = (id) => {
    navigate(`/product/${id}`);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div>
      <div style={{ padding: "20px", textAlign: "center" }}>
        <input
          type="text"
          placeholder="Search for products..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={{
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            width: "80%",
            maxWidth: "600px",
          }}
        />
      </div>
      <div style={productListStyle}>
        {filteredProducts.map((product) => (
          <div key={product.id} style={cardStyle}>
            <img src={product.image} alt={product.name} style={imgStyle} />
            <h3>{product.name}</h3>
            <p>{product.price}</p>
            <p>{product.description}</p>
            <button onClick={() => handleReadMore(product.id)}>Read More</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
