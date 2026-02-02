import { useState } from "react";
import { useCreateSalon } from "@/hooks/use-salons";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Scissors } from "lucide-react";

export default function BarberSetup() {
  const { user } = useAuth();
  const { mutate: createSalon, isPending } = useCreateSalon();
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    phone: user?.phone || "",
    ownerId: user?.id || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    createSalon({
      ...formData,
      ownerId: user.id
    }, {
      onSuccess: () => setLocation("/barber")
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center p-6 max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Scissors className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold font-display">Setup Your Salon</h1>
        <p className="text-muted-foreground mt-2">Let's get your business online</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Salon Name</label>
          <Input 
            className="input-modern"
            placeholder="e.g. Classic Cuts"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Location</label>
          <Input 
            className="input-modern"
            placeholder="e.g. Downtown, Main St."
            value={formData.location}
            onChange={e => setFormData({...formData, location: e.target.value})}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Contact Number</label>
          <Input 
            className="input-modern"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
            required
          />
        </div>

        <Button type="submit" className="w-full btn-primary h-12 text-lg mt-8" disabled={isPending}>
          {isPending ? "Creating..." : "Launch Salon"}
        </Button>
      </form>
    </div>
  );
}
