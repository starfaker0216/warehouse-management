"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { useExportFormStore } from "../../stores/useExportFormStore";
import { usePhoneStore } from "../../stores/usePhoneStore";
import PriceInput from "../../components/common/PriceInput";
import { Toaster, toast } from "react-hot-toast";
import Loading from "../../components/common/Loading";
import { getCustomerByPhone } from "../../lib/customerService";
import BirthdayInputField from "../../components/export/BirthdayInputField";

function ExportForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { phones, fetchPhones } = usePhoneStore();
  const {
    formData,
    setFormData,
    priceInputValue,
    setPriceInputValue,
    installmentInputValue,
    setInstallmentInputValue,
    bankTransferInputValue,
    setBankTransferInputValue,
    cashPaymentInputValue,
    setCashPaymentInputValue,
    loading,
    error,
    initializeFromPhone,
    resetForm,
    handleSubmit,
    handleColorChange
  } = useExportFormStore();

  // Get current phone for color options
  const currentPhone = phones.find((p) => p.id === formData.phoneId);
  const availableColors = currentPhone?.data || [];
  const [isCheckingCustomer, setIsCheckingCustomer] = useState(false);

  const handleCheckCustomer = async () => {
    if (!formData.customerPhone || !formData.customerPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }

    setIsCheckingCustomer(true);
    try {
      const customer = await getCustomerByPhone(formData.customerPhone.trim());
      if (customer) {
        setFormData({
          customerName: customer.name,
          customerBirthday: customer.birthday || "",
          customerAddress: customer.address || "",
          customerDebt: customer.debt || 0
        });
        toast.success("Đã tìm thấy thông tin khách hàng");
      } else {
        toast("Khách hàng mới", {
          icon: "ℹ️",
          duration: 3000
        });
      }
    } catch (error) {
      console.error("Error checking customer:", error);
      toast.error("Không thể kiểm tra thông tin khách hàng");
    } finally {
      setIsCheckingCustomer(false);
    }
  };

  // Fetch phones on mount
  useEffect(() => {
    fetchPhones();
  }, [fetchPhones]);

  // Initialize form from URL params (phoneId and color)
  useEffect(() => {
    const phoneId = searchParams.get("phoneId");
    const color = searchParams.get("color");

    if (phoneId && phones.length > 0) {
      const phone = phones.find((p) => p.id === phoneId);
      if (phone) {
        initializeFromPhone(phone, color || undefined);
      }
    }
  }, [searchParams, phones, initializeFromPhone]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit();
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Phiếu Bán Hàng
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Tạo phiếu bán hàng mới
          </p>
        </div>

        {/* Form */}
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
          <form onSubmit={onSubmit}>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Tên máy (readonly) */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Tên máy <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={formData.phoneName}
                  className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm text-zinc-600 cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400"
                />
              </div>

              {/* Màu sắc */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Màu sắc <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.color}
                  onChange={(e) => {
                    if (currentPhone) {
                      handleColorChange(e.target.value, currentPhone);
                    }
                  }}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                >
                  <option value="">Chọn màu sắc</option>
                  {availableColors.map((item) => (
                    <option key={item.color} value={item.color}>
                      {item.color}
                    </option>
                  ))}
                </select>
              </div>

              {/* IMEI */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  IMEI <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.imei}
                  onChange={(e) => setFormData({ imei: e.target.value })}
                  placeholder="Nhập IMEI"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
                />
              </div>

              {/* Giá bán */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Giá bán <span className="text-red-500">*</span>
                </label>
                <PriceInput
                  value={formData.salePrice}
                  inputValue={priceInputValue}
                  onValueChange={(price) => setFormData({ salePrice: price })}
                  onInputValueChange={setPriceInputValue}
                  placeholder="0"
                  required
                  id="salePrice"
                  className="px-4 py-2"
                />
              </div>

              {/* Tặng kèm */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Tặng kèm
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ gift: "Tặng Full" })}
                    className="text-sm font-semibold text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                  >
                    Full
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.gift}
                  onChange={(e) => setFormData({ gift: e.target.value })}
                  placeholder="Nhập tặng kèm (tùy chọn)"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
                />
              </div>
            </div>

            {/* Thông tin khách hàng */}
            <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
              <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Thông tin khách hàng
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Số điện thoại khách hàng */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Số điện thoại khách hàng{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={formData.customerPhone}
                      onChange={(e) =>
                        setFormData({ customerPhone: e.target.value })
                      }
                      placeholder="Nhập số điện thoại"
                      className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
                    />
                    <button
                      type="button"
                      onClick={handleCheckCustomer}
                      disabled={
                        isCheckingCustomer || !formData.customerPhone.trim()
                      }
                      className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-green-600 hover:bg-zinc-50 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-green-400 dark:hover:bg-zinc-700 dark:hover:text-green-300 dark:disabled:text-zinc-500"
                    >
                      {isCheckingCustomer ? "..." : "Kiểm Tra"}
                    </button>
                  </div>
                </div>

                {/* Tên khách hàng */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Tên khách hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ customerName: e.target.value })
                    }
                    placeholder="Nhập tên khách hàng"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
                  />
                </div>

                {/* Sinh nhật */}
                <BirthdayInputField
                  value={formData.customerBirthday}
                  onChange={(value) => setFormData({ customerBirthday: value })}
                />

                {/* Công nợ */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Công nợ
                  </label>
                  <PriceInput
                    value={formData.customerDebt}
                    inputValue={formData.customerDebt.toString()}
                    onValueChange={(debt) =>
                      setFormData({ customerDebt: debt })
                    }
                    onInputValueChange={(value) => {
                      const numValue =
                        parseFloat(value.replace(/[^\d]/g, "")) || 0;
                      setFormData({ customerDebt: numValue });
                    }}
                    placeholder="0"
                    id="customerDebt"
                    className="px-4 py-2"
                  />
                </div>

                {/* Địa chỉ */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Địa chỉ
                  </label>
                  <textarea
                    value={formData.customerAddress}
                    onChange={(e) =>
                      setFormData({ customerAddress: e.target.value })
                    }
                    rows={2}
                    placeholder="Nhập địa chỉ khách hàng (tùy chọn)"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
                  />
                </div>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
              <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Phương thức thanh toán
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Trả góp */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Trả góp
                  </label>
                  <PriceInput
                    value={formData.installmentPayment}
                    inputValue={installmentInputValue}
                    onValueChange={(price) =>
                      setFormData({ installmentPayment: price })
                    }
                    onInputValueChange={setInstallmentInputValue}
                    placeholder="0"
                    id="installmentPayment"
                    className="px-4 py-2"
                  />
                </div>

                {/* Chuyển khoản */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Chuyển khoản
                  </label>
                  <PriceInput
                    value={formData.bankTransfer}
                    inputValue={bankTransferInputValue}
                    onValueChange={(price) =>
                      setFormData({ bankTransfer: price })
                    }
                    onInputValueChange={setBankTransferInputValue}
                    placeholder="0"
                    id="bankTransfer"
                    className="px-4 py-2"
                  />
                </div>

                {/* Tiền mặt */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Tiền mặt
                  </label>
                  <PriceInput
                    value={formData.cashPayment}
                    inputValue={cashPaymentInputValue}
                    onValueChange={(price) =>
                      setFormData({ cashPayment: price })
                    }
                    onInputValueChange={setCashPaymentInputValue}
                    placeholder="0"
                    id="cashPayment"
                    className="px-4 py-2"
                  />
                </div>

                {/* Khác */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Khác
                  </label>
                  <input
                    type="text"
                    value={formData.otherPayment}
                    onChange={(e) =>
                      setFormData({ otherPayment: e.target.value })
                    }
                    placeholder="Nhập phương thức khác (tùy chọn)"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
                  />
                </div>
              </div>
            </div>

            {/* Ghi chú */}
            <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Ghi chú
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ note: e.target.value })}
                rows={3}
                placeholder="Nhập ghi chú (tùy chọn)"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  router.push("/");
                }}
                className="rounded-lg border border-zinc-300 bg-white px-6 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-zinc-900"
              >
                {loading ? "Đang lưu..." : "Lưu Phiếu Bán"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast Notification */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          success: {
            iconTheme: {
              primary: "#fff",
              secondary: "#10b981"
            }
          }
        }}
      />
    </div>
  );
}

export default function ExportPage() {
  const { loading: authLoading, isAuthenticated } = useAuth();

  if (authLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Suspense fallback={<Loading />}>
      <ExportForm />
    </Suspense>
  );
}
