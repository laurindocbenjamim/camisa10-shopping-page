import { motion } from 'motion/react';
import { ShoppingCart, X, ChevronLeft, ChevronRight, Minus, Plus, Trash2, Package, CheckCircle2, AlertTriangle, Printer, Mail, Loader2, ArrowRight, Search } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShop } from '../ShopContext';
import { useCheckout } from '../CheckoutContext';
import RecommendedSection from '../components/RecommendedSection';
import { ordersApi } from '../api';

export default function Checkout() {
  const { cart, products, cartTotal, updateQuantity, removeFromCart } = useShop();
  const { 
    checkoutStep, setCheckoutStep, shippingData, setShippingData, 
    couponCode, setCouponCode, couponError, discountInfo, isSubmitting, 
    orderId, setOrderId, orderData, setOrderData, 
    invoiceEmail, setInvoiceEmail, invoiceSent, setInvoiceSent,
    invoiceSending, setInvoiceSending, handleFinalize 
  } = useCheckout();
  const { step } = useParams();
  const navigate = useNavigate();

  const currentStep = step || 'checkout';


  const renderStep = () => {
    switch (currentStep) {
      case 'checkout':
        return (
          <div className="min-h-screen pt-20 flex flex-col">
            <div className="max-w-7xl mx-auto px-6 w-full py-20 flex-1">
              <div className="flex items-center gap-4 mb-12">
                <button
                  onClick={() => navigate('/')}
                  className="p-4 bg-brand-white/5 hover:bg-brand-gold hover:text-brand-black transition-all rounded-full text-brand-white"
                >
                  <ChevronLeft size={24} />
                </button>
                <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tighter uppercase italic text-brand-white">CHECKOUT</h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-brand-white/5 border border-brand-white/10 overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="border-b border-brand-white/10 bg-brand-white/5">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-white/40">Produto</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-white/40 text-center">Quantidade</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-white/40">Preço</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-white/40">Acção</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-white/10">
                        {cart.map((item) => {
                          const productInfo = products.find(p => p.id === item.product_id);
                          return (
                            <motion.tr key={item.product_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                              <td className="px-6 py-8">
                                <div className="flex gap-6">
                                  <div className="w-16 h-20 bg-[#0f0f0f] shrink-0">
                                    {productInfo?.image && (
                                      <img src={productInfo.image} alt={item.product_name} className="w-full h-full object-cover" />
                                    )}
                                  </div>
                                  <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest mb-1 text-brand-white">{item.product_name}</h3>
                                    <p className="text-[10px] text-brand-white/40 uppercase">Tamanho: {item.size || 'Único'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-8">
                                <div className="flex items-center justify-center gap-4">
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.size)}
                                    className="w-8 h-8 rounded-full border border-brand-white/10 flex items-center justify-center hover:border-brand-gold hover:text-brand-gold transition-colors cursor-pointer text-brand-white"
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <span className="font-display font-bold text-sm min-w-[20px] text-center text-brand-white">{item.quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.product_id, item.quantity + 1, item.size)}
                                    className="w-8 h-8 rounded-full border border-brand-white/10 flex items-center justify-center hover:border-brand-gold hover:text-brand-gold transition-colors cursor-pointer text-brand-white"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-8 font-display font-bold text-brand-gold">€{(item.price_at_addition * item.quantity).toFixed(2)}</td>
                              <td className="px-6 py-8">
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(item.product_id, item.size)}
                                  className="p-3 text-brand-white/20 hover:text-brand-gold hover:bg-brand-gold/10 transition-all rounded-full cursor-pointer"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {cart.length === 0 && (
                      <div className="py-20 text-center text-brand-white/20 uppercase tracking-widest text-xs">
                        Nada por aqui... <button onClick={() => navigate('/')} className="text-brand-gold underline ml-2">Explorar Loja</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6 lg:col-span-1 lg:row-span-2">
                  <div className="bg-brand-white/5 border border-brand-white/10 p-8 space-y-8">
                    <h2 className="font-display text-2xl font-bold tracking-tighter uppercase italic text-brand-white">Resumo do Pedido</h2>

                    <div className="space-y-4">
                      <div className="flex justify-between text-sm uppercase tracking-widest text-brand-white/40">
                        <span>Subtotal</span>
                        <span className="text-brand-white font-bold">€{cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm uppercase tracking-widest text-brand-white/40">
                        <span>Envio</span>
                        <span className="text-brand-gold font-bold italic">Grátis</span>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-brand-white/10">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-3">Código Promocional</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Digite o código"
                          className="bg-brand-white/5 border border-brand-white/10 px-4 py-3 flex-1 text-xs focus:outline-none focus:border-brand-gold uppercase tracking-widest text-brand-white"
                        />
                      </div>
                      {couponError && (
                        <p className="text-red-500 text-[10px] mt-2">{couponError}</p>
                      )}
                      {discountInfo && (
                        <p className="text-green-500 text-[10px] mt-2">
                          {discountInfo.type === 'percent' ? `${discountInfo.value}%` : `€${discountInfo.value.toFixed(2)}`} de desconto aplicado
                        </p>
                      )}
                    </div>

                    <div className="pt-8 border-t border-brand-white/10 flex justify-between items-end">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-white/40">Total</span>
                      <span className="font-display text-4xl font-bold text-brand-gold leading-none">€{(discountInfo ? discountInfo.finalTotal : cartTotal).toFixed(2)}</span>
                    </div>

                    <button
                      disabled={cart.length === 0 || isSubmitting}
                      onClick={() => navigate('/checkout/shipping')}
                      className="w-full bg-brand-gold text-brand-black px-8 py-5 font-bold uppercase tracking-[0.2em] text-xs hover:bg-brand-white disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-4"
                    >
                      {isSubmitting ? 'A Processar...' : 'Continuar'} <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                  <RecommendedSection />
                </div>
              </div>
            </div>
          </div>
        );

      case 'shipping':
        return (
          <div className="min-h-screen pt-20">
            <div className="max-w-7xl mx-auto px-6 py-20">
              <div className="flex items-center gap-4 mb-12">
                <button
                  onClick={() => navigate('/checkout')}
                  className="p-4 bg-brand-white/5 hover:bg-brand-gold hover:text-brand-black transition-all rounded-full text-brand-white"
                >
                  <ChevronLeft size={24} />
                </button>
                <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tighter uppercase italic text-brand-white">Dados de <span className="text-brand-gold">Envio</span></h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                <div className="space-y-12">
                  <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleFinalize(); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Nome Completo</label>
                        <input
                          required
                          type="text"
                          maxLength={60}
                          placeholder="Ex: Cristiano Ronaldo"
                          className="w-full bg-brand-white/5 border border-brand-white/10 px-6 py-4 focus:outline-none focus:border-brand-gold transition-colors text-sm text-brand-white"
                          value={shippingData.name}
                          onChange={(e) => setShippingData({ ...shippingData, name: e.target.value.slice(0, 60) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">E-mail</label>
                        <input
                          required
                          type="email"
                          maxLength={60}
                          placeholder="Ex: cr7@vitoria.pt"
                          className="w-full bg-brand-white/5 border border-brand-white/10 px-6 py-4 focus:outline-none focus:border-brand-gold transition-colors text-sm text-brand-white"
                          value={shippingData.email}
                          onChange={(e) => setShippingData({ ...shippingData, email: e.target.value.slice(0, 60) })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Telemóvel</label>
                      <input
                        required
                        type="tel"
                        maxLength={20}
                        placeholder="+351 912 345 678"
                        className="w-full bg-brand-white/5 border border-brand-white/10 px-6 py-4 focus:outline-none focus:border-brand-gold transition-colors text-sm text-brand-white"
                        value={shippingData.phone}
                        onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value.slice(0, 20) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Morada Completa</label>
                      <textarea
                        required
                        rows={3}
                        maxLength={60}
                        placeholder="Rua, Nº, Andar, Porta..."
                        className="w-full bg-brand-white/5 border border-brand-white/10 px-6 py-4 focus:outline-none focus:border-brand-gold transition-colors text-sm resize-none text-brand-white"
                        value={shippingData.address}
                        onChange={(e) => setShippingData({ ...shippingData, address: e.target.value.slice(0, 60) })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Cidade</label>
                        <input
                          required
                          type="text"
                          maxLength={60}
                          className="w-full bg-brand-white/5 border border-brand-white/10 px-6 py-4 focus:outline-none focus:border-brand-gold transition-colors text-sm text-brand-white"
                          value={shippingData.city}
                          onChange={(e) => setShippingData({ ...shippingData, city: e.target.value.slice(0, 60) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Código Postal</label>
                        <input
                          required
                          type="text"
                          maxLength={10}
                          placeholder="0000-000"
                          className="w-full bg-brand-white/5 border border-brand-white/10 px-6 py-4 focus:outline-none focus:border-brand-gold transition-colors text-sm text-brand-white"
                          value={shippingData.zip}
                          onChange={(e) => setShippingData({ ...shippingData, zip: e.target.value.slice(0, 10) })}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-brand-gold text-brand-black px-8 py-5 font-bold uppercase tracking-[0.2em] text-xs hover:bg-brand-white transition-all shadow-[0_0_20px_rgba(231,186,76,0.3)] hover:shadow-[0_0_30px_rgba(231,186,76,0.5)] flex items-center justify-center gap-4"
                    >
                      {isSubmitting ? 'A Finalizar...' : 'Finalizar Pedido'} <Package size={18} />
                    </button>
                  </form>
                </div>

                <div className="bg-brand-white/5 border border-brand-white/10 p-12 h-fit space-y-8 sticky top-32">
                  <h3 className="text-xl font-bold uppercase tracking-[0.2em] italic text-brand-white">Resumo Final</h3>
                  <div className="space-y-4">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs opacity-60 text-brand-white">
                        <span>{item.product_name} x {item.quantity}</span>
                        <span>€{(item.price_at_addition * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {discountInfo && discountInfo.discount > 0 && (
                      <div className="flex justify-between items-center text-xs text-brand-gold">
                        <span>Desconto ({discountInfo.code})</span>
                        <span>- €{discountInfo.discount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-8 border-t border-brand-white/10 flex justify-between items-end">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-white/40">Valor Total</span>
                    <span className="font-display text-4xl font-bold text-brand-gold">€{(discountInfo ? discountInfo.finalTotal : cartTotal).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="min-h-screen py-32 px-6 bg-brand-black">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-16 no-print">
                <div className="w-20 h-20 bg-brand-gold rounded-full flex items-center justify-center mx-auto mb-8 text-brand-black shadow-[0_0_50px_rgba(231,186,76,0.3)]">
                  <CheckCircle2 size={40} />
                </div>
                <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tighter uppercase italic mb-4 text-brand-white">Pedido <span className="text-brand-gold underline">Confirmado</span></h1>
                <p className="text-brand-white/50 uppercase tracking-[0.2em] text-sm">Obrigado pela tua compra. O teu equipamento está a ser preparado.</p>
              </div>

              <div id="invoice" className="bg-white text-black p-8 md:p-16 rounded-sm shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16 border-b-2 border-brand-black/5 pb-12">
                    <div>
                      <div className="flex items-center gap-3 mb-4 text-black">
                        <div className="w-10 h-10 bg-brand-black rounded-sm flex items-center justify-center text-brand-gold text-lg font-black italic">10</div>
                        <span className="font-display text-2xl font-bold tracking-tighter uppercase">Camisa 10</span>
                      </div>
                      <p className="text-[10px] uppercase tracking-widest text-black/60 leading-relaxed">
                        Loja Oficial de Equipamentos<br />
                        Avenida da Liberdade, 123<br />
                        1250-001 Lisboa, Portugal
                      </p>
                    </div>
                    <div className="text-right text-black">
                      <h2 className="font-display text-4xl font-bold uppercase italic mb-2">Fatura</h2>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">Nº do Pedido: <span className="text-black">{orderId}</span></p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mt-1">Data: <span className="text-black">{new Date().toLocaleDateString('pt-PT')}</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 text-black">
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-4 border-b border-brand-gold/20 pb-2">Cliente</h3>
                      <p className="font-bold text-sm uppercase mb-1">{orderData?.user_name || orderData?.guest_email || 'Cliente Camisa 10'}</p>
                      <p className="text-[10px] uppercase text-black/60">{orderData?.guest_email}</p>
                    </div>
                    <div className="md:text-right">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-4 border-b border-brand-gold/20 pb-2 md:ml-auto md:w-fit">Estado do Pagamento</h3>
                      <span className="inline-block bg-green-100 text-green-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Pago via Stripe</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto text-black">
                    <table className="w-full mb-16">
                      <thead>
                        <tr className="border-b-2 border-brand-black">
                          <th className="text-left py-4 text-[10px] font-bold uppercase tracking-widest">Item</th>
                          <th className="text-center py-4 text-[10px] font-bold uppercase tracking-widest">Qtd</th>
                          <th className="text-right py-4 text-[10px] font-bold uppercase tracking-widest">Preço</th>
                          <th className="text-right py-4 text-[10px] font-bold uppercase tracking-widest">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {orderData?.items?.map((item: any, idx: number) => (
                          <tr key={idx}>
                            <td className="py-6">
                              <p className="font-bold text-xs uppercase tracking-wider">{item.product_name}</p>
                              <p className="text-[9px] text-black/40 uppercase mt-1">Ref: {item.product_id?.slice(0, 8)}</p>
                            </td>
                            <td className="py-6 text-center text-xs font-bold">{item.quantity}</td>
                            <td className="py-6 text-right text-xs">
                              {item.original_price ? (
                                <div className="flex flex-col items-end">
                                  <span className="line-through text-black/40">€{item.original_price.toFixed(2)}</span>
                                  <span className="text-green-600 font-bold">€{item.unit_price.toFixed(2)}</span>
                                </div>
                              ) : (
                                <span>€{(item.unit_price || 0).toFixed(2)}</span>
                              )}
                            </td>
                            <td className="py-6 text-right text-xs font-bold">€{((item.unit_price || 0) * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end border-t-2 border-brand-black pt-8 text-black">
                    <div className="w-full md:w-64 space-y-4">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-black/40">
                        <span>Subtotal</span>
                        <span className="text-black">€{(orderData?.subtotal || 0).toFixed(2)}</span>
                      </div>
                      {orderData?.items?.some((item: any) => item.discount_amount > 0) && (
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-green-600">
                          <span>Desconto Produto</span>
                          <span>-€{orderData.items.reduce((sum: number, item: any) => sum + ((item.discount_amount || 0) * item.quantity), 0).toFixed(2)}</span>
                        </div>
                      )}
                      {orderData?.coupon_code && (
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-green-600">
                          <span>Cupão ({orderData.coupon_code})</span>
                          <span>-€{(orderData.coupon_discount || 0).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-black/40">
                        <span>Envio</span>
                        <span className="text-green-600 italic font-bold">Grátis</span>
                      </div>
                      <div className="flex justify-between items-end pt-4 border-t border-black/10">
                        <span className="text-[10px] font-bold uppercase tracking-widest">Total Pago</span>
                        <span className="font-display text-3xl font-bold text-brand-gold leading-none">€{(orderData?.final_price || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-20 pt-12 border-t border-black/5 text-center text-black">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/30">Obrigado por escolheres a Camisa 10 — Onde as lendas se vestem.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 justify-center mt-12 no-print">
                <button
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-brand-gold text-brand-black font-bold uppercase tracking-widest text-[10px] hover:bg-brand-white transition-all shadow-xl"
                >
                  <Printer size={16} /> Imprimir Fatura
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center justify-center gap-3 px-8 py-4 border border-brand-white/20 text-brand-white font-bold uppercase tracking-widest text-[10px] hover:bg-brand-white hover:text-brand-black transition-all"
                >
                  Voltar à Loja <ArrowRight size={16} />
                </button>
              </div>

              <div className="mt-12 p-6 bg-brand-white/5 border border-brand-gold/20 rounded-lg max-w-md mx-auto no-print">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-4">Enviar Fatura por Email</h3>
                {invoiceSent ? (
                  <div className="text-green-600 text-sm font-bold flex items-center gap-2">
                    <Mail size={16} /> Fatura enviada com sucesso!
                  </div>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!invoiceEmail || !orderId) return;
                      setInvoiceSending(true);
                      try {
                        await ordersApi.sendInvoice(orderId, invoiceEmail);
                        setInvoiceSent(true);
                      } catch (err: any) {
                        console.error("Failed to send invoice", err);
                        alert(err?.response?.data?.detail || err?.message || "Failed to send invoice");
                      } finally {
                        setInvoiceSending(false);
                      }
                    }}
                    className="flex flex-col gap-3"
                  >
                    <input
                      type="email"
                      value={invoiceEmail}
                      onChange={(e) => setInvoiceEmail(e.target.value)}
                      placeholder="Seu email"
                      className="px-4 py-3 bg-brand-black/50 border border-brand-white/20 text-brand-white text-sm focus:border-brand-gold focus:outline-none"
                      required
                    />
                    <button
                      type="submit"
                      disabled={invoiceSending || !invoiceEmail}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-gold text-brand-black font-bold uppercase tracking-widest text-[10px] hover:bg-brand-white transition-all disabled:opacity-50"
                    >
                      {invoiceSending ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> A enviar...
                        </>
                      ) : (
                        <>
                          <Mail size={16} /> Enviar Fatura
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        );

      case 'error':
        return (
          <div className="min-h-screen flex items-center justify-center text-center p-6 bg-brand-black">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-xl space-y-12"
            >
              <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto text-brand-white shadow-[0_0_50px_rgba(239,68,68,0.5)]">
                <AlertTriangle size={48} />
              </div>
              <div className="space-y-4">
                <h1 className="font-display text-6xl font-bold tracking-tighter uppercase italic line-height-none text-brand-white">Erro no <span className="text-red-500 underline">Pagamento</span></h1>
                <p className="text-brand-white/50 uppercase tracking-[0.2em] text-sm">Ocorreu um problema ao processar o seu pedido. Por favor, tente novamente.</p>
              </div>
              <button
                onClick={() => navigate('/checkout/shipping')}
                className="px-12 py-5 border border-brand-white text-brand-white hover:bg-brand-white hover:text-brand-black transition-all font-bold uppercase tracking-[0.2em] text-xs"
              >
                Tentar Novamente
              </button>
            </motion.div>
          </div>
        );

      case 'notFound':
        return (
          <div className="min-h-screen flex items-center justify-center text-center p-6 bg-brand-black">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-xl space-y-12"
            >
              <div className="w-24 h-24 bg-brand-white/10 rounded-full flex items-center justify-center mx-auto text-brand-white">
                <Search size={48} />
              </div>
              <div className="space-y-4">
                <h1 className="font-display text-6xl font-bold tracking-tighter uppercase italic line-height-none text-brand-white">404</h1>
                <p className="text-brand-white/50 uppercase tracking-[0.2em] text-sm">Página não encontrada. A página que procuras não existe.</p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="px-12 py-5 bg-brand-gold text-brand-black hover:bg-brand-white transition-all font-bold uppercase tracking-[0.2em] text-xs"
              >
                Voltar ao Início
              </button>
            </motion.div>
          </div>
        );

      case 'methodNotAllowed':
        return (
          <div className="min-h-screen flex items-center justify-center text-center p-6 bg-brand-black">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-xl space-y-12"
            >
              <div className="w-24 h-24 bg-brand-white/10 rounded-full flex items-center justify-center mx-auto text-brand-white">
                <AlertTriangle size={48} />
              </div>
              <div className="space-y-4">
                <h1 className="font-display text-6xl font-bold tracking-tighter uppercase italic line-height-none text-brand-white">405</h1>
                <p className="text-brand-white/50 uppercase tracking-[0.2em] text-sm">Método não permitido. O pedido não é permitido neste endpoint.</p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="px-12 py-5 bg-brand-gold text-brand-black hover:bg-brand-white transition-all font-bold uppercase tracking-[0.2em] text-xs"
              >
                Voltar ao Início
              </button>
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return renderStep();
}
