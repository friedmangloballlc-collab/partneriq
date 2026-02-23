import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";

export default function PortfolioManager({ portfolio = [], onChange }) {
  const [items, setItems] = useState(portfolio);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    description: "",
    collaboration_type: "content_creation",
    engagement_rate: "",
    reach: "",
    deliverables: "",
    date: "",
  });

  const handleAdd = () => {
    const newItem = {
      id: Date.now(),
      ...formData,
      engagement_rate: parseFloat(formData.engagement_rate) || 0,
      reach: parseInt(formData.reach) || 0,
    };
    const updated = [...items, newItem];
    setItems(updated);
    onChange(updated);
    setFormData({
      title: "",
      brand: "",
      description: "",
      collaboration_type: "content_creation",
      engagement_rate: "",
      reach: "",
      deliverables: "",
      date: "",
    });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Portfolio</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" /> Add Collaboration
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {showForm && (
          <Card className="border-indigo-200 bg-indigo-50">
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="title" className="text-xs">Campaign Title *</Label>
                  <Input
                    id="title"
                    placeholder="Summer Campaign 2024"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="brand" className="text-xs">Brand Name *</Label>
                  <Input
                    id="brand"
                    placeholder="Nike"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="description" className="text-xs">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the collaboration..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="engagement" className="text-xs">Engagement Rate (%)</Label>
                  <Input
                    id="engagement"
                    type="number"
                    step="0.1"
                    placeholder="5.2"
                    value={formData.engagement_rate}
                    onChange={(e) => setFormData({ ...formData, engagement_rate: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="reach" className="text-xs">Reach</Label>
                  <Input
                    id="reach"
                    type="number"
                    placeholder="100000"
                    value={formData.reach}
                    onChange={(e) => setFormData({ ...formData, reach: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="date" className="text-xs">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="deliverables" className="text-xs">Deliverables</Label>
                <Input
                  id="deliverables"
                  placeholder="e.g., 3 Instagram posts, 2 Reels"
                  value={formData.deliverables}
                  onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAdd}
                  disabled={!formData.title || !formData.brand}
                  className="flex-1"
                >
                  Add to Portfolio
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {items.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-slate-600">No portfolio items yet. Add your past collaborations to showcase your experience.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-600">{item.brand}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {item.description && (
                  <p className="text-xs text-slate-600">{item.description}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  {item.engagement_rate > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {item.engagement_rate}% engagement
                    </Badge>
                  )}
                  {item.reach > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {item.reach.toLocaleString()} reach
                    </Badge>
                  )}
                  {item.date && (
                    <Badge variant="outline" className="text-xs">
                      {new Date(item.date).toLocaleDateString()}
                    </Badge>
                  )}
                </div>

                {item.deliverables && (
                  <p className="text-xs text-slate-600"><strong>Deliverables:</strong> {item.deliverables}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}