'use client';

import { useRouter } from 'next/navigation';
import { Castle, Users, Sword, Coins, BookOpen, Shield, TrendingUp, Map } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Castle className="text-amber-600" size={80} />
          </div>
          <h1 className="text-6xl font-bold text-amber-100 tracking-wide mb-4">
            Fantasy Domain Manager
          </h1>
          <p className="text-xl text-amber-200/80 mb-8 max-w-2xl mx-auto">
            Command your realm with precision. Manage domains, heroes, troops, and enterprises
            in your fantasy world with powerful tools designed for Dungeon Masters and world builders.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => router.push('/register')}
              className="flex items-center gap-2 bg-amber-700 hover:bg-amber-600 text-amber-100 px-8 py-4 border-2 border-amber-900 font-bold text-lg transition-all hover:shadow-lg hover:shadow-amber-900/30"
            >
              <Shield size={24} />
              Create Account
            </button>
            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-2 border-2 border-amber-700/50 hover:bg-zinc-800 text-amber-100 px-8 py-4 font-bold text-lg transition-all hover:border-amber-600"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-amber-100 text-center mb-8 border-b-2 border-amber-700/30 pb-4">
            Manage Every Aspect of Your Realm
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Domain Management */}
            <div className="bg-zinc-900 border-2 border-amber-700/50 p-6">
              <div className="flex flex-col items-center text-center">
                <Castle className="text-amber-600 mb-4" size={48} />
                <h3 className="text-xl font-bold text-amber-100 mb-2">Domains</h3>
                <p className="text-amber-200/70 text-sm">
                  Track domain names, rulers, populations, income, and upkeep costs.
                  Support for both fixed values and ranges.
                </p>
              </div>
            </div>

            {/* Hero Management */}
            <div className="bg-zinc-900 border-2 border-amber-700/50 p-6">
              <div className="flex flex-col items-center text-center">
                <Sword className="text-amber-600 mb-4" size={48} />
                <h3 className="text-xl font-bold text-amber-100 mb-2">Heroes</h3>
                <p className="text-amber-200/70 text-sm">
                  Manage your champions and adventurers with detailed role assignments,
                  levels, and wage information.
                </p>
              </div>
            </div>

            {/* Troop Management */}
            <div className="bg-zinc-900 border-2 border-amber-700/50 p-6">
              <div className="flex flex-col items-center text-center">
                <Users className="text-amber-600 mb-4" size={48} />
                <h3 className="text-xl font-bold text-amber-100 mb-2">Troops</h3>
                <p className="text-amber-200/70 text-sm">
                  Organize military forces by type and quantity. Track wages
                  and maintain army rosters.
                </p>
              </div>
            </div>

            {/* Enterprise Management */}
            <div className="bg-zinc-900 border-2 border-amber-700/50 p-6">
              <div className="flex flex-col items-center text-center">
                <Coins className="text-amber-600 mb-4" size={48} />
                <h3 className="text-xl font-bold text-amber-100 mb-2">Enterprises</h3>
                <p className="text-amber-200/70 text-sm">
                  Monitor businesses, guilds, and trade operations. Track both
                  income and operational costs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Features */}
        <div className="bg-zinc-900 border-2 border-amber-700/50 p-8 mb-16">
          <h2 className="text-3xl font-bold text-amber-100 text-center mb-6">
            Built for Game Masters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-3">
              <TrendingUp className="text-amber-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-lg font-bold text-amber-100 mb-2">Financial Tracking</h3>
                <p className="text-amber-200/70 text-sm">
                  Flexible income and upkeep systems support both fixed values and variable ranges,
                  perfect for dynamic economies.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <BookOpen className="text-amber-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-lg font-bold text-amber-100 mb-2">Detailed Notes</h3>
                <p className="text-amber-200/70 text-sm">
                  Add custom notes to every entity - domains, heroes, troops, and enterprises.
                  Keep your lore organized.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Map className="text-amber-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-lg font-bold text-amber-100 mb-2">Organized View</h3>
                <p className="text-amber-200/70 text-sm">
                  Clean card-based interface makes it easy to view and manage all aspects
                  of your domains at a glance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="text-center bg-zinc-950/50 border-2 border-amber-700/30 p-8">
          <h2 className="text-3xl font-bold text-amber-100 mb-4">
            Ready to Rule Your Realm?
          </h2>
          <p className="text-amber-200/70 mb-6 max-w-2xl mx-auto">
            Join Fantasy Domain Manager today and bring order to your fantasy world.
            Perfect for D&D campaigns, worldbuilding projects, and tabletop games.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => router.push('/register')}
              className="bg-amber-700 hover:bg-amber-600 text-amber-100 px-8 py-3 border-2 border-amber-900 font-bold text-lg transition-all hover:shadow-lg hover:shadow-amber-900/30"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
