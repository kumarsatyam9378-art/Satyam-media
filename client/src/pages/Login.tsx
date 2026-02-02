import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Scissors, User } from "lucide-react";
import { useLocation } from "wouter";

export default function Login() {
  const [step, setStep] = useState<"role" | "phone" | "otp">("role");
  const [role, setRole] = useState<"customer" | "barber">("customer");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const [, setLocation] = useLocation();

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) setStep("otp");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we'd check if user exists. 
    // Here we'll just try to login, and if it fails (not implemented on backend for this mock flow accurately without db seeded), 
    // we'll register. 
    // For this demo: Always register if name is provided, else login.
    
    if (name) {
      register({ name, phone, role });
    } else {
      login({ phone, otp });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center p-4 max-w-md mx-auto w-full">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Scissors className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold font-display text-foreground">QueuePro</h1>
        <p className="text-muted-foreground mt-2">Smart salon management</p>
      </div>

      {step === "role" && (
        <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-bottom duration-500">
          <Card 
            className="p-6 cursor-pointer hover:border-primary transition-all group"
            onClick={() => { setRole("customer"); setStep("phone"); }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">I'm a Customer</h3>
                <p className="text-sm text-muted-foreground">Book appointments & join queues</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-6 cursor-pointer hover:border-primary transition-all group"
            onClick={() => { setRole("barber"); setStep("phone"); }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <Scissors className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">I'm a Barber</h3>
                <p className="text-sm text-muted-foreground">Manage your salon & queue</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {step === "phone" && (
        <form onSubmit={handlePhoneSubmit} className="space-y-4 animate-in slide-in-from-right duration-300">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold">What's your number?</h2>
            <p className="text-sm text-muted-foreground">We'll send you a verification code</p>
          </div>
          
          <Input 
            type="tel" 
            placeholder="Phone Number" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)}
            className="text-lg py-6"
            required
          />
          
          <div className="space-y-4">
            <Input 
              placeholder="Your Name (if new user)" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="py-6"
            />
            <p className="text-xs text-muted-foreground text-center">Optional: Enter name to create new account</p>
          </div>

          <Button type="submit" className="w-full btn-primary py-6 text-lg" disabled={!phone}>
            Continue
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setStep("role")}>Back</Button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleLogin} className="space-y-4 animate-in slide-in-from-right duration-300">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold">Verify Number</h2>
            <p className="text-sm text-muted-foreground">Enter the code sent to {phone}</p>
          </div>

          <Input 
            type="text" 
            placeholder="Enter OTP (1234)" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value)}
            className="text-center text-2xl tracking-widest py-6"
            maxLength={4}
            required
          />

          <Button 
            type="submit" 
            className="w-full btn-primary py-6 text-lg" 
            disabled={otp.length !== 4 || isLoggingIn || isRegistering}
          >
            {isLoggingIn || isRegistering ? "Verifying..." : "Verify & Login"}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setStep("phone")}>Change Number</Button>
        </form>
      )}
    </div>
  );
}
