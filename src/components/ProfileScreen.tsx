import React, { useState } from 'react';
import { User, Gender } from '../types';
import { api } from '../services/api';
import { User as UserIcon, Mail, Shield, LogOut, Edit3, Check, X, ShieldAlert, Sparkles, Smartphone } from 'lucide-react';

interface ProfileScreenProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
  onOpenAndroidCode: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onUpdateUser,
  onLogout,
  onOpenAndroidCode
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user.fullName);
  const [bio, setBio] = useState(user.bio || '');
  const [gender, setGender] = useState<Gender>(user.gender);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);
    try {
      const res = await api.updateProfile({
        userId: user.id,
        fullName,
        bio,
        gender
      });
      onUpdateUser(res.user);
      setIsEditing(false);
      setStatusMsg('Profile successfully updated.');
    } catch (err: any) {
      setStatusMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Profile Header Card */}
      <div className="p-6 rounded-2xl bg-[#111116] border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#ff2a5f]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#ff2a5f] to-[#ec4899] p-0.5 shadow-xl shadow-[#ff2a5f]/20 shrink-0">
            <div className="w-full h-full rounded-[14px] bg-[#14141c] flex items-center justify-center text-2xl font-black text-white font-display">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-white font-display flex items-center justify-center sm:justify-start gap-2">
                  <span>{user.fullName}</span>
                  {user.role === 'admin' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-500/20 text-[#ff7597] border border-pink-500/30">
                      Admin
                    </span>
                  )}
                </h2>
                <p className="text-xs text-[#ff7597] font-medium">@{user.username}</p>
              </div>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 border border-white/10 flex items-center justify-center gap-1.5 transition-colors self-center sm:self-auto"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-400 border border-white/10 flex items-center justify-center gap-1.5 transition-colors self-center sm:self-auto"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              )}
            </div>

            {user.bio ? (
              <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">{user.bio}</p>
            ) : (
              <p className="text-xs text-slate-500 mt-2 italic">No bio added yet.</p>
            )}

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 pt-4 border-t border-white/5 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                <span className="capitalize">{user.gender.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-[#ff2a5f]/15 border border-[#ff2a5f]/30 rounded-xl text-xs text-pink-300">
          {statusMsg}
        </div>
      )}

      {/* Edit Form */}
      {isEditing && (
        <form onSubmit={handleSave} className="p-6 rounded-2xl bg-[#111116] border border-[#ff2a5f]/30 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">Update Information</h3>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-[#181822] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#ff2a5f]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Bio / About Me</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              placeholder="A few words about you..."
              className="w-full bg-[#181822] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#ff2a5f]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Gender</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'male', label: 'Male' },
                { key: 'female', label: 'Female' },
                { key: 'other', label: 'Other' }
              ].map((g) => (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => setGender(g.key as Gender)}
                  className={`py-2 px-3 text-xs rounded-lg border text-center transition-colors ${
                    gender === g.key
                      ? 'border-[#ff2a5f] bg-[#ff2a5f]/15 text-white shadow-sm'
                      : 'border-white/10 bg-[#181822] text-slate-400'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#ff2a5f] to-[#e11d48] text-white text-xs font-bold hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      )}

      {/* Safety & Developer Actions */}
      <div className="p-6 rounded-2xl bg-[#111116] border border-white/10 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white font-display">Account & Settings</h3>

        <div className="space-y-3">
          <button
            onClick={onOpenAndroidCode}
            className="w-full p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-[#ff2a5f]">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white group-hover:text-[#ff7597] transition-colors">
                  Android Studio Source Code Hub
                </h4>
                <p className="text-[11px] text-slate-400">View Java classes, XML layouts, Gradle, and download .zip</p>
              </div>
            </div>
            <span className="text-xs text-slate-500">View &rarr;</span>
          </button>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-left flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Community Safety Standards</h4>
                <p className="text-[11px] text-slate-400">P2P encrypted video, reporting, block list protection</p>
              </div>
            </div>
            <span className="text-xs text-emerald-400 font-semibold">Active</span>
          </div>
        </div>

        {/* Logout */}
        <div className="pt-4 border-t border-white/5">
          <button
            onClick={onLogout}
            className="w-full py-3 rounded-xl bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-xs font-bold text-red-400 flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out of VIBE TV
          </button>
        </div>
      </div>
    </div>
  );
};
