"use client";

import React from "react";
import { User, Key, ShieldAlert } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Button from "../../components/ui/Button";
import Image from "next/image";

export default function SettingsPage() {
  const { data: session } = useSession();

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure? This will wipe all your chat history on this device and sign you out.")) {
        try {
          const dbs = await window.indexedDB.databases();
          dbs.forEach(db => { 
              if(db.name === 'docent-ai-db') window.indexedDB.deleteDatabase(db.name); 
          });
        } catch (e) {
          console.error("Could not clear database", e);
        }
        signOut({ callbackUrl: "/login" });
    }
  };

  return (
    // FIX: Added 'flex-1 overflow-y-auto' and used titanium-950
    <div className="flex-1 overflow-y-auto bg-titanium-950 w-full relative z-10 h-full">
      <div className="pt-24 pb-20 font-sans px-6 max-w-3xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-titanium-800 border border-titanium-700 text-titanium-400 text-xs font-medium">
             <User size={14} />
             <span>Account Management</span>
           </div>
           <h1 className="text-4xl font-bold text-white tracking-tight">Settings</h1>
        </div>

        {/* Profile Section */}
        <div className="p-8 rounded-2xl bg-titanium-900 border border-titanium-800 space-y-6">
           <h2 className="text-lg font-semibold text-white border-b border-titanium-800 pb-4">Profile Details</h2>
           <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-titanium-800 flex items-center justify-center text-2xl font-bold text-white overflow-hidden relative shrink-0">
                  {session?.user?.image ? (
                      <Image 
                        src={session.user.image} 
                        alt="Profile" 
                        width={80} 
                        height={80}
                        className="object-cover"
                      />
                  ) : (
                      session?.user?.name?.[0] || "U"
                  )}
              </div>
              <div className="space-y-1">
                 <div className="text-white font-medium">{session?.user?.name || "User"}</div>
                 <div className="text-titanium-400 text-sm">{session?.user?.email}</div>
              </div>
           </div>
        </div>

        {/* API Section */}
        <div className="p-8 rounded-2xl bg-titanium-900 border border-titanium-800 space-y-8">
           <div className="flex items-center gap-3 border-b border-titanium-800 pb-6">
              <div className="p-2 bg-titanium-800 rounded-lg"><Key size={20} className="text-white"/></div>
              <div>
                <h2 className="text-lg font-semibold text-white">API & Access</h2>
                <p className="text-sm text-titanium-400">Manage your personal access tokens.</p>
              </div>
           </div>
           <div className="bg-titanium-950 p-4 rounded-xl border border-titanium-800 flex items-center justify-between">
              <div className="font-mono text-sm text-titanium-400">dc_live_****************8A2f</div>
              <div className="flex gap-2">
                 <Button variant="secondary" size="sm">Revoke</Button>
                 <Button variant="outline" size="sm">Copy</Button>
              </div>
           </div>
        </div>

        {/* Danger Zone */}
        <div className="p-8 rounded-2xl bg-titanium-900 border border-red-900/20 space-y-6">
           <div className="flex items-center gap-3 text-red-500">
              <ShieldAlert size={20} />
              <h2 className="text-lg font-semibold">Danger Zone</h2>
           </div>
           <div className="flex items-center justify-between py-4 border-t border-titanium-800">
              <div>
                 <div className="text-white font-medium">Delete Account</div>
                 <div className="text-xs text-titanium-400 mt-1">Permanently remove all chats and data.</div>
              </div>
              <Button 
                onClick={handleDeleteAccount}
                className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-red-500/20 border"
              >
                 Delete Account
              </Button>
           </div>
        </div>

      </div>
    </div>
  );
}