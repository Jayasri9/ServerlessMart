function ProductCard({ name, price, image }) {
  console.log("ProductCard received:", { 
    name, 
    price, 
    image: image ? image.substring(0, 50) + "..." : "null" 
  });
  
  return (
    <div className="product-card">
      <img 
        src={image} 
        alt={name}
        onError={(e) => {
          console.log("Image failed to load for:", name, "fallback to default");
          e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop";
        }}
        onLoad={() => {
          console.log("Image loaded successfully for:", name);
        }}
      />
      <h4>{name}</h4>
      <p>₹{price}</p>
    </div>
  );
}

export default ProductCard;