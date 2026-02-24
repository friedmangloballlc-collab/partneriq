import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Plus, Trash2, Check, Loader2 } from "lucide-react";

export default function PaymentMethodManager({ customerId }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [cardData, setCardData] = useState({ number: "", exp_month: "", exp_year: "", cvc: "" });
  const [addingCard, setAddingCard] = useState(false);
  const queryClient = useQueryClient();

  const { data: paymentMethods = [], isLoading } = useQuery({
    queryKey: ["payment-methods", customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const result = await base44.functions.invoke("getPaymentMethods", { customerId });
      return result.data.methods || [];
    },
    enabled: !!customerId,
  });

  const deleteCardMutation = useMutation({
    mutationFn: async (paymentMethodId) => {
      return base44.functions.invoke("deletePaymentMethod", { paymentMethodId, customerId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods", customerId] });
    },
  });

  const addCardMutation = useMutation({
    mutationFn: async (data) => {
      return base44.functions.invoke("addPaymentMethod", { ...data, customerId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods", customerId] });
      setShowAddForm(false);
      setCardData({ number: "", exp_month: "", exp_year: "", cvc: "" });
    },
  });

  const handleAddCard = async () => {
    setAddingCard(true);
    try {
      await addCardMutation.mutateAsync(cardData);
    } finally {
      setAddingCard(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5" /> Payment Methods
        </h3>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Add Card
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Add Payment Method</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Card Number</Label>
                <Input placeholder="4242 4242 4242 4242" value={cardData.number} onChange={e => setCardData({...cardData, number: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Exp Month</Label>
                  <Input placeholder="MM" value={cardData.exp_month} onChange={e => setCardData({...cardData, exp_month: e.target.value})} />
                </div>
                <div>
                  <Label>Exp Year</Label>
                  <Input placeholder="YY" value={cardData.exp_year} onChange={e => setCardData({...cardData, exp_year: e.target.value})} />
                </div>
              </div>
              <div>
                <Label>CVC</Label>
                <Input type="password" placeholder="123" value={cardData.cvc} onChange={e => setCardData({...cardData, cvc: e.target.value})} maxLength="4" />
              </div>
              <Button onClick={handleAddCard} disabled={addingCard || !cardData.number || !cardData.exp_month || !cardData.exp_year} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {addingCard ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Add Card
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {paymentMethods.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-lg">
          <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No payment methods saved</p>
        </div>
      ) : (
        <div className="space-y-2">
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50/50">
              <div className="flex items-center gap-3 flex-1">
                <CreditCard className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{method.brand?.toUpperCase()} •••• {method.last4}</p>
                  <p className="text-xs text-slate-500">{method.exp_month}/{method.exp_year}</p>
                </div>
                {method.is_default && <Badge className="ml-auto bg-emerald-100 text-emerald-700">Default</Badge>}
              </div>
              <Button
                variant="ghost"
                size="icon"
                disabled={deleteCardMutation.isPending}
                onClick={() => deleteCardMutation.mutate(method.id)}
                className="text-slate-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}