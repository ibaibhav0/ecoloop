'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Calendar, Printer, ShieldCheck, KeyRound } from 'lucide-react';
import { formatHostel } from '@/lib/formatHostel';

export default function QrDisplayModal({ item, isOpen, onClose, onSchedule }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !item) return null;

  const otpCode = item.otp || '7492';

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(otpCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>EcoLoop Handover Pass - ${item.trackingCode}</title>
          <style>
            body { font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #ffffff; color: #000000; }
            .card { border: 2px solid #000000; padding: 28px; text-align: center; max-width: 360px; }
            h2 { margin: 8px 0 4px; font-weight: bold; letter-spacing: 2px; }
            .otp-box { display: flex; justify-content: center; gap: 8px; margin: 20px 0; }
            .digit { width: 50px; height: 60px; border: 2px solid #000; font-size: 32px; font-weight: bold; line-height: 60px; }
            .code { font-family: monospace; font-size: 14px; font-weight: bold; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 0; margin: 8px 0 16px; }
            p { margin: 4px 0; font-size: 12px; }
            .instruction { font-size: 11px; margin-top: 16px; border: 1px dashed #000; padding: 8px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>NITTE DEEMED TO BE UNIVERSITY</h2>
            <div style="font-size: 11px; letter-spacing: 1px;">ECOLOOP E-WASTE HANDOVER PASS</div>
            <div class="code">${item.trackingCode}</div>
            
            <div style="font-size: 10px; text-transform: uppercase; font-weight: bold;">4-DIGIT VERIFICATION HANDOVER OTP:</div>
            <div class="otp-box">
              ${otpCode.split('').map(d => `<div class="digit">${d}</div>`).join('')}
            </div>

            <p><strong>ITEM:</strong> ${item.type}</p>
            <p><strong>DECLARED MASS:</strong> ${item.approxWeight} KG</p>
            <p><strong>BRANCH:</strong> ${item.userBranch || 'Computer Science & Engineering'}</p>
            <p><strong>STATION:</strong> ${formatHostel(item.userHostel)}</p>

            <div class="instruction">
              <strong>PHYSICAL HANDOVER INSTRUCTION:</strong><br/>
              Present this 4-digit OTP to the campus collection team on pickup. The collector will verify this code to accept the item and issue your food court voucher.
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#0a0a0a] border border-[#3a3a3f] max-w-md w-full overflow-hidden text-center max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-[#3a3a3f] p-4 sm:p-5 relative bg-[#000000] shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#5a5a5f] hover:text-[#ffffff] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="spacex-caption">// SECURE HANDOVER VERIFICATION</div>
          <h2 className="font-['D-DIN-Bold'] text-xl text-[#ffffff] uppercase tracking-wider mt-1 flex items-center justify-center gap-2">
            <KeyRound className="w-5 h-5 text-[#ffffff]" />
            COLLECTION HANDOVER OTP
          </h2>
        </div>

        <div className="p-4 sm:p-6 flex flex-col items-center overflow-y-auto flex-1">
          {/* Tracking Code Chip */}
          <div className="px-3 py-1 bg-[#000000] text-[#ffffff] font-mono text-xs font-bold mb-4 border border-[#3a3a3f] tracking-widest">
            {item.trackingCode}
          </div>

          {/* 4-Digit OTP Hero Block */}
          <div className="w-full bg-[#000000] border-2 border-[#ffffff] p-6 mb-4 relative overflow-hidden">
            <div className="spacex-caption text-xs text-[#a1a1aa] mb-2 font-bold">
              // 4-DIGIT VERIFICATION CODE
            </div>

            <div className="flex items-center justify-center gap-3 my-3">
              {otpCode.split('').map((digit, i) => (
                <div
                  key={i}
                  className="w-14 h-16 bg-[#0a0a0c] border-2 border-[#ffffff] flex items-center justify-center font-mono text-3xl font-black text-[#ffffff] shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                >
                  {digit}
                </div>
              ))}
            </div>

            <button
              onClick={handleCopyOtp}
              className="mt-2 text-xs font-mono px-3 py-1.5 border border-[#3a3a3f] hover:border-[#ffffff] text-[#f0f0fa] hover:text-[#ffffff] bg-[#0a0a0a] inline-flex items-center gap-2 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'OTP COPIED!' : 'COPY 4-DIGIT OTP'}</span>
            </button>
          </div>

          {/* Handover Instruction Banner */}
          <div className="p-3 bg-[#ffffff]/5 border border-[#ffffff]/20 text-left text-xs mb-5 space-y-1">
            <div className="flex items-center gap-2 text-[#ffffff] font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>PHYSICAL HANDOVER PROTOCOL</span>
            </div>
            <p className="font-mono text-[#a1a1aa] text-[11px] leading-relaxed">
              When the campus collection team arrives, share this <strong>4-digit OTP</strong>. The officer will input this code into their terminal to confirm handover, record weight, and grant your <strong>instant food court meal voucher</strong>.
            </p>
          </div>

          {/* Details Manifest */}
          <div className="w-full bg-[#000000] p-4 border border-[#3a3a3f] text-left text-xs space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="spacex-caption">CATEGORY:</span>
              <span className="font-mono text-[#ffffff] uppercase">{item.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="spacex-caption">APPROX MASS:</span>
              <span className="font-mono text-[#ffffff]">{item.approxWeight} KG</span>
            </div>
            <div className="flex justify-between">
              <span className="spacex-caption">BRANCH / DEPT:</span>
              <span className="font-mono text-[#ffffff]">{item.userBranch || 'CSE'}</span>
            </div>
            <div className="flex justify-between">
              <span className="spacex-caption">COLLECTION POINT:</span>
              <span className="font-mono text-[#ffffff] uppercase">{formatHostel(item.userHostel)}</span>
            </div>
            <div className="flex justify-between">
              <span className="spacex-caption">STATUS:</span>
              <span className="font-mono text-[#ffffff] uppercase">[{item.status?.replace('_', ' ')}]</span>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full space-y-3">
            {item.status === 'registered' && onSchedule && (
              <button
                onClick={() => {
                  onSchedule(item);
                  onClose();
                }}
                className="w-full btn-spacex py-3"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>SCHEDULE PICKUP SLOT NOW</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="w-full btn-spacex btn-spacex-muted py-2.5 px-3 text-xs flex items-center justify-center gap-2"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT HANDOVER PASS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
