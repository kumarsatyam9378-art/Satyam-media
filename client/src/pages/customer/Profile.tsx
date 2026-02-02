import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreditCard, History, Settings, LogOut, Crown } from "lucide-react";

export default function CustomerProfile() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-secondary/30 pb-20">
      <Header title="Profile" showLogout={false} />
      
      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-border/50">
          <Avatar className="w-16 h-16 border-2 border-primary/20">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} />
            <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{user?.name || "Guest User"}</h2>
            <p className="text-muted-foreground">{user?.phone}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Membership</h3>
          <Card className="p-6 bg-gradient-to-br from-indigo-900 to-purple-800 text-white border-none shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">Free Plan</h3>
                  <p className="text-indigo-200 text-sm">Upgrade for faster service</p>
                </div>
                <Crown className="w-6 h-6 text-yellow-400 fill-current" />
              </div>
              <Button size="sm" className="bg-white text-indigo-900 hover:bg-white/90 font-bold border-none">
                Upgrade to Premium
              </Button>
            </div>
            {/* Abstract background shape */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          </Card>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Settings</h3>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border/50">
            <MenuItem icon={History} label="Booking History" />
            <div className="h-[1px] bg-border/50 mx-4" />
            <MenuItem icon={CreditCard} label="Payment Methods" />
            <div className="h-[1px] bg-border/50 mx-4" />
            <MenuItem icon={Settings} label="Preferences" />
            <div className="h-[1px] bg-border/50 mx-4" />
            <MenuItem icon={LogOut} label="Log Out" onClick={logout} className="text-destructive" />
          </div>
        </div>
      </div>
      <BottomNav role="customer" />
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, className = "" }: any) {
  return (
    <div 
      onClick={onClick}
      className={`p-4 flex items-center cursor-pointer hover:bg-secondary/50 transition-colors ${className}`}
    >
      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mr-4">
        <Icon className="w-4 h-4 opacity-70" />
      </div>
      <span className="font-medium">{label}</span>
    </div>
  );
}
