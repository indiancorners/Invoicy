import React, { useState, useEffect } from 'react';
import { User, Globe, Shield, Save, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const Settings: React.FC = () => {
  const [wipeConfirm, setWipeConfirm] = useState(false);
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('invoicy_business_profile');
      return saved ? JSON.parse(saved) : {
        name: 'Your Company Name',
        email: 'hello@yourcompany.com',
        phone: '+1 (555) 000-0000',
        address: '123 Business Ave, Suite 100\nNew York, NY 10001',
        gst: '',
        currency: '$'
      };
    } catch (e) {
      return {
        name: 'Your Company Name',
        email: 'hello@yourcompany.com',
        phone: '+1 (555) 000-0000',
        address: '123 Business Ave, Suite 100\nNew York, NY 10001',
        gst: '',
        currency: '$'
      };
    }
  });

  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    localStorage.setItem('invoicy_business_profile', JSON.stringify(profile));
  }, [profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedStatus(true);
    toast.success('Profile saved.');
    setTimeout(() => setSavedStatus(false), 2000);
  };

  return (
    <div className="p-8 md:p-12 max-w-4xl mx-auto space-y-12 pb-24">
      <header>
        <h1 className="text-4xl font-bold tracking-tighter mb-2 uppercase">Studio Settings</h1>
        <p className="text-abyssal/50 font-bold uppercase tracking-[0.25em] text-[10px]">Configure your professional billing environment.</p>
      </header>

      <div className="grid gap-6">
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-oatmeal p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-oatmeal">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-palladian rounded-xl flex items-center justify-center shadow-sm">
                 <User className="text-abyssal" />
               </div>
               <div>
                  <h3 className="text-lg font-bold leading-none uppercase tracking-tight">Business Profile</h3>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Manage your business profile and billing defaults</p>
               </div>
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 bg-abyssal text-white px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-black active:scale-95"
            >
              {savedStatus ? (
                <><CheckCircle2 size={14} className="text-flame" /> Saved</>
              ) : (
                <><Save size={14} /> Save Profile</>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3 block">From: Business Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-palladian/30 border border-transparent focus:bg-white focus:border-flame py-3 px-4 rounded-xl outline-none font-bold text-[13px] transition-all uppercase tracking-widest"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3 block">Professional Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full bg-palladian/30 border border-transparent focus:bg-white focus:border-flame py-3 px-4 rounded-xl outline-none font-bold text-[13px] transition-all uppercase tracking-widest"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3 block">Business Contact</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full bg-palladian/30 border border-transparent focus:bg-white focus:border-flame py-3 px-4 rounded-xl outline-none font-bold text-[13px] transition-all uppercase tracking-widest"
                  />
                </div>
             </div>

             <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3 block">Registered Address</label>
                  <textarea
                    rows={3}
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full bg-palladian/30 border border-transparent focus:bg-white focus:border-flame py-3 px-4 rounded-xl outline-none font-bold text-[13px] transition-all uppercase tracking-widest resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3 block">VAT/GST ID</label>
                    <input
                      type="text"
                      value={profile.gst || ''}
                      onChange={(e) => setProfile({ ...profile, gst: e.target.value })}
                      className="w-full bg-palladian/30 border border-transparent focus:bg-white focus:border-flame py-3 px-4 rounded-xl outline-none font-bold text-[13px] transition-all uppercase tracking-widest"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3 block">Base Currency</label>
                    <select
                      value={profile.currency}
                      onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                      className="w-full bg-palladian/30 border border-transparent focus:bg-white focus:border-flame py-3 px-4 rounded-xl outline-none font-bold text-[13px] transition-all uppercase tracking-widest"
                    >
                       <option value="$">$ - USD</option>
                       <option value="€">€ - EUR</option>
                       <option value="£">£ - GBP</option>
                       <option value="₹">₹ - INR</option>
                    </select>
                  </div>
                </div>
             </div>
          </div>
        </form>

        <section className="bg-white rounded-2xl border border-oatmeal p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8 pb-4 border-b border-oatmeal">
            <div className="w-12 h-12 bg-palladian rounded-xl flex items-center justify-center shadow-sm">
              <Globe className="text-abyssal" />
            </div>
            <div>
               <h3 className="text-lg font-bold leading-none uppercase tracking-tight">Integrations</h3>
               <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">External connections — coming soon</p>
            </div>
          </div>
          <div className="space-y-4">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-palladian/10 rounded-xl border border-oatmeal/20 gap-4">
                <div>
                   <p className="font-bold text-[11px] uppercase tracking-widest text-abyssal/80">Supabase Cloud Sync</p>
                   <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Active — data synced via authenticated session</p>
                </div>
                <button
                  type="button"
                  disabled
                  className="bg-abyssal/40 text-white/50 px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest cursor-not-allowed opacity-50 select-none"
                >
                  Connected
                </button>
             </div>
             <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-palladian/10 rounded-xl border border-oatmeal/20 gap-4">
                <div>
                   <p className="font-bold text-[11px] uppercase tracking-widest text-abyssal/80">Clerk Authentication</p>
                   <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Active — signed in via Clerk</p>
                </div>
                <button
                  type="button"
                  disabled
                  className="bg-white/50 border border-neutral-200 text-abyssal/40 px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest cursor-not-allowed opacity-50 select-none"
                >
                  Active
                </button>
             </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-oatmeal p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8 pb-4 border-b border-oatmeal">
            <div className="w-12 h-12 bg-palladian rounded-xl flex items-center justify-center shadow-sm">
              <Shield className="text-abyssal" />
            </div>
            <div>
               <h3 className="text-lg font-bold leading-none uppercase tracking-tight">Data & Privacy</h3>
               <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Control your local storage</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-palladian/20 rounded-xl border border-oatmeal/30 gap-4">
             <div>
                <p className="font-bold text-[13px] uppercase tracking-tight">Clear Local Data</p>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">This will delete all locally stored invoice data permanently.</p>
             </div>
             {wipeConfirm ? (
               <div className="flex items-center gap-2">
                 <button
                   type="button"
                   onClick={() => setWipeConfirm(false)}
                   className="bg-white border border-neutral-200 text-abyssal px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:shadow-md transition-all active:scale-95"
                 >
                   Cancel
                 </button>
                 <button
                   type="button"
                   onClick={() => {
                     localStorage.removeItem('invoicy_vault');
                     toast.success('Local data cleared. Reloading...');
                     setTimeout(() => window.location.reload(), 800);
                   }}
                   className="bg-truffle text-white px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-truffle/20"
                 >
                   Yes, Clear Everything
                 </button>
               </div>
             ) : (
               <button
                 type="button"
                 onClick={() => setWipeConfirm(true)}
                 className="bg-truffle text-white px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-truffle/20"
               >
                 Clear Data
               </button>
             )}
          </div>
        </section>
      </div>
    </div>
  );
};
