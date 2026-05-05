import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersApi, cartApi } from './api';
import { useShop } from './ShopContext';

export type CheckoutStep = 'home' | 'checkout' | 'shipping' | 'success' | 'error' | 'notFound' | 'methodNotAllowed';

interface CheckoutContextType {
  checkoutStep: CheckoutStep;
  setCheckoutStep: (step: CheckoutStep) => void;
  shippingData: any;
  setShippingData: (data: any) => void;
  couponCode: string;
  setCouponCode: (code: string) => void;
  couponError: string;
  setCouponError: (error: string) => void;
  discountInfo: any;
  setDiscountInfo: (info: any) => void;
  orderId: string | null;
  setOrderId: (id: string | null) => void;
  orderData: any;
  setOrderData: (data: any) => void;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
  invoiceEmail: string;
  setInvoiceEmail: (email: string) => void;
  invoiceSent: boolean;
  setInvoiceSent: (sent: boolean) => void;
  invoiceSending: boolean;
  setInvoiceSending: (sending: boolean) => void;
  handleFinalize: () => Promise<void>;
  validateCoupon: (code: string) => Promise<void>;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CheckoutProvider = ({ children }: { children: ReactNode }) => {
  const { cart, cartTotal, setCart } = useShop();
  const navigate = useNavigate();
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('home');
  const [shippingData, setShippingData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: ''
  });
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [discountInfo, setDiscountInfo] = useState<any>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoiceEmail, setInvoiceEmail] = useState('');
  const [invoiceSent, setInvoiceSent] = useState(false);
  const [invoiceSending, setInvoiceSending] = useState(false);

  const validateCoupon = async (code: string) => {
    if (!code.trim()) {
      setCouponError('');
      setDiscountInfo(null);
      return;
    }
    try {
      const response = await ordersApi.validateCoupon(code);
      if (response.valid) {
        setCouponError('');
        let discount = 0;
        if (response.discount_type === 'percent') {
          discount = cartTotal * (response.value / 100);
        } else {
          discount = response.value;
        }
        setDiscountInfo({
          discount,
          finalTotal: Math.max(0, cartTotal - discount),
          code: response.code,
          type: response.discount_type,
          value: response.value
        });
      } else {
        setCouponError(response.message || 'Cupão inválido');
        setDiscountInfo(null);
      }
    } catch (err: any) {
      setCouponError(err.message || 'Falha ao validar cupão');
      setDiscountInfo(null);
    }
  };

  const handleFinalize = async () => {
    setIsSubmitting(true);
    try {
      const response = await ordersApi.createCheckout({
        email: shippingData.email,
        user_id: "guest",
        coupon_code: couponCode || undefined,
        shipping_address: `${shippingData.address}, ${shippingData.city}, ${shippingData.zip}`,
        phone: shippingData.phone,
        user_name: shippingData.name
      });
      
      if (response.checkout_url || response.session_url) {
        window.location.href = response.checkout_url || response.session_url;
      } else {
        setOrderId(response.id);
        navigate('/checkout/success');
        setCart([]);
        await cartApi.clearCart();
      }
    } catch (err) {
      console.error("Checkout failed", err);
      navigate('/checkout/error');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (couponCode.trim()) {
        validateCoupon(couponCode);
      } else {
        setDiscountInfo(null);
        setCouponError('');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [couponCode, cartTotal]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('order_id');
    if (id) {
      const fetchOrder = async () => {
        try {
          const data = await ordersApi.getOrder(id);
          setOrderData(data);
          setOrderId(id);
          setInvoiceEmail(data.guest_email || '');
          navigate('/checkout/success');
          // Clear cart
          await cartApi.clearCart();
          setCart([]);
          // Clean URL
          window.history.replaceState({}, '', window.location.pathname);
        } catch (err) {
          console.error("Failed to fetch order", err);
        }
      };
      fetchOrder();
    }
  }, []);

  return (
    <CheckoutContext.Provider value={{
      checkoutStep, setCheckoutStep, shippingData, setShippingData,
      couponCode, setCouponCode, couponError, setCouponError,
      discountInfo, setDiscountInfo, orderId, setOrderId,
      orderData, setOrderData, isSubmitting, setIsSubmitting,
      invoiceEmail, setInvoiceEmail, invoiceSent, setInvoiceSent,
      invoiceSending, setInvoiceSending, handleFinalize, validateCoupon
    }}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) throw new Error("useCheckout must be used within CheckoutProvider");
  return context;
};
