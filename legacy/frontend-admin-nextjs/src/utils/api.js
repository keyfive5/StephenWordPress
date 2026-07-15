export const Auth_URL = process.env.Auth_URL || 'https://all-take-out-micro-service.vercel.app';
export const Cat_URL = process.env.Cat_URL || 'https://all-take-out-micro-service-byjp.vercel.app';
export const Products_URL = process.env.Products_URL || 'https://all-take-out-micro-service-njtq.vercel.app';
export const Orders_URL = Products_URL;

export const getStoredUser = () => {
  if (typeof window === "undefined") return null; // for Next.js SSR
  const user = sessionStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const getAdminId = () => {
  const user = getStoredUser(); 
  return user?.id || null;
};

export const getToken = () => {
  const user = getStoredUser();
  return user?.token || null;
};
