"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Truck, PackageCheck, XCircle } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth-context";
import { getBranches } from "@/lib/api/branches";
import {
  getStockTransfer,
  approveStockTransfer,
  dispatchStockTransfer,
  receiveStockTransfer,
  rejectStockTransfer,
  type ApiStockTransfer,
} from "@/lib/api/stock-transfers";
import type { ApiBranch } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function StockTransferDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { isManager, isOwner, user } = useAuth();
  const [transfer, setTransfer] = useState<ApiStockTransfer | null>(null);

  const isSourceBranchManager = isOwner || (user?.branch_id ? Number(user.branch_id) === Number(transfer?.from_branch_id) : false);
  const isDestBranchManager = isOwner || (user?.branch_id ? Number(user.branch_id) === Number(transfer?.to_branch_id) : false);
  const [branches, setBranches] = useState<ApiBranch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    variant: "blue" | "purple" | "success" | "danger";
    actionFn: () => Promise<any>;
    successMsg: string;
  }>({
    open: false,
    title: "",
    description: "",
    confirmLabel: "Confirm",
    variant: "blue",
    actionFn: async () => {},
    successMsg: "",
  });

  useEffect(() => {
    async function loadBranches() {
      try {
        const res = await getBranches();
        const list = Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
        setBranches(list);
      } catch {
        // Silent error
      }
    }
    loadBranches();
  }, []);

  const getBranchName = (branchId?: number, relationBranch?: { name: string }) => {
    if (relationBranch?.name) return relationBranch.name;
    if (!branchId) return "Main Branch";
    const match = branches.find((b) => b.id === branchId);
    return match ? match.name : `Branch #${branchId}`;
  };

  const fetchTransfer = async () => {
    setIsLoading(true);
    try {
      const res = await getStockTransfer(params.id as string);
      setTransfer(res.data);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to load transfer details", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchTransfer();
    }
  }, [params.id]);

  const executeConfirmAction = async () => {
    setConfirmConfig((prev) => ({ ...prev, open: false }));
    setIsProcessing(true);
    try {
      await confirmConfig.actionFn();
      toast(confirmConfig.successMsg, "success");
      await fetchTransfer();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Action failed", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const promptAction = (
    title: string,
    description: string,
    confirmLabel: string,
    variant: "blue" | "purple" | "success" | "danger",
    actionFn: () => Promise<any>,
    successMsg: string
  ) => {
    setConfirmConfig({
      open: true,
      title,
      description,
      confirmLabel,
      variant,
      actionFn,
      successMsg,
    });
  };

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-neutral-500">Loading stock transfer details...</div>;
  }

  if (!transfer) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Transfer Not Found</h1>
            <p className="mt-0.5 text-sm text-neutral-500">The requested stock transfer does not exist</p>
          </div>
        </div>
        <Link
          href="/stock-transfers"
          className="inline-flex rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          Go to stock transfers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{transfer.transfer_number}</h1>
            <p className="mt-0.5 text-sm text-neutral-500">Requested on {formatDate(transfer.created_at)}</p>
          </div>
        </div>

        {(isManager || isOwner) && (
          <div className="flex flex-wrap items-center gap-2">
            {transfer.status === "requested" && isSourceBranchManager && (
              <>
                <button
                  disabled={isProcessing}
                  onClick={() =>
                    promptAction(
                      "Approve Stock Transfer",
                      `Are you sure you want to approve transfer ${transfer.transfer_number}?`,
                      "Approve",
                      "blue",
                      () => approveStockTransfer(transfer.id),
                      "Stock transfer approved"
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Approve Request
                </button>
                <button
                  disabled={isProcessing}
                  onClick={() =>
                    promptAction(
                      "Reject Stock Transfer",
                      `Are you sure you want to reject transfer ${transfer.transfer_number}?`,
                      "Reject",
                      "danger",
                      () => rejectStockTransfer(transfer.id),
                      "Stock transfer rejected"
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Reject
                </button>
              </>
            )}

            {(transfer.status === "requested" || transfer.status === "approved") && isSourceBranchManager && (
              <button
                disabled={isProcessing}
                onClick={() =>
                  promptAction(
                    "Dispatch Stock Transfer",
                    `Are you sure you want to dispatch transfer ${transfer.transfer_number}? Inventory at the source branch will be decremented immediately.`,
                    "Dispatch Stock",
                    "purple",
                    () => dispatchStockTransfer(transfer.id),
                    "Stock transfer dispatched & source inventory decremented"
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
              >
                <Truck className="h-3.5 w-3.5" />
                Dispatch Transfer
              </button>
            )}

            {transfer.status === "dispatched" && isDestBranchManager && (
              <button
                disabled={isProcessing}
                onClick={() =>
                  promptAction(
                    "Confirm Receipt of Stock",
                    `Are you sure you want to confirm reception for transfer ${transfer.transfer_number}? Stock will be added to destination inventory.`,
                    "Confirm Received",
                    "success",
                    () => receiveStockTransfer(transfer.id),
                    "Stock transfer received & target inventory updated"
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                <PackageCheck className="h-3.5 w-3.5" />
                Confirm Received
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-[#0A0A0A]">
          <p className="text-xs text-neutral-500">From Branch</p>
          <p className="mt-1 text-sm font-medium">
            {getBranchName(transfer.from_branch_id, transfer.fromBranch || transfer.from_branch)}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-[#0A0A0A]">
          <p className="text-xs text-neutral-500">To Branch</p>
          <p className="mt-1 text-sm font-medium">
            {getBranchName(transfer.to_branch_id, transfer.toBranch || transfer.to_branch)}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-[#0A0A0A]">
          <p className="text-xs text-neutral-500">Status</p>
          <p className="mt-1 text-sm font-medium capitalize">{transfer.status}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-[#0A0A0A]">
          <p className="text-xs text-neutral-500">Requested By</p>
          <p className="mt-1 text-sm font-medium">{transfer.requestedBy?.name ?? "—"}</p>
        </div>
      </div>

      {transfer.notes && (
        <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-[#0A0A0A]">
          <p className="text-xs text-neutral-500">Notes / Rationale</p>
          <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">{transfer.notes}</p>
        </div>
      )}

      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-[#0A0A0A]">
        <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-sm font-medium">Transfer Line Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 text-left dark:border-neutral-800">
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500">Product</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Requested Qty (Packs)</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Dispatched Qty (Packs)</th>
                <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-neutral-500 text-right">Received Qty (Packs)</th>
              </tr>
            </thead>
            <tbody>
              {(transfer.items || []).map((item) => {
                const packSize = (item.product as any)?.pack_size ?? 1;
                const reqPacks = item.requested_quantity || 0;
                const sentPacks = item.sent_quantity;
                const recPacks = item.received_quantity;

                const formatQty = (packs: number | null | undefined) => {
                  if (packs === null || packs === undefined) return "—";
                  if (packSize > 1) {
                    return `${packs} Packs (${packs * packSize} Units)`;
                  }
                  return `${packs} Units`;
                };

                return (
                  <tr key={item.id} className="border-b border-neutral-200 last:border-b-0 dark:border-neutral-800">
                    <td className="px-4 py-2.5 text-sm font-medium">{item.product?.name ?? `Product #${item.product_id}`}</td>
                    <td className="px-4 py-2.5 text-sm text-right font-medium">{formatQty(reqPacks)}</td>
                    <td className="px-4 py-2.5 text-sm text-right text-neutral-600 dark:text-neutral-400">{formatQty(sentPacks)}</td>
                    <td className="px-4 py-2.5 text-sm text-right text-neutral-600 dark:text-neutral-400">{formatQty(recPacks)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={confirmConfig.open}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmLabel={confirmConfig.confirmLabel}
        variant={confirmConfig.variant}
        onConfirm={executeConfirmAction}
        onCancel={() => setConfirmConfig((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
