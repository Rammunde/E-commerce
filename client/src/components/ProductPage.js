import React from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const products = [
        {
            id: 1,
            images: [
                require('./Images/Mobile.jpg'),
                require('./Images/mobile-2.jpg'),
                require('./Images/Watch.jfif'),
            ],
            name: "Product 1",
            price: "$10.00",
            description: "This is a detailed description for product 1.",
        },
        {
            id: 2,
            images: [
                require('./Images/mobile-2.jpg'),
                require('./Images/Mobile.jpg'),
                require('./Images/Watch.jfif'),
            ],
            name: "Product 2",
            price: "$20.00",
            description: "This is a detailed description for product 2.",
        },
        {
            id: 3,
            images: [
                require('./Images/Watch.jfif'),
                require('./Images/Mobile.jpg'),
                require('./Images/mobile-2.jpg'),
            ],
            name: "Product 3",
            price: "$30.00",
            description: "This is a detailed description for product 3.",
        },
        {
            id: 4,
            images: [
                require('./Images/mobile-3.jpg'),
                require('./Images/Mobile.jpg'),
                require('./Images/mobile-2.jpg'),
            ],
            name: "Product 4",
            price: "$40.00",
            description: "This is a detailed description for product 4.",
        },
    ];

    const product = products.find((prod) => prod.id.toString() === id);

  

    const imageSectionStyle = {
        flex: "1",
    };


    const thumbnailsStyle = {
        display: "flex",
        gap: "10px",
        marginTop: "10px",
    };
    const containerStyle = {
        display: "flex",
        flexWrap: "wrap", // Allows items to wrap to the next line
        padding: "20px",
        gap: "20px", // Space between items
      };
      
      const productContainerStyle = {
        flex: "1 1 calc(25% - 20px)", // Responsive width with margin
        boxSizing: "border-box",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "10px",
        marginBottom: "20px",
        maxWidth: "calc(25% - 20px)", // Ensures items don’t exceed this width
        height: "500px", // Set a fixed height for the container
        display: "flex",
        flexDirection: "column", // Aligns children vertically
        overflow: "hidden", // Ensures content does not overflow
      };
      
      
      const mainImageStyle = {
        width: "100%",
        height: "auto",
        maxHeight: "200px", // Fixed height for images
        objectFit: "cover", // Ensures images cover the area
        borderRadius: "8px",
      };
      
    
      
      const thumbnailImageStyle = {
        width: "60px",
        height: "60px",
        objectFit: "cover",
        borderRadius: "8px",
        cursor: "pointer",
        border: "1px solid #ddd",
      };
      
      const productDetailStyle = {
        // flex: "1",
        // padding: "10px",
        // display: "flex",
        // flexDirection: "column", // Aligns text vertically
        // justifyContent: "space-between", // Ensures space between elements
        // height: "100%", // Makes sure details take the remaining height
      };

      const containerStyle1 = {
        display: 'flex',
        flexDirection: 'row',
        padding: '20px',
        gap: '20px',
        justifyContent: 'center',
        width: '100%',
        minHeight: '100vh',
        boxSizing: 'border-box',
    };
    
    const imageContainerStyle1 = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: '1',
    };
    
    const mainImageStyle1 = {
        width: '400px',  // Fixed width
        height: 'auto',  // Maintain aspect ratio
        // borderRadius: '8px',
        // boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    };
    
    const thumbnailContainerStyle1 = {
        display: 'flex',
        marginTop: '10px',
        gap: '10px',
    };
    
    const thumbnailStyle1 = {
        width: '80px',
        height: '80px',
        objectFit: 'cover',
        // borderRadius: '8px',
        cursor: 'pointer',
        // border: '2px solid #ddd',
        // transition: 'border-color 0.3s',
    };
    
    const thumbnailHoverStyle1 = {
        ...thumbnailStyle1,
        // borderColor: '#007bff',
    };
    
    const detailContainerStyle1 = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        flex: '1',
        maxWidth: '400px',
        width: '100%',
        // padding: '20px',
        // border: '1px solid #ddd',
        // borderRadius: '8px',
        // boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    };
    
    const titleStyle1 = {
        fontSize: '24px',
        fontWeight: 'bold',
        margin: '10px 0',
    };
    
    const priceStyle1 = {
        fontSize: '20px',
        color: '#28a745',
        margin: '10px 0',
    };
    
    const descriptionStyle1 = {
        fontSize: '16px',
        color: '#555',
        marginBottom: '20px',
    };
    
    const cartButtonStyle1 = {
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        // borderRadius: '4px',
        padding: '10px 20px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background-color 0.3s',
    };
    
    const cartButtonHoverStyle1 = {
        ...cartButtonStyle1,
        backgroundColor: '#0056b3',
    };
    
    const handleThumbnailClick = (image) => {
        const mainImage = document.getElementById("mainImage");
        if (mainImage) {
            mainImage.src = image;
        }
    };

    const handleAddToCart = (id) => {
        console.log("id", id);
        if (typeof id === 'object') {
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            cart.push(product);
            localStorage.setItem("cart", JSON.stringify(cart));
            navigate("/cart");
        }
        else {
            const matchingProducts = products.filter((prod) => prod.id.toString() === id.toString());
            const product = matchingProducts.length > 0 ? matchingProducts[0] : null;
            console.log("Matching product", product)
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            cart.push(product);
            localStorage.setItem("cart", JSON.stringify(cart));
            navigate("/cart");
        }
    };



    if (!product) {
        return (
            <div style={containerStyle}>
                {/* <h1>All Products</h1> */}
                {products.map((prod) => (
                    <div key={prod.id} style={productContainerStyle}>
                        <div style={imageSectionStyle}>
                            <img
                                src={prod.images[0]}
                                alt={prod.name}
                                style={mainImageStyle}
                            />
                            <div style={thumbnailsStyle}>
                                {prod.images.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image}
                                        alt={`${prod.name} thumbnail ${index + 1}`}
                                        style={thumbnailImageStyle}
                                        onClick={() => handleThumbnailClick(image)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div style={productDetailStyle}>
                            <h1>{prod.name +"  "+prod.price}</h1>
                            <p>{prod.description}</p>
                            <button onClick={() => handleAddToCart(prod.id)}>Add to Cart</button>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div style={containerStyle1}>
            <div style={imageContainerStyle1}>
                <img
                    id="mainImage"
                    src={product.images[0]}
                    alt={product.name}
                    style={mainImageStyle1}
                />
                <div style={thumbnailContainerStyle1}>
                    {product.images.map((image, index) => (
                        <img
                            key={index}
                            src={image}
                            alt={`${product.name} thumbnail ${index + 1}`}
                            style={thumbnailStyle1}
                            onClick={() => handleThumbnailClick(image)}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = thumbnailHoverStyle1.borderColor}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = thumbnailStyle1.borderColor}
                        />
                    ))}
                </div>
            </div>
            <div style={detailContainerStyle1}>
                <h1 style={titleStyle1}>{product.name}</h1>
                <h2 style={priceStyle1}>{product.price}</h2>
                <p style={descriptionStyle1}>{product.description}</p>
                <button
                    style={cartButtonStyle1}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = cartButtonHoverStyle1.backgroundColor}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = cartButtonStyle1.backgroundColor}
                    onClick={handleAddToCart}
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default ProductPage;
