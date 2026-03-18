import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DollarSign, Shield, Loader2, CheckCircle2, AlertTriangle,
  RotateCcw, Plus, Lock, Unlock, Eye,
} from "lucide-react";

const STATUS_BADGES = {
  held: { label: "Held", color: "bg-amber-100 text-amber-700 border-amber-200" },
  released: { label: "Released", color: "bg-green-100 text-green-700 border-green-200" },
  refunded: { label: "Refunded", color: "bg-red-100 text-red-700 border-red-200" },
  disputed: { label: "Disputed", color: "bg-orange-100 text-orange-700 border-orange-200" },
};

function fmtMoney(n) {
  if (!n && n !== 0) return "$0";
  return `$${Number(n).toLocaleString()}`;
}

function formatDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function EscrowPanel({ partnershipId, userRole }) {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [newMilestone, setNewMilestone] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [checkingConditions, setCheckingConditions] = useState(false);

  const { data: escrows = [], isLoading } = useQuery({
    queryKey: ["escrow_payments", partnershipId],
    queryFn: () => base44.entities.EscrowPayment.filter({ partnership_id: partnershipId }, "-created_at"),
    enabled: !!partnershipId,
    staleTime: 15000,
  });

  const createHoldMutation = useMutation({
    mutationFn: (payload) => base44.functions.invoke("manageEscrow", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrow_payments", partnershipId] });
      setShowCreateForm(false);
      setNewAmount("");
      setNewMilestone("");
      setNewCondition("");
    },
  });

  const releaseMutation = useMutation({
    mutationFn: (escrowId) =>
      base44.functions.invoke("manageEscrow", { action: "release_payment", escrow_id: escrowId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["escrow_payments", partnershipId] }),
  });

  const refundMutation = useMutation({
    mutationFn: (escrowId) =>
      base44.functions.invoke("manageEscrow", { action: "refund", escrow_id: escrowId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["escrow_payments", partnershipId] }),
  });

  const handleCreateHold = () => {
    if (!newAmount || isNaN(Number(newAmount))) return;
    createHoldMutation.mutate({
      action: "create_hold",
      partnership_id: partnershipId,
      amount: Number(newAmount),
      milestone: newMilestone || null,
      condition: newCondition || null,
    });
  };

  const handleCheckConditions = async () => {
    setCheckingConditions(true);
    try {
      await base44.functions.invoke("manageEscrow", {
        action: "check_conditions",
        partnership_id: partnershipId,
      });
      queryClient.invalidateQueries({ queryKey: ["escrow_payments", partnershipId] });
    } catch (err) {
      // error handled silently
    } finally {
      setCheckingConditions(false);
    }
  };

  // Progress calculations
  const totalAmount = escrows.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const releasedAmount = escrows
    .filter((e) => e.status === "released")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const heldAmount = escrows
    .filter((e) => e.status === "held")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const progressPct = totalAmount > 0 ? (releasedAmount / totalAmount) * 100 : 0;

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-700 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-400" />
            Escrow Payments
          </span>
          <div className="flex items-center gap-2">
            {escrows.some((e) => e.status === "held") && (
              <Button
                size="sm"
                variant="ghost"
                className="text-xs h-7"
                onClick={handleCheckConditions}
                disabled={checkingConditions}
              >
                {checkingConditions ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Eye className="w-3 h-3 mr-1" />
                )}
                Check Conditions
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <Plus className="w-3 h-3 mr-1" />
              Hold Funds
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        {totalAmount > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {fmtMoney(releasedAmount)} released of {fmtMoney(totalAmount)} total
              </span>
              <span className="text-slate-400">{Math.round(progressPct)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPct}%`,
                  background: `linear-gradient(90deg, #22c55e ${progressPct}%, #f59e0b ${progressPct}%)`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Released: {fmtMoney(releasedAmount)}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                Held: {fmtMoney(heldAmount)}
              </span>
            </div>
          </div>
        )}

        {/* Create form */}
        {showCreateForm && (
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 space-y-3">
            <p className="text-xs font-medium text-slate-600">Create Escrow Hold</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wide">Amount ($)</label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="text-sm h-8"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wide">Milestone</label>
                <Input
                  placeholder="Content delivery"
                  value={newMilestone}
                  onChange={(e) => setNewMilestone(e.target.value)}
                  className="text-sm h-8"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wide">Release Condition</label>
              <Textarea
                placeholder="e.g., Content posted and reaches 10K views within 7 days"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                className="text-sm min-h-[60px] resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="text-xs bg-indigo-600 hover:bg-indigo-700"
                onClick={handleCreateHold}
                disabled={!newAmount || createHoldMutation.isPending}
              >
                {createHoldMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Lock className="w-3 h-3 mr-1" />
                )}
                Create Hold
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Escrow list */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : escrows.length === 0 ? (
          <div className="text-center py-6">
            <Shield className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No escrow payments yet.</p>
            <p className="text-[10px] text-slate-300">Create a hold to secure funds for milestones.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {escrows.map((escrow) => {
              const badge = STATUS_BADGES[escrow.status] || STATUS_BADGES.held;
              return (
                <div
                  key={escrow.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-white hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">
                        {fmtMoney(escrow.amount)}
                      </span>
                      <Badge className={`text-[10px] border ${badge.color}`}>
                        {badge.label}
                      </Badge>
                      {escrow.condition_met && escrow.status === "held" && (
                        <Badge className="text-[10px] bg-green-50 text-green-600 border-green-200">
                          Condition Met
                        </Badge>
                      )}
                    </div>
                    {escrow.milestone && (
                      <p className="text-xs text-slate-500 truncate">{escrow.milestone}</p>
                    )}
                    {escrow.condition && (
                      <p className="text-[10px] text-slate-400 truncate">{escrow.condition}</p>
                    )}
                    {escrow.released_at && (
                      <p className="text-[10px] text-slate-400">
                        {escrow.status === "released" ? "Released" : "Refunded"}: {formatDate(escrow.released_at)}
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  {escrow.status === "held" && (
                    <div className="flex gap-1 flex-shrink-0">
                      {(userRole === "brand" || userRole === "admin") && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 text-green-700 border-green-300 hover:bg-green-50"
                          onClick={() => releaseMutation.mutate(escrow.id)}
                          disabled={releaseMutation.isPending}
                        >
                          {releaseMutation.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <Unlock className="w-3 h-3 mr-1" />
                              Release
                            </>
                          )}
                        </Button>
                      )}
                      {(userRole === "talent") && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 text-indigo-700 border-indigo-300 hover:bg-indigo-50"
                          disabled
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Request Release
                        </Button>
                      )}
                      {(userRole === "brand" || userRole === "admin") && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => refundMutation.mutate(escrow.id)}
                          disabled={refundMutation.isPending}
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
