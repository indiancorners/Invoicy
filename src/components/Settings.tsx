import React, { useState, useRef } from 'react';
import { User, Globe, Shield, Save, CheckCircle2, Upload, Trash2 } from 'lucide-react';
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
        currency: '$',
        logo: ''
      };
    } catch (e) {
      return {
        name: 'Your Company Name',
        email: 'hello@yourcompany.com',
        phone: '+1 (555) 000-0000',
        address: '123 Business Ave, Suite 100\nNew York, NY 10001',
        gst: '',
        currency: '$',
        logo: ''
      };
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [savedStatus, setSavedStatus] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfile({ ...profile, logo: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('invoicy_business_profile', JSON.stringify(profile));
    setSavedStatus(true);
    setIsEditing(false);
    toast.success('Profile saved.');
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleCancel = () => {
    try {
      const saved = localStorage.getItem('invoicy_business_profile');
      if (saved) setProfile(JSON.parse(saved));
    } catch {}
    setIsEditing(false);
  };

  /* Shared input class — editing vs read-only states */
  const inputClass = (editing: boolean) =>
    editing
      ? "w-full bg-[#F5F5F7] border border-[#D2D2D7] rounded-xl px-4 py-3 text-[14px] text-[#1D1D1F] focus:outline-none focus:bg-white focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-medium placeholder:text-[#86868B]"
      : "w-full bg-transparent border border-transparent rounded-xl px-4 py-3 text-[14px] text-[#1D1D1F]/60 cursor-default outline-none font-medium";

  const labelClass = "text-[11px] font-semibold uppercase tracking-widest text-[#86868B] mb-1.5 block";

  return (
    <div className="p-8 md:p-12 max-w-4xl mx-auto space-y-10 pb-24">
      <header>
        <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mb-1">Settings</h1>
        <p className="text-[13px] text-[#6E6E73]">Configure your professional billing environment.</p>
      </header>

      <div className="grid gap-6">
        {/* Business Profile */}
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[#D2D2D7] p-8 shadow-none">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#D2D2D7]">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-[#F5F5F7] rounded-xl flex items-center justify-center">
                 <User className="text-[#1D1D1F]" size={18} />
               </div>
               <div>
                  <p className="text-base font-semibold text-[#1D1D1F]">Business Profile</p>
                  <p className="text-[12px] text-[#6E6E73] mt-0.5">Manage your business profile and billing defaults</p>
               </div>
            </div>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-full border border-[#D2D2D7] bg-[#F5F5F7] text-[#1D1D1F] px-5 py-2 text-[13px] font-medium hover:opacity-80 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#1D1D1F] text-white px-6 py-2 text-[13px] font-semibold hover:opacity-80 transition-all flex items-center gap-2"
                >
                  {savedStatus ? (
                    <><CheckCircle2 size={14} className="text-[#16A34A]" /> Saved</>
                  ) : (
                    <><Save size={14} /> Save Profile</>
                  )}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-full border border-[#D2D2D7] bg-[#F5F5F7] text-[#1D1D1F] px-5 py-2 text-[13px] font-medium hover:opacity-80 transition-all"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="mb-8 pb-8 border-b border-[#D2D2D7]">
            <label className={labelClass}>Business Logo</label>
            <div className="flex items-center gap-5">
              <div className="w-24 h-24 rounded-xl border border-[#D2D2D7] bg-[#F5F5F7] flex items-center justify-center overflow-hidden shrink-0">
                {profile.logo ? (
                  <img src={profile.logo} alt="Business logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[11px] font-medium text-[#86868B]">No logo</span>
                )}
              </div>
              {isEditing && (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="rounded-full border border-[#D2D2D7] bg-[#F5F5F7] text-[#1D1D1F] px-5 py-2 text-[13px] font-medium hover:opacity-80 transition-all flex items-center gap-2 w-fit"
                  >
                    <Upload size={14} /> {profile.logo ? 'Replace Logo' : 'Upload Logo'}
                  </button>
                  {profile.logo && (
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, logo: '' })}
                      className="rounded-full border border-[#DC2626]/30 bg-[#FEF2F2] text-[#DC2626] px-5 py-2 text-[13px] font-medium hover:opacity-80 transition-all flex items-center gap-2 w-fit"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  )}
                  <p className="text-[11px] text-[#86868B] mt-0.5">PNG or JPG. Used as the default on new invoices.</p>
                </div>
              )}
              <input
                type="file"
                accept="image/png, image/jpeg"
                ref={logoInputRef}
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-5">
                <div>
                  <label className={labelClass}>Business Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    readOnly={!isEditing}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className={inputClass(isEditing)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Professional Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    readOnly={!isEditing}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className={inputClass(isEditing)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Business Contact</label>
                  <input
                    type="text"
                    value={profile.phone}
                    readOnly={!isEditing}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className={inputClass(isEditing)}
                  />
                </div>
             </div>

             <div className="space-y-5">
                <div>
                  <label className={labelClass}>Registered Address</label>
                  <textarea
                    rows={3}
                    value={profile.address}
                    readOnly={!isEditing}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className={`${inputClass(isEditing)} resize-none`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>VAT / GST ID</label>
                    <input
                      type="text"
                      value={profile.gst || ''}
                      readOnly={!isEditing}
                      onChange={(e) => setProfile({ ...profile, gst: e.target.value })}
                      className={inputClass(isEditing)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Base Currency</label>
                    <select
                      value={profile.currency}
                      disabled={!isEditing}
                      onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                      className={`${inputClass(isEditing)} appearance-none`}
                    >
                       <option value="$">$ — USD</option>
                       <option value="€">€ — EUR</option>
                       <option value="£">£ — GBP</option>
                       <option value="₹">₹ — INR</option>
                       <option value="A$">A$ — AUD</option>
                       <option value="C$">C$ — CAD</option>
                       <option value="CHF">CHF — CHF</option>
                    </select>
                  </div>
                </div>
             </div>
          </div>
        </form>

        {/* Integrations */}
        <section className="bg-white rounded-2xl border border-[#D2D2D7] p-8 shadow-none">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#D2D2D7]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#F5F5F7] rounded-xl flex items-center justify-center">
                <Globe className="text-[#1D1D1F]" size={18} />
              </div>
              <div>
                 <p className="text-base font-semibold text-[#1D1D1F]">Integrations</p>
                 <p className="text-[12px] text-[#6E6E73] mt-0.5">External connections — coming soon</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#F5F5F7] rounded-xl border border-[#D2D2D7] gap-4">
                <div>
                   <p className="font-semibold text-[14px] text-[#1D1D1F]">Supabase Cloud Sync</p>
                   <p className="text-[12px] text-[#6E6E73] mt-0.5">Active — data synced via authenticated session</p>
                </div>
                <button
                  type="button"
                  disabled
                  className="rounded-full bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] px-5 py-2 text-[13px] font-medium cursor-not-allowed select-none opacity-80"
                >
                  Connected
                </button>
             </div>
             <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#F5F5F7] rounded-xl border border-[#D2D2D7] gap-4">
                <div>
                   <p className="font-semibold text-[14px] text-[#1D1D1F]">Clerk Authentication</p>
                   <p className="text-[12px] text-[#6E6E73] mt-0.5">Active — signed in via Clerk</p>
                </div>
                <button
                  type="button"
                  disabled
                  className="rounded-full border border-[#D2D2D7] bg-white text-[#6E6E73] px-5 py-2 text-[13px] font-medium cursor-not-allowed select-none opacity-70"
                >
                  Active
                </button>
             </div>
          </div>
        </section>

        {/* Data & Privacy */}
        <section className="bg-white rounded-2xl border border-[#DC2626]/30 p-8 shadow-none">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#DC2626]/20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#FEF2F2] rounded-xl flex items-center justify-center">
                <Shield className="text-[#DC2626]" size={18} />
              </div>
              <div>
                 <p className="text-base font-semibold text-[#DC2626]">Data & Privacy</p>
                 <p className="text-[12px] text-[#6E6E73] mt-0.5">Control your local storage</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#FEF2F2] rounded-xl border border-[#DC2626]/20 gap-4">
             <div>
                <p className="font-semibold text-[14px] text-[#1D1D1F]">Clear Local Data</p>
                <p className="text-[12px] text-[#6E6E73] mt-0.5">This will delete all locally stored invoice data permanently.</p>
             </div>
             {wipeConfirm ? (
               <div className="flex items-center gap-2">
                 <button
                   type="button"
                   onClick={() => setWipeConfirm(false)}
                   className="rounded-full border border-[#D2D2D7] bg-[#F5F5F7] text-[#1D1D1F] px-5 py-2 text-[13px] font-medium hover:opacity-80 transition-all"
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
                   className="rounded-full bg-[#DC2626] text-white px-5 py-2 text-[13px] font-semibold hover:opacity-80 transition-all"
                 >
                   Yes, Clear Everything
                 </button>
               </div>
             ) : (
               <button
                 type="button"
                 onClick={() => setWipeConfirm(true)}
                 className="rounded-full bg-[#DC2626] text-white px-6 py-2 text-[13px] font-semibold hover:opacity-80 transition-all"
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
