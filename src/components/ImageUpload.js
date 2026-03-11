import { useState, useRef } from "react";

const ImageUpload = ({ onImageUpload, currentImage }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    console.log("File selected:", file);
    console.log("File type:", file?.type);
    console.log("File size:", file?.size);
    
    if (!file) {
      console.error("No file provided");
      alert("Please select a file");
      return;
    }
    
    if (!file.type || !file.type.startsWith('image/')) {
      console.error("Invalid file type:", file?.type);
      alert("Please select an image file (JPG, PNG, GIF, WebP)");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }
    
    setUploading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        console.log("FileReader onload triggered");
        const base64 = e.target.result;
        console.log("Base64 length:", base64.length);
        onImageUpload(base64);
        setUploading(false);
      } catch (error) {
        console.error("Error processing image:", error);
        alert("Failed to process image. Please try a different image.");
        setUploading(false);
      }
    };
    reader.onerror = (error) => {
      console.error("Failed to read file:", error);
      alert("Failed to read image file. Please try again.");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    console.log("Drop event triggered");
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    console.log("Dropped files:", files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    console.log("Drag over event");
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    console.log("Drag leave event");
    setDragActive(false);
  };

  const handleClick = () => {
    console.log("Click event triggered");
    fileInputRef.current?.click();
  };

  return (
    <div style={{ border: "2px dashed #ddd", borderRadius: "8px", padding: "20px", textAlign: "center" }}>
      {currentImage ? (
        <div style={{ marginBottom: "15px" }}>
          <img
            src={currentImage}
            alt="Current product"
            style={{ maxWidth: "200px", maxHeight: "200px", borderRadius: "8px" }}
          />
          <div style={{ marginTop: "10px" }}>
            <button
              onClick={handleClick}
              style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                cursor: "pointer",
                borderRadius: "4px"
              }}
            >
              Change Image
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
          style={{
            border: dragActive ? "2px solid #007bff" : "2px dashed #ddd",
            borderRadius: "8px",
            padding: "40px 20px",
            backgroundColor: dragActive ? "#f8f9ff" : "#f9f9f9",
            cursor: "pointer"
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) {
                handleFileSelect(files[0]);
              }
            }}
            style={{ display: "none" }}
          />
          
          {uploading ? (
            <div>
              <div style={{ fontSize: "24px", marginBottom: "10px" }}>⏳</div>
              <div>Uploading image...</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: "48px", marginBottom: "10px" }}>📷</div>
              <div style={{ fontSize: "16px", color: "#666" }}>
                Drag & drop an image here or click to browse
              </div>
              <div style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}>
                Supports: JPG, PNG, GIF, WebP (Max 5MB)
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;