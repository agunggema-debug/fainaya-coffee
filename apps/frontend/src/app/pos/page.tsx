'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useUser } from '@/lib/useUser';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Wallet,
  Phone,
  QrCode,
  LayoutList,
  AlertCircle,
  CheckCircle,
  Loader2,
  Coffee,
  ShoppingBag,
} from 'lucide-react';
import { NeumorphicButton } from '@/components/NeumorphicButton';
import { NeumorphicInput } from '@/components/NeumorphicInput';
import { NeumorphicCard } from '@/components/NeumorphicCard';

interface Product {
  id: string;
  name: string;
  price: number;
  sellingPrice?: number | string;
  basePrice?: number | string;
  category?: { id?: string; name: string };
  station: string;
  prepTimeMin: number;
  image?: string;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  notes: string;
  station: string;
}

const formatRupiah = (val?: number | string | null): string => {
  const num = Number(val ?? 0);
  return isNaN(num) ? '0' : num.toLocaleString('id-ID');
};

export default function POSPage() {
  const { user } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableId, setTableId] = useState<string>('');
  const [tables, setTables] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS' | 'E_WALLET' | 'CREDIT_CARD'>('CASH');
  const [cashAmount, setCashAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const branchQuery = user?.branchId ? `?branchId=${encodeURIComponent(user.branchId)}` : '';

    api.get(`/products${branchQuery}`)
      .then((data) => {
        if (Array.isArray(data)) {
          const normalized: Product[] = data.map((p: any) => ({
            ...p,
            price: Number(p.sellingPrice ?? p.price ?? p.basePrice ?? 0),
            station: p.station || 'barista',
            prepTimeMin: p.prepTimeMin ?? 5,
          }));
          setProducts(normalized);
        }
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
      });

    api.get(`/tables${branchQuery}`)
      .then((data) => {
        if (Array.isArray(data)) {
          setTables(data);
        }
      })
      .catch((err) => {
        console.error('Error fetching tables:', err);
      });
  }, [user?.branchId]);

  // Ekstrak kategori secara dinamis dari produk
  const availableCategories = Array.from(
    new Set(
      products
        .map((p) => p.category?.name)
        .filter((cat): cat is string => Boolean(cat))
    )
  );

  const displayCategories = availableCategories.length > 0
    ? availableCategories
    : ['Kopi', 'Non Kopi', 'Makanan'];

  const filteredProducts = products.filter(
    (p) =>
      (!selectedCategory || p.category?.name === selectedCategory) &&
      p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const addToCart = useCallback((product: Product) => {
    const itemPrice = Number(product.price ?? product.sellingPrice ?? product.basePrice ?? 0);
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: itemPrice,
          quantity: 1,
          notes: '',
          station: product.station || 'barista',
        },
      ];
    });
  }, []);

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const changeQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const updateNotes = (productId: string, notes: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, notes } : item,
      ),
    );
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  );
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + tax;
  const cashNum = Number(cashAmount) || 0;
  const change = paymentMethod === 'CASH' ? Math.max(0, cashNum - total) : 0;

  const handleCheckout = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (cart.length === 0) {
      setErrorMessage('Keranjang masih kosong!');
      return;
    }

    if (paymentMethod === 'CASH' && cashNum < total) {
      setErrorMessage(`Uang tunai kurang! Total pembayaran adalah Rp ${formatRupiah(total)}`);
      return;
    }

    setLoading(true);
    try {
      const order = await api.post('/orders', {
        branchId: user?.branchId || undefined,
        userId: user?.id || undefined,
        tableId: tableId || undefined,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        orderType: tableId ? 'DINE_IN' : 'TAKEAWAY',
        items: cart.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          notes: item.notes || undefined,
          station: item.station || 'barista',
        })),
      });

      await api.post(`/orders/${order.id}/payment`, {
        method: paymentMethod,
        amount: total,
      });

      setSuccessMessage(
        paymentMethod === 'CASH' && change > 0
          ? `Pesanan #${order.orderNumber || order.id.slice(0, 8)} berhasil! Kembalian: Rp ${formatRupiah(change)}`
          : `Pesanan #${order.orderNumber || order.id.slice(0, 8)} berhasil diproses!`
      );

      // Reset form
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setTableId('');
      setCashAmount('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Proses pesanan gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Kolom Kiri: Katalog Menu & Pencarian */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <NeumorphicCard className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Search size={20} className="text-coffee-600" />
            <NeumorphicInput
              placeholder="Cari produk menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm"
              label={false}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                !selectedCategory
                  ? 'neumorphic-pressed bg-coffee-800 text-white shadow-inner font-bold'
                  : 'neumorphic-btn text-coffee-700'
              }`}
            >
              Semua
            </button>
            {displayCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'neumorphic-pressed bg-coffee-800 text-white shadow-inner font-bold'
                    : 'neumorphic-btn text-coffee-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-coffee-600">
              <Coffee size={40} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">Tidak ada produk ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="neumorphic-card p-3 cursor-pointer hover:shadow-[6px_6px_12px_#d1c9bd,_-6px_-6px_12px_#ffffff] transition-all flex flex-col justify-between select-none active:scale-95"
                >
                  <div>
                    <div className="h-20 bg-coffee-100/70 rounded-lg flex items-center justify-center mb-2 shadow-[inset_2px_2px_4px_#d1c9bd,_inset_-2px_-2px_4px_#ffffff]">
                      <Coffee size={28} className="text-coffee-600" />
                    </div>
                    <h4 className="text-sm font-bold text-coffee-900 line-clamp-1">{product.name}</h4>
                    <p className="text-[11px] text-coffee-600 mb-2">
                      {product.station === 'kitchen' ? 'Dapur' : 'Barista'} • {product.prepTimeMin} mnt
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-1 border-t border-coffee-200">
                    <span className="text-sm font-bold text-coffee-800">
                      Rp {formatRupiah(product.price)}
                    </span>
                    <button
                      type="button"
                      className="w-6 h-6 rounded-full bg-coffee-700 text-white flex items-center justify-center text-xs shadow hover:bg-coffee-800"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </NeumorphicCard>
      </div>

      {/* Kolom Kanan: Detail Order & Keranjang */}
      <div className="w-full lg:w-[420px] flex flex-col gap-4">
        {successMessage && (
          <div className="p-3 rounded-xl bg-green-50 border border-green-300 text-green-800 flex items-center gap-2 text-sm shadow-sm animate-fade-in">
            <CheckCircle size={18} className="text-green-600 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-800 flex items-center gap-2 text-sm shadow-sm animate-fade-in">
            <AlertCircle size={18} className="text-red-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Informasi Pelanggan & Meja */}
        <NeumorphicCard className="p-4 space-y-3">
          <h3 className="text-coffee-900 font-bold text-sm">Informasi Pelanggan & Meja</h3>
          <div className="grid grid-cols-2 gap-2">
            <NeumorphicInput
              placeholder="Nama Pelanggan"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              label={false}
              className="text-xs"
            />
            <NeumorphicInput
              placeholder="No. Telepon"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              label={false}
              className="text-xs"
            />
          </div>
          <div>
            <select
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
              className="neumorphic-input w-full px-3 py-2 text-xs text-coffee-800 rounded-lg outline-none"
            >
              <option value="">Takeaway / Bungkus (Tanpa Meja)</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  Meja {t.name || t.tableNumber} ({t.capacity || 2} orang) - {t.status || 'AVAILABLE'}
                </option>
              ))}
            </select>
          </div>
        </NeumorphicCard>

        {/* Daftar Keranjang Belanja */}
        <NeumorphicCard className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-coffee-200 mb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-coffee-700" />
                <h3 className="font-bold text-coffee-900 text-sm">Keranjang ({cart.length})</h3>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Kosongkan
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8 text-coffee-500">
                <Coffee size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">Keranjang masih kosong</p>
                <p className="text-[11px] text-coffee-400 mt-0.5">Pilih menu dari daftar sebelah kiri</p>
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="p-2.5 rounded-lg bg-coffee-50/50 border border-coffee-200 text-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-2">
                        <span className="font-bold text-coffee-900 block truncate">{item.name}</span>
                        <span className="text-[11px] text-coffee-600">
                          Rp {formatRupiah(item.price)} × {item.quantity} = Rp {formatRupiah(item.price * item.quantity)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => changeQuantity(item.productId, -1)}
                          className="w-5 h-5 rounded bg-coffee-200 text-coffee-800 flex items-center justify-center hover:bg-coffee-300"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="w-5 text-center font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => changeQuantity(item.productId, 1)}
                          className="w-5 h-5 rounded bg-coffee-200 text-coffee-800 flex items-center justify-center hover:bg-coffee-300"
                        >
                          <Plus size={10} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                          className="ml-1 text-red-500 hover:text-red-700 p-0.5"
                          title="Hapus item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Catatan (opsional, cth: Less Ice)"
                      value={item.notes}
                      onChange={(e) => updateNotes(item.productId, e.target.value)}
                      className="mt-1.5 w-full bg-white/70 border border-coffee-200 rounded px-2 py-0.5 text-[11px] text-coffee-800 outline-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rincian Harga & Checkout */}
          <div className="mt-4 pt-3 border-t border-coffee-200 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-coffee-600">
                <span>Subtotal</span>
                <span className="font-medium text-coffee-900">Rp {formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-coffee-600">
                <span>Pajak Resto (11%)</span>
                <span className="font-medium text-coffee-900">Rp {formatRupiah(tax)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-coffee-300 pt-1.5">
                <span className="text-coffee-900">Total Pembayaran</span>
                <span className="text-coffee-800">Rp {formatRupiah(total)}</span>
              </div>
            </div>

            {/* Pilihan Metode Bayar */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-coffee-700 uppercase tracking-wide">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'CASH', label: 'Tunai', icon: Wallet },
                  { id: 'QRIS', label: 'QRIS', icon: QrCode },
                  { id: 'E_WALLET', label: 'E-Wallet', icon: Phone },
                  { id: 'CREDIT_CARD', label: 'Kartu', icon: CreditCard },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPaymentMethod(id as any)}
                    className={`p-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === id
                        ? 'neumorphic-pressed bg-coffee-800 text-white shadow-inner font-bold'
                        : 'neumorphic-btn text-coffee-700'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {paymentMethod === 'CASH' && (
                <div className="pt-2">
                  <NeumorphicInput
                    label="Jumlah Uang Tunai Diterima"
                    type="number"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    placeholder="Contoh: 50000"
                    className="text-sm font-semibold"
                  />
                  {cashNum > 0 && (
                    <div className={`mt-2 p-2 rounded-lg text-xs flex justify-between items-center ${
                      change >= 0 ? 'bg-green-50 text-green-800 font-bold' : 'bg-red-50 text-red-700'
                    }`}>
                      <span>{change >= 0 ? 'Kembalian:' : 'Uang Kurang:'}</span>
                      <span>Rp {formatRupiah(Math.abs(cashNum - total))}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <NeumorphicButton
              onClick={handleCheckout}
              disabled={loading || cart.length === 0}
              className="w-full bg-coffee-800 text-white py-2.5 text-sm font-bold flex items-center justify-center gap-2 mt-2 shadow-[4px_4px_8px_#d1c9bd,_-4px_-4px_8px_#ffffff] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Memproses Transaksi...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>Bayar Sekarang (Rp {formatRupiah(total)})</span>
                </>
              )}
            </NeumorphicButton>
          </div>
        </NeumorphicCard>
      </div>
    </div>
  );
}
