import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Loader2 } from "lucide-react";

export default function BrandSelector({ onBrandChange }) {
  const [selectedBrand, setSelectedBrand] = useState(() => {
    return localStorage.getItem('selectedBrand') || '';
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['userBrands', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const allBrands = await base44.entities.Brand.list('-created_date', 100);
      return allBrands.filter(b => b.contact_email === user.email || b.created_by === user.email);
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (brands.length > 0 && !selectedBrand) {
      setSelectedBrand(brands[0].id);
      localStorage.setItem('selectedBrand', brands[0].id);
      onBrandChange?.(brands[0]);
    }
  }, [brands, selectedBrand, onBrandChange]);

  const handleChange = (brandId) => {
    setSelectedBrand(brandId);
    localStorage.setItem('selectedBrand', brandId);
    const selected = brands.find(b => b.id === brandId);
    onBrandChange?.(selected);
  };

  if (isLoading || brands.length === 0) {
    return null;
  }

  if (brands.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
        <Building2 className="w-4 h-4 text-slate-600" />
        <span className="text-sm font-medium text-slate-700">{brands[0].name}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Building2 className="w-4 h-4 text-slate-600" />
      <Select value={selectedBrand} onValueChange={handleChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select brand..." />
        </SelectTrigger>
        <SelectContent>
          {brands.map(brand => (
            <SelectItem key={brand.id} value={brand.id}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}