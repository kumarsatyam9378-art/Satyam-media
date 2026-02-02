import { useRoute, useLocation } from "wouter";
import { useSalon, useSalonQueueStatus } from "@/hooks/use-salons";
import { useServices } from "@/hooks/use-services";
import { useJoinQueue } from "@/hooks/use-queue";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Clock, MapPin, Phone, Users, ChevronLeft, 
  CheckCircle2, AlertCircle 
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function SalonDetail() {
  const [match, params] = useRoute("/customer/salon/:id");
  const id = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const { data: salon, isLoading: isSalonLoading } = useSalon(id);
  const { data: services, isLoading: isServicesLoading } = useServices(id);
  const { data: queueStatus } = useSalonQueueStatus(id);
  
  const { mutate: joinQueue, isPending: isJoining } = useJoinQueue();
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  if (isSalonLoading || isServicesLoading) return <div className="p-8 text-center">Loading salon details...</div>;
  if (!salon) return <div className="p-8 text-center">Salon not found</div>;

  const handleJoinQueue = () => {
    if (!selectedService || !user) return;
    
    joinQueue(
      { salonId: id, serviceId: selectedService, customerId: user.id },
      {
        onSuccess: () => {
          setShowConfirm(false);
          setLocation("/customer/my-tokens");
        }
      }
    );
  };

  const selectedServiceDetails = services?.find(s => s.id === selectedService);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Image */}
      <div className="relative h-48 w-full">
         {/* salon detail hero image */}
        <img 
          src="https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800&h=400&fit=crop" 
          alt="Salon Interior" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute top-4 left-4 rounded-full h-10 w-10"
          onClick={() => setLocation("/customer")}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-6 relative">
        <Card className="p-5 shadow-lg border-none">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold font-display">{salon.name}</h1>
              <div className="flex items-center text-muted-foreground text-sm mt-1">
                <MapPin className="w-3.5 h-3.5 mr-1" />
                {salon.location}
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${salon.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {salon.isOpen ? 'Open' : 'Closed'}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-6">
            <div className="bg-secondary/50 p-3 rounded-xl text-center">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Waiting</p>
              <p className="text-xl font-bold text-primary">{queueStatus?.queueLength || 0}</p>
            </div>
            <div className="bg-secondary/50 p-3 rounded-xl text-center">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Current</p>
              <p className="text-xl font-bold text-primary">#{queueStatus?.currentToken || 0}</p>
            </div>
            <div className="bg-secondary/50 p-3 rounded-xl text-center">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Wait Time</p>
              <p className="text-xl font-bold text-primary">{queueStatus?.totalWaitTimeMinutes || 0}m</p>
            </div>
          </div>
        </Card>

        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <ScissorsIcon className="w-5 h-5 text-primary" />
            Select Service
          </h2>
          
          <div className="space-y-3">
            {services?.map((service) => (
              <div 
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                className={`
                  p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center
                  ${selectedService === service.id 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border bg-white hover:border-primary/30'}
                `}
              >
                <div>
                  <h3 className="font-semibold">{service.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center mt-1">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {service.durationMinutes} mins
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">₹{service.price}</p>
                  {selectedService === service.id && (
                    <CheckCircle2 className="w-5 h-5 text-primary mt-1 ml-auto" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t safe-area-bottom">
        <Button 
          className="w-full btn-primary h-14 text-lg" 
          disabled={!selectedService || !salon.isOpen}
          onClick={() => setShowConfirm(true)}
        >
          {!salon.isOpen ? "Salon is Closed" : "Get Token"}
        </Button>
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription>
              You are joining the queue at <strong>{salon.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-secondary/30 p-4 rounded-xl space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service</span>
              <span className="font-semibold">{selectedServiceDetails?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price</span>
              <span className="font-semibold">₹{selectedServiceDetails?.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Wait</span>
              <span className="font-semibold text-primary">~{queueStatus?.totalWaitTimeMinutes || 15} mins</span>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button 
              className="flex-1 btn-primary" 
              onClick={handleJoinQueue}
              disabled={isJoining}
            >
              {isJoining ? "Confirming..." : "Confirm & Join"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ScissorsIcon(props: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" x2="8.12" y1="4" y2="15.88" />
      <line x1="14.47" x2="20" y1="14.48" y2="20" />
      <line x1="8.12" x2="12" y1="8.12" y2="12" />
    </svg>
  );
}
