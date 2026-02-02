import { useMySalon, useSalonQueueStatus } from "@/hooks/use-salons";
import { useSalonQueue, useNextCustomer } from "@/hooks/use-queue";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, User, Clock, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";

export default function QueueManagement() {
  const { data: salon } = useMySalon();
  const [, setLocation] = useLocation();
  const salonId = salon?.id || 0;
  
  const { data: queue, isLoading } = useSalonQueue(salonId);
  const { data: stats } = useSalonQueueStatus(salonId);
  const { mutate: callNext, isPending: isCallingNext } = useNextCustomer();

  if (!salon) return null;

  const currentCustomer = queue?.find(item => item.tokenNumber === stats?.currentToken && item.status === 'waiting');
  const waitingList = queue?.filter(item => item.tokenNumber > (stats?.currentToken || 0) && item.status === 'waiting');

  return (
    <div className="min-h-screen bg-secondary/30 pb-20">
      <Header title="Queue Control" subtitle={`Current Token: #${stats?.currentToken || 0}`} />

      <div className="max-w-md mx-auto p-4 space-y-6">
        
        {/* Current Customer Card - Big and Prominent */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border-t-4 border-primary text-center space-y-6">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Now Serving</p>
          
          {currentCustomer ? (
            <div className="animate-in zoom-in duration-300">
              <div className="text-8xl font-bold text-foreground font-display mb-2">
                {currentCustomer.tokenNumber}
              </div>
              <h3 className="text-2xl font-bold text-primary mb-1">{currentCustomer.customer.name}</h3>
              <p className="text-lg text-muted-foreground">{currentCustomer.service.name}</p>
              
              <div className="mt-8">
                <Button 
                  size="lg" 
                  className="w-full h-16 text-xl rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                  onClick={() => callNext(salonId)}
                  disabled={isCallingNext}
                >
                  {isCallingNext ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2" />}
                  Complete & Next
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8">
              <div className="text-6xl font-bold text-muted-foreground/30 font-display mb-4">--</div>
              <p className="text-lg text-muted-foreground">No active customer</p>
              <Button 
                className="mt-6 w-full btn-primary"
                onClick={() => callNext(salonId)}
                disabled={waitingList?.length === 0 || isCallingNext}
              >
                Call First Customer
              </Button>
            </div>
          )}
        </div>

        {/* Up Next List */}
        <div>
          <h3 className="font-bold text-lg px-2 mb-3">Up Next ({waitingList?.length || 0})</h3>
          
          <div className="space-y-3">
            {isLoading ? (
               <div className="text-center py-4"><Loader2 className="animate-spin inline" /></div>
            ) : waitingList?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-white rounded-xl border border-dashed">
                <p>Queue is empty</p>
              </div>
            ) : (
              waitingList?.map((item) => (
                <Card key={item.id} className="p-4 flex items-center justify-between shadow-sm border-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center font-bold text-xl text-primary">
                      {item.tokenNumber}
                    </div>
                    <div>
                      <h4 className="font-bold">{item.customer.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.service.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground flex items-center justify-end">
                      <Clock className="w-3 h-3 mr-1" />
                      ~{item.estimatedWaitMinutes}m
                    </p>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

      </div>
      <BottomNav role="barber" />
    </div>
  );
}
