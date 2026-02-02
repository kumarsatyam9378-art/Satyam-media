import { useMySalon, useUpdateSalonStatus, useSalonQueueStatus } from "@/hooks/use-salons";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Scissors, Coffee, Power, Users, Clock } from "lucide-react";
import { useLocation } from "wouter";

export default function BarberDashboard() {
  const { data: salon, isLoading } = useMySalon();
  const [, setLocation] = useLocation();
  const { mutate: updateStatus } = useUpdateSalonStatus();
  
  // Also fetch queue stats for live dashboard
  const { data: stats } = useSalonQueueStatus(salon?.id || 0);

  if (isLoading) return <div className="p-8 text-center">Loading dashboard...</div>;
  
  // If no salon yet, redirect to setup
  if (!salon && !isLoading) {
    setLocation("/barber/setup");
    return null;
  }

  const handleToggleOpen = () => {
    updateStatus({ 
      id: salon.id, 
      action: salon.isOpen ? 'close' : 'open',
      isOpen: !salon.isOpen 
    });
  };

  const handleToggleBreak = () => {
    updateStatus({ 
      id: salon.id, 
      action: salon.isOnBreak ? 'break_end' : 'break_start',
      isOnBreak: !salon.isOnBreak 
    });
  };

  return (
    <div className="min-h-screen bg-secondary/30 pb-20">
      <Header title="Salon Dashboard" subtitle={salon.name} />

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Status Control Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className={`p-5 flex flex-col justify-between h-32 transition-all ${salon.isOpen ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-white'}`}>
            <div className="flex justify-between items-start">
              <Power className={`w-6 h-6 ${salon.isOpen ? 'opacity-80' : 'text-muted-foreground'}`} />
              <Switch 
                checked={salon.isOpen} 
                onCheckedChange={handleToggleOpen}
                className="data-[state=checked]:bg-white/20 data-[state=unchecked]:bg-slate-200"
              />
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${salon.isOpen ? 'text-white/80' : 'text-muted-foreground'}`}>Salon Status</p>
              <h3 className="text-xl font-bold">{salon.isOpen ? 'OPEN' : 'CLOSED'}</h3>
            </div>
          </Card>

          <Card className={`p-5 flex flex-col justify-between h-32 transition-all ${salon.isOnBreak ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-white'}`}>
            <div className="flex justify-between items-start">
              <Coffee className={`w-6 h-6 ${salon.isOnBreak ? 'opacity-80' : 'text-muted-foreground'}`} />
              <Switch 
                checked={salon.isOnBreak} 
                onCheckedChange={handleToggleBreak}
                disabled={!salon.isOpen}
                className="data-[state=checked]:bg-white/20 data-[state=unchecked]:bg-slate-200"
              />
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${salon.isOnBreak ? 'text-white/80' : 'text-muted-foreground'}`}>Break Mode</p>
              <h3 className="text-xl font-bold">{salon.isOnBreak ? 'ON BREAK' : 'WORKING'}</h3>
            </div>
          </Card>
        </div>

        {/* Live Stats */}
        <h3 className="font-bold text-lg px-1">Live Overview</h3>
        <div className="grid grid-cols-3 gap-3">
          <StatsCard label="Waiting" value={stats?.queueLength || 0} icon={Users} color="text-blue-600" bg="bg-blue-50" />
          <StatsCard label="Served" value={stats?.lastIssuedToken || 0} icon={Scissors} color="text-purple-600" bg="bg-purple-50" />
          <StatsCard label="Wait Time" value={`${stats?.totalWaitTimeMinutes || 0}m`} icon={Clock} color="text-orange-600" bg="bg-orange-50" />
        </div>

        {/* Actions */}
        <div className="space-y-4 pt-4">
           <Button className="w-full h-14 text-lg btn-primary" onClick={() => setLocation("/barber/queue")}>
             Manage Queue
           </Button>
           <Button variant="outline" className="w-full h-12" onClick={() => setLocation("/barber/services")}>
             Manage Services
           </Button>
        </div>
      </div>

      <BottomNav role="barber" />
    </div>
  );
}

function StatsCard({ label, value, icon: Icon, color, bg }: any) {
  return (
    <Card className="p-4 flex flex-col items-center justify-center text-center space-y-2 border-0 shadow-sm">
      <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <h4 className="text-2xl font-bold font-display">{value}</h4>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
      </div>
    </Card>
  );
}
