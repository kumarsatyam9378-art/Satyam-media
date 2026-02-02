import { useMyQueue, useUpdateQueueItem } from "@/hooks/use-queue";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, MapPin, Loader2, CalendarX } from "lucide-react";

export default function MyTokens() {
  const { data: queueItems, isLoading } = useMyQueue();
  const { mutate: updateStatus, isPending } = useUpdateQueueItem();

  const handleCancel = (id: number) => {
    if (confirm("Are you sure you want to leave the queue?")) {
      updateStatus({ id, status: 'cancelled' });
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30 pb-20">
      <Header title="My Tokens" subtitle="Track your position in real-time" />
      
      <div className="max-w-md mx-auto p-4 space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : queueItems?.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Active Tokens</h3>
            <p className="text-muted-foreground mb-6">You aren't in any queues right now.</p>
            <Button asChild className="btn-primary">
              <a href="/customer">Find a Salon</a>
            </Button>
          </div>
        ) : (
          queueItems?.map((item) => (
            <Card key={item.id} className="overflow-hidden border-0 shadow-lg relative">
              <div className="bg-primary px-6 py-8 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <p className="text-primary-foreground/80 font-medium tracking-widest text-sm uppercase mb-1">Token Number</p>
                <h2 className="text-6xl font-bold font-display">{item.tokenNumber}</h2>
              </div>
              
              <div className="p-6 bg-white">
                <h3 className="text-xl font-bold mb-1">{item.salon.name}</h3>
                <div className="flex items-center text-sm text-muted-foreground mb-6">
                  <MapPin className="w-3.5 h-3.5 mr-1" />
                  {item.salon.location}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-secondary/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase font-bold">Your Position</p>
                    <p className="text-xl font-bold">{item.position}</p>
                  </div>
                  <div className="bg-secondary/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase font-bold">Est. Wait</p>
                    <p className="text-xl font-bold text-primary">{item.estimatedWaitMinutes} min</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-dashed">
                  <div>
                    <p className="text-sm font-medium">{item.service.name}</p>
                    <p className="text-sm text-muted-foreground">₹{item.service.price}</p>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleCancel(item.id)}
                    disabled={isPending}
                  >
                    <CalendarX className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
      <BottomNav role="customer" />
    </div>
  );
}
