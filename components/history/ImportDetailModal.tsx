"use client";

import { useEffect, useState } from "react";
import {
  ImportRecord,
  getImportRecordById,
  updateImportRecord
} from "../../lib/importService";
import { getPhoneDetail, PhoneDetail } from "../../lib/phoneDetailService";
import { formatDate } from "../../utils/dateUtils";
import { formatCurrency } from "../../utils/currencyUtils";
import Loading from "../common/Loading";
import DateInputField from "../import/DateInputField";
import SupplierSelectorField from "../import/SupplierSelectorField";
import { getSuppliers } from "../../lib/configService";
import toast from "react-hot-toast";
import {
  collection,
  getDocs,
  query,
  where,
  DocumentData
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { getPhone } from "../../lib/phoneService";

interface ImportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  importRecordId: string | null;
  warehouseName?: string;
}

type PhoneStatus = "in_warehouse" | "exported" | "recycled";

interface PhoneDetailWithStatus extends PhoneDetail {
  phoneStatus: PhoneStatus;
}

export default function ImportDetailModal({
  isOpen,
  onClose,
  importRecordId,
  warehouseName
}: ImportDetailModalProps) {
  const [importRecord, setImportRecord] = useState<ImportRecord | null>(null);
  const [phoneDetails, setPhoneDetails] = useState<PhoneDetailWithStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<{
    importDate: Date;
    supplier: string;
    note: string;
  } | null>(null);
  const [dateInputValue, setDateInputValue] = useState("");
  const [isDateFocused, setIsDateFocused] = useState(false);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [newSupplier, setNewSupplier] = useState("");
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && importRecordId) {
      const loadImportRecord = async () => {
        setLoading(true);
        setError(null);

        try {
          const record = await getImportRecordById(importRecordId);
          if (!record) {
            setError("Không tìm thấy phiếu nhập hàng");
            setLoading(false);
            return;
          }

          setImportRecord(record);
          setEditFormData({
            importDate: record.importDate,
            supplier: record.supplier,
            note: record.note
          });
          setDateInputValue(formatDate(record.importDate));

          // Load phone details from 3 collections
          if (record.phoneDetailIds && record.phoneDetailIds.length > 0) {
            // Load all phoneRecycles for this import once
            let phoneRecycles: Array<{
              data: DocumentData;
              phone: Awaited<ReturnType<typeof getPhone>>;
            }> = [];
            try {
              const phoneRecyclesRef = collection(db, "phoneRecycles");
              const q = query(
                phoneRecyclesRef,
                where("importId", "==", record.id)
              );
              const querySnapshot = await getDocs(q);
              phoneRecycles = await Promise.all(
                querySnapshot.docs.map(async (doc) => {
                  const data = doc.data();
                  const phone = data.phoneId
                    ? await getPhone(data.phoneId)
                    : null;
                  return { data, phone };
                })
              );
            } catch (err) {
              console.error("Error loading phoneRecycles:", err);
            }

            let recycleIndex = 0;

            const detailsWithStatus = await Promise.all(
              record.phoneDetailIds.map(async (id) => {
                // Try to find in phoneDetails first
                const phoneDetail = await getPhoneDetail(id);
                if (phoneDetail) {
                  return {
                    ...phoneDetail,
                    phoneStatus: "in_warehouse" as PhoneStatus
                  };
                }

                // If not found, try to find in phoneExporteds
                try {
                  const phoneExportedsRef = collection(db, "phoneExporteds");
                  const q = query(
                    phoneExportedsRef,
                    where("phoneDetailId", "==", id)
                  );
                  const querySnapshot = await getDocs(q);
                  if (!querySnapshot.empty) {
                    const exportedDoc = querySnapshot.docs[0];
                    const data = exportedDoc.data();
                    const phone = data.phoneId
                      ? await getPhone(data.phoneId)
                      : null;

                    const phoneDetailData: PhoneDetailWithStatus = {
                      id: data.phoneDetailId || id,
                      phoneId: data.phoneId || "",
                      warehouseId: data.warehouseId || "",
                      color: data.color || "",
                      imei: data.imei || "",
                      importPrice: data.importPrice || 0,
                      salePrice: data.salePrice || 0,
                      status: data.status || "",
                      updatedBy: data.updatedBy || {
                        employeeId: "",
                        employeeName: ""
                      },
                      createdAt: data.originalCreatedAt?.toDate(),
                      updatedAt: data.originalUpdatedAt?.toDate(),
                      importId: data.importId || undefined,
                      importDate: data.importDate?.toDate(),
                      name: phone?.name || data.phoneName || undefined,
                      phoneStatus: "exported" as PhoneStatus
                    };
                    return phoneDetailData;
                  }
                } catch (err) {
                  console.error("Error finding in phoneExporteds:", err);
                }

                // If still not found, try to find in phoneRecycles
                // Match by index since we don't have the original id
                if (recycleIndex < phoneRecycles.length) {
                  const { data, phone } = phoneRecycles[recycleIndex];
                  recycleIndex++;

                  const phoneDetailData: PhoneDetailWithStatus = {
                    id: id, // Use original id
                    phoneId: data.phoneId || "",
                    warehouseId: data.warehouseId || "",
                    color: data.color || "",
                    imei: data.imei || "",
                    importPrice: data.importPrice || 0,
                    salePrice: data.salePrice || 0,
                    status: data.status || "",
                    updatedBy: data.updatedBy || {
                      employeeId: "",
                      employeeName: ""
                    },
                    createdAt: data.createdAt?.toDate(),
                    updatedAt: data.updatedAt?.toDate(),
                    importId: data.importId || undefined,
                    importDate: data.importDate?.toDate(),
                    name: phone?.name || undefined,
                    phoneStatus: "recycled" as PhoneStatus
                  };
                  return phoneDetailData;
                }

                // If not found in any collection, return null
                return null;
              })
            );

            const validDetails = detailsWithStatus.filter(
              (detail): detail is PhoneDetailWithStatus => detail !== null
            );
            setPhoneDetails(validDetails);
          } else {
            setPhoneDetails([]);
          }

          // Load suppliers
          const suppliersData = await getSuppliers();
          setSuppliers(suppliersData);
        } catch (err) {
          console.error("Error loading import record:", err);
          setError("Không thể tải thông tin phiếu nhập hàng");
        } finally {
          setLoading(false);
        }
      };

      loadImportRecord();
    } else {
      setImportRecord(null);
      setPhoneDetails([]);
      setError(null);
      setIsEditing(false);
      setEditFormData(null);
      setDateInputValue("");
      setNewSupplier("");
      setShowAddSupplier(false);
    }
  }, [isOpen, importRecordId]);

  const handleEdit = () => {
    if (importRecord) {
      setIsEditing(true);
      setEditFormData({
        importDate: importRecord.importDate,
        supplier: importRecord.supplier,
        note: importRecord.note
      });
      setDateInputValue(formatDate(importRecord.importDate));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (importRecord) {
      setEditFormData({
        importDate: importRecord.importDate,
        supplier: importRecord.supplier,
        note: importRecord.note
      });
      setDateInputValue(formatDate(importRecord.importDate));
    }
    setNewSupplier("");
    setShowAddSupplier(false);
  };

  const handleSave = async () => {
    if (!importRecordId || !editFormData) return;

    setSaving(true);
    setError(null);

    try {
      await updateImportRecord(importRecordId, {
        importDate: editFormData.importDate,
        supplier: editFormData.supplier,
        note: editFormData.note
      });

      // Reload the record
      const updatedRecord = await getImportRecordById(importRecordId);
      if (updatedRecord) {
        setImportRecord(updatedRecord);
      }

      setIsEditing(false);
      toast.success("Đã cập nhật phiếu nhập hàng thành công!");
    } catch (err) {
      console.error("Error updating import record:", err);
      setError("Không thể cập nhật phiếu nhập hàng");
      toast.error("Không thể cập nhật phiếu nhập hàng");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-zinc-900">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Chi Tiết Phiếu Nhập Hàng
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loading />
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          ) : importRecord && editFormData ? (
            <div className="space-y-6">
              {isEditing ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSave();
                  }}
                  className="space-y-6"
                >
                  {/* Basic Information - Edit Mode */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Date Input */}
                    <DateInputField
                      importDate={editFormData.importDate}
                      dateInputValue={dateInputValue}
                      isDateFocused={isDateFocused}
                      onDateChange={(date) =>
                        setEditFormData({ ...editFormData, importDate: date })
                      }
                      onDateInputValueChange={setDateInputValue}
                      onDateFocus={setIsDateFocused}
                    />

                    {/* Phone Type - Readonly */}
                    <div>
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Loại máy
                      </label>
                      <input
                        type="text"
                        value={importRecord.phoneType || "N/A"}
                        disabled
                        className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 cursor-not-allowed"
                      />
                    </div>

                    {/* Quantity - Readonly */}
                    <div>
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Số lượng
                      </label>
                      <input
                        type="text"
                        value={importRecord.quantity || 0}
                        disabled
                        className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 cursor-not-allowed"
                      />
                    </div>

                    {/* Supplier Selector */}
                    <SupplierSelectorField
                      suppliers={suppliers}
                      selectedSupplier={editFormData.supplier}
                      newSupplier={newSupplier}
                      showAddSupplier={showAddSupplier}
                      onSupplierChange={(supplier) =>
                        setEditFormData({ ...editFormData, supplier })
                      }
                      onNewSupplierChange={setNewSupplier}
                      onShowAddSupplier={setShowAddSupplier}
                    />

                    {/* Employee - Readonly */}
                    <div>
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Nhân viên
                      </label>
                      <input
                        type="text"
                        value={importRecord.employeeName || "N/A"}
                        disabled
                        className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 cursor-not-allowed"
                      />
                    </div>

                    {/* Warehouse - Readonly */}
                    {warehouseName && (
                      <div>
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Kho
                        </label>
                        <input
                          type="text"
                          value={warehouseName}
                          disabled
                          className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 cursor-not-allowed"
                        />
                      </div>
                    )}
                  </div>

                  {/* Note - Editable */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Ghi chú
                    </label>
                    <textarea
                      value={editFormData.note}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          note: e.target.value
                        })
                      }
                      rows={3}
                      placeholder="Nhập ghi chú (tùy chọn)"
                      className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
                    />
                  </div>
                </form>
              ) : (
                <>
                  {/* Basic Information - View Mode */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Ngày nhập
                      </label>
                      <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                        {formatDate(importRecord.importDate)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Loại máy
                      </label>
                      <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                        {importRecord.phoneType || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Số lượng
                      </label>
                      <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                        {importRecord.quantity || 0}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Nhà cung cấp
                      </label>
                      <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                        {importRecord.supplier || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Nhân viên
                      </label>
                      <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                        {importRecord.employeeName || "N/A"}
                      </p>
                    </div>
                    {warehouseName && (
                      <div>
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Kho
                        </label>
                        <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                          {warehouseName}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Note - View Mode */}
                  {importRecord.note && (
                    <div>
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Ghi chú
                      </label>
                      <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                        {importRecord.note}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Phone Details */}
              {phoneDetails.length > 0 && (
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    Danh Sách Thiết Bị
                  </h3>

                  {/* Desktop Table View */}
                  <div className="hidden overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 md:block">
                    <table className="w-full">
                      <thead className="bg-zinc-50 dark:bg-zinc-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                            STT
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                            Màu sắc
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                            IMEI
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                            Giá nhập
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                            Giá bán
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                            Tình trạng máy
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                            Trạng thái
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                        {phoneDetails.map((detail, index) => {
                          const getStatusText = (status: PhoneStatus) => {
                            switch (status) {
                              case "in_warehouse":
                                return "Còn trong kho";
                              case "exported":
                                return "Đã bán";
                              case "recycled":
                                return "Đã xoá";
                              default:
                                return "N/A";
                            }
                          };

                          const getStatusColor = (status: PhoneStatus) => {
                            switch (status) {
                              case "in_warehouse":
                                return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
                              case "exported":
                                return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
                              case "recycled":
                                return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
                              default:
                                return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400";
                            }
                          };

                          return (
                            <tr
                              key={detail.id}
                              className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                            >
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50">
                                {index + 1}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50">
                                {detail.color || "N/A"}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50">
                                {detail.imei || "N/A"}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50">
                                {formatCurrency(detail.importPrice || 0)}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50">
                                {formatCurrency(detail.salePrice || 0)}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50">
                                {detail.status || "N/A"}
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm">
                                <span
                                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                                    detail.phoneStatus
                                  )}`}
                                >
                                  {getStatusText(detail.phoneStatus)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="space-y-3 md:hidden">
                    {phoneDetails.map((detail, index) => {
                      const getStatusText = (status: PhoneStatus) => {
                        switch (status) {
                          case "in_warehouse":
                            return "Còn trong kho";
                          case "exported":
                            return "Đã bán";
                          case "recycled":
                            return "Đã xoá";
                          default:
                            return "N/A";
                        }
                      };

                      const getStatusColor = (status: PhoneStatus) => {
                        switch (status) {
                          case "in_warehouse":
                            return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
                          case "exported":
                            return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
                          case "recycled":
                            return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
                          default:
                            return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400";
                        }
                      };

                      return (
                        <div
                          key={detail.id}
                          className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                        >
                          <div className="p-4">
                            {/* Header: STT and Status */}
                            <div className="mb-3 flex items-start justify-between border-b border-zinc-200 pb-2 dark:border-zinc-800">
                              <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                STT: {index + 1}
                              </div>
                              <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                                  detail.phoneStatus
                                )}`}
                              >
                                {getStatusText(detail.phoneStatus)}
                              </span>
                            </div>

                            {/* Color and IMEI */}
                            <div className="mb-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                  Màu sắc:
                                </span>
                                <span className="text-sm text-zinc-900 dark:text-zinc-50">
                                  {detail.color || "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                  IMEI:
                                </span>
                                <span className="text-sm text-zinc-900 dark:text-zinc-50">
                                  {detail.imei || "N/A"}
                                </span>
                              </div>
                            </div>

                            {/* Prices */}
                            <div className="mb-3 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                    Giá nhập:
                                  </span>
                                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                                    {formatCurrency(detail.importPrice || 0)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                    Giá bán:
                                  </span>
                                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                                    {formatCurrency(detail.salePrice || 0)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Status */}
                            {detail.status && (
                              <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
                                <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                  Tình trạng máy:
                                </div>
                                <div className="mt-1 whitespace-pre-wrap break-words text-sm text-zinc-700 dark:text-zinc-300">
                                  {detail.status}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Summary */}
              {phoneDetails.length > 0 && (
                <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Tổng số lượng:
                      </span>
                      <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                        {phoneDetails.length}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Tổng giá nhập:
                      </span>
                      <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                        {formatCurrency(
                          phoneDetails.reduce(
                            (sum, detail) => sum + (detail.importPrice || 0),
                            0
                          )
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Tổng giá bán:
                      </span>
                      <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                        {formatCurrency(
                          phoneDetails.reduce(
                            (sum, detail) => sum + (detail.salePrice || 0),
                            0
                          )
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-800/50">
          <div className="flex justify-end gap-3">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="rounded-lg border border-zinc-300 bg-white px-6 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-zinc-900"
                >
                  {saving ? "Đang lưu..." : "Lưu"}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleEdit}
                  className="rounded-lg border border-zinc-300 bg-white px-6 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
                >
                  Đóng
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
