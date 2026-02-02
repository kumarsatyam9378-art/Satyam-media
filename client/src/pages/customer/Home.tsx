import { useState } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { useSalons } from "@/hooks/use-salons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, MapPin, Clock, Star } from "lucide-react";
import { Link } from "wouter";

export default function CustomerHome() {
  const [search, setSearch] = useState("");
  const { data: salons, isLoading } = useSalons(search);

  return (
    <div className="min-h-screen bg-secondary/30 pb-20">
      <Header title="Find a Salon" subtitle="Book your next look" />
      
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input 
            className="pl-10 bg-white border-0 shadow-sm h-12 rounded-xl"
            placeholder="Search salons, services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Featured Section (Mock) */}
        {!search && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Nearby Favorites</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x">
              {/* Using Unsplash with comments */}
              {/* barber shop interior modern */}
              <div className="snap-center shrink-0 w-64 h-40 rounded-2xl overflow-hidden relative shadow-md">
                <img 
                  src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&h=300&fit=crop" 
                  alt="Modern Cuts" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                  <div className="text-white">
                    <p className="font-bold">Modern Cuts</p>
                    <p className="text-xs opacity-80">1.2km away</p>
                  </div>
                </div>
              </div>
               {/* luxury salon interior */}
               <div className="snap-center shrink-0 w-64 h-40 rounded-2xl overflow-hidden relative shadow-md">
                <img 
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&h=300&fit=crop" 
                  alt="Luxe Lounge" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                  <div className="text-white">
                    <p className="font-bold">Luxe Lounge</p>
                    <p className="text-xs opacity-80">2.5km away</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Salon List */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">All Salons</h3>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : salons?.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p>No salons found matching "{search}"</p>
            </div>
          ) : (
            salons?.map((salon) => (
              <Link key={salon.id} href={`/customer/salon/${salon.id}`}>
                <Card className="p-4 mb-4 card-hover cursor-pointer flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gray-100 shrink-0 overflow-hidden">
                    {/* Placeholder salon image */}
                    <img 
                      src={`https://images.unsplash.com/photo-1503951914875-452162b7f30a?w=150&h=150&fit=crop&q=80`}
                      alt={salon.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-lg leading-tight">{salon.name}</h4>
                      <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${salon.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {salon.isOpen ? 'Open' : 'Closed'}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      {salon.location}
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center text-xs font-medium text-primary bg-primary/5 px-2 py-1 rounded-md">
                        <Clock className="w-3 h-3 mr-1" />
                        Wait: ~20m
                      </div>
                      <div className="flex items-center text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        4.8
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
      <BottomNav role="customer" />
    </div>
  );
}
