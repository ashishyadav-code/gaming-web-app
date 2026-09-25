import React from 'react';
import { X, Shield, User, LogOut, RefreshCw, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ASSETS } from '../utils/assets';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export const AccountModal: React.FC<Props> = ({ isOpen, onClose, onOpenLogin }) => {
  const { user, isIGL, isMaster, logoutUser } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in-smooth">
      <div className="bg-white rounded-[32px] p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-left relative overflow-hidden animate-slide-up-smooth">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block leading-none">
                Player Account
              </span>
              <h2 className="text-base font-black text-slate-900 leading-tight">
                Profile & Access
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="my-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-slate-100 flex-shrink-0">
            <img
              src={ASSETS.avatars.ash}
              alt={user?.name || 'User'}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black text-slate-900 truncate">
                {user?.userId || 'ASHISH'}
              </h3>
              {isMaster && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-700 border border-amber-200">
                  MASTER IGL
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate">
              {user?.email || 'ashish@teamsarkar.com'}
            </p>
            <div className="text-[10px] font-bold text-blue-600 mt-0.5">
              Role: {isIGL ? 'IGL (Full Admin Access)' : 'Player (View Only)'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mb-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenLogin();
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Switch Player / Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              logoutUser();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs border border-rose-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        {/* Footer with App Version */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-bold">
          <span>Team Sarkar FF Companion</span>
          <span className="bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 font-extrabold text-[10px]">
            v2.0
          </span>
        </div>
      </div>
    </div>
  );
};
