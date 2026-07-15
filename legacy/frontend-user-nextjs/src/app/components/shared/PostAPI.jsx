// components/PostAPI.jsx
"use client";

import { useState } from "react";

export default function PostAPI({ 

  previewStageRef, 
  localData, 
  fontsUsed,
  finalDimensions,
  onPostSuccess, 
  onPostError 
}) {
  const [isPosting, setIsPosting] = useState(false);
  console.log('sscss', finalDimensions)

  // 🔹 define helper function outside postToAPI
  const uploadToImgBB = async (base64) => {
    console.log('Uploading image to ImgBB...');
    const formData = new FormData();
    formData.append("image", base64.split(',')[1]); // remove prefix

    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=ca410bcd60ed555a05bd8b311d8d5298`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      throw new Error(`ImgBB upload failed with status ${res.status}`);
    }

    const data = await res.json();
    console.log('xjx ImgBB response:', data);
    return data.data.url; // public URL
  };

  const postToAPI = async (uri) => {
    console.log('propuri on postAPI', uri);
    console.log('sss', fontsUsed)

    if (!previewStageRef?.current) {
      onPostError?.('Please generate a preview first');
      return;
    }

    setIsPosting(true);

    try {
      // 🔹 Step 1: Upload to ImgBB
      const imageUrl = await uploadToImgBB(uri);
      console.log('✅  xjx Uploaded to ImgBB, URL:', imageUrl);

      // 🔹 Step 2: Prepare the request body with image URL
      const requestBody = {
        product_id: parseInt(localData?.product_base?.split(':')[1]) || 193,
        variation_id: parseInt(localData?.product_cms) || 194,
        quantity: parseInt(localData?.quantity) || 3,
        attribute_template: localData?.attribute_template || "Template 2",
        edited_image: imageUrl, // use the ImgBB link here
        fonts: fontsUsed,
        dimension: finalDimensions,
      };

      console.log('Posting to API with payload:', requestBody);

      // 🔹 Step 3: Send to your API
      const response = await fetch(
        'https://takeout.appcostcalculator.ca/takeout_api/api/add-to-cart',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('API Response:', result);

     
      if (result.redirect_url) {
        console.log('Redirecting to:', result.redirect_url);
        window.location.href = result.redirect_url;
        return;
      }

      // 🔹 Step 5: Success callback
      onPostSuccess?.(result);
    } catch (error) {
      console.error('Error posting to API:', error);
      onPostError?.(error.message);
    } finally {
      setIsPosting(false);
    }
  };

  return {
    isPosting,
    postToAPI,
  };
}
