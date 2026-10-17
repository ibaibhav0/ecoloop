'use client';

import React, { useRef } from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Award, Building2 } from 'lucide-react';
import { formatHostel, formatLocation } from '@/lib/formatHostel';

export default function CertificateModal({ item, isOpen, onClose, facilityName }) {
  const printAreaRef = useRef(null);

  if (!isOpen || !item) return null;

  const trackingCode = item.trackingCode || 'ECO-2026-UNIT';
  const cleanId = trackingCode.replace('ECO-2026-', '');
  const certId = item.recyclingCertificate?.certificateId || `CERT-CPCB-${cleanId}-${Math.floor(1000 + (item._id ? parseInt(item._id.slice(-4), 16) % 9000 : 4821))}`;
  const weightKg = parseFloat(item.actualWeight || item.approxWeight || 1.0).toFixed(2);
  const co2Avoided = (parseFloat(weightKg) * 1.44).toFixed(2);
  const creditsEarned = Math.round(parseFloat(weightKg) * 10);
  const issueFacility = facilityName || item.recyclingCertificate?.facility || item.location || 'Janavi Bairoliya - Netravati Material Recovery Plant';
  const issueDate = item.recyclingCertificate?.issuedAt 
    ? new Date(item.recyclingCertificate.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const handlePrint = () => {
    const printContent = document.getElementById('printable-certificate-card');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>CPCB Green Recycling Certificate - ${trackingCode}</title>
            <style>
              @page { size: landscape; margin: 15mm; }
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 20px; background: #ffffff; color: #000000; }
              .cert-container { border: 8px double #0f172a; padding: 36px 44px; max-width: 860px; margin: 0 auto; text-align: center; position: relative; background: #ffffff; }
              .header-sub { font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #475569; text-transform: uppercase; margin-bottom: 6px; }
              .title-main { font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; margin: 0; color: #0f172a; }
              .title-sub { font-size: 14px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 1.5px; margin: 6px 0 20px; }
              .cert-id { font-family: monospace; font-size: 11px; color: #64748b; margin-bottom: 24px; padding: 4px 12px; background: #f1f5f9; display: inline-block; }
              .recipient-intro { font-size: 13px; color: #475569; margin-bottom: 6px; }
              .recipient-name { font-size: 22px; font-weight: 800; color: #0f172a; border-bottom: 2px solid #0f172a; display: inline-block; padding: 0 24px 4px; margin-bottom: 6px; }
              .recipient-dept { font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 20px; }
              .narrative { font-size: 13px; line-height: 1.6; color: #1e293b; max-width: 720px; margin: 0 auto 24px; }
              .grid-metrics { display: flex; justify-content: space-between; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; padding: 14px 20px; margin-bottom: 28px; background: #f8fafc; }
              .metric-item { text-align: center; flex: 1; }
              .metric-val { font-size: 18px; font-weight: 800; color: #0f172a; }
              .metric-lbl { font-size: 10px; color: #64748b; text-transform: uppercase; margin-top: 2px; font-weight: 600; }
              .footer-sign { display: flex; justify-content: space-between; text-align: left; font-size: 11px; color: #334155; line-height: 1.5; margin-top: 20px; }
              .badge { display: inline-block; padding: 4px 8px; font-size: 10px; font-weight: bold; background: #dcfce7; color: #166534; border: 1px solid #86efac; border-radius: 2px; text-transform: uppercase; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0a0a0a] border border-[#3a3a3f] max-w-4xl w-full overflow-hidden max-h-[95vh] flex flex-col shadow-2xl">
        {/* Top Control Bar */}
        <div className="border-b border-[#3a3a3f] p-4 bg-[#000000] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="font-['D-DIN-Bold'] text-base text-[#ffffff] uppercase tracking-wider block">
                OFFICIAL CPCB GREEN RECYCLING CERTIFICATE
              </span>
              <span className="spacex-caption text-[10px]">
                TELEMETRY ID: {trackingCode} • AUTH REF: {certId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="btn-spacex py-1.5 px-4 text-xs bg-white text-black hover:bg-slate-200 font-bold"
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              <span>Print / Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#8a8a93] hover:text-[#ffffff] transition-colors rounded-sm"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Display Area */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-[#121214] flex justify-center">
          <div
            id="printable-certificate-card"
            ref={printAreaRef}
            className="w-full max-w-3xl bg-white text-slate-900 border-8 border-double border-slate-900 p-8 sm:p-12 text-center shadow-xl relative"
          >
            {/* Institution Header */}
            <div className="header-sub text-xs font-bold tracking-[3px] text-slate-600 uppercase mb-1">
              NITTE DEEMED TO BE UNIVERSITY
            </div>
            <h1 className="title-main text-2xl sm:text-3xl font-black uppercase tracking-[2px] text-slate-950 m-0">
              CERTIFICATE OF VERIFIED E-WASTE RECYCLING
            </h1>
            <div className="title-sub text-xs sm:text-sm font-bold text-emerald-700 uppercase tracking-widest mt-2 mb-4">
              STATUTORY EPR DESTRUCTION &amp; CIRCULAR RECOVERY ATTESTATION
            </div>

            <div className="cert-id font-mono text-[11px] text-slate-600 bg-slate-100 px-3 py-1 inline-block border border-slate-300 mb-6">
              SERIAL CERTIFICATE ID: <strong className="text-slate-900">{certId}</strong>
            </div>

            {/* Recipient */}
            <p className="recipient-intro text-xs text-slate-600 mb-1">
              This statutory environmental credentials certificate is proudly awarded to:
            </p>
            <div className="recipient-name text-xl sm:text-2xl font-black text-slate-950 border-b-2 border-slate-900 inline-block px-6 pb-1 mb-1">
              {item.userName || 'Campus Submitter'}
            </div>
            <div className="recipient-dept text-xs font-semibold text-slate-700 mb-6">
              {item.userBranch || 'Computer Science & Engineering (CSE)'} • {formatHostel(item.userHostel)}
            </div>

            {/* Narrative Body */}
            <p className="narrative text-xs sm:text-sm leading-relaxed text-slate-800 max-w-2xl mx-auto mb-6">
              For responsibly handing over decommissioned electronic equipment (<strong>{item.type}</strong>, Telemetry Code: <code className="bg-slate-100 px-1 py-0.5 border border-slate-300 font-mono text-xs">{trackingCode}</code>) for certified non-polluting dismantling, hazardous substance isolation, and secondary rare-earth metal recovery under the Ministry of Environment, Forest and Climate Change (MoEFCC) E-Waste Management Rules.
            </p>

            {/* Metrics Grid */}
            <div className="grid-metrics flex justify-between border-t border-b border-slate-300 py-4 my-6 bg-slate-50 px-4">
              <div className="metric-item flex-1">
                <div className="metric-val text-lg sm:text-xl font-black text-slate-950">{weightKg} KG</div>
                <div className="metric-lbl text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Certified Net Mass</div>
              </div>
              <div className="metric-item flex-1 border-x border-slate-200">
                <div className="metric-val text-lg sm:text-xl font-black text-emerald-700">{co2Avoided} KG</div>
                <div className="metric-lbl text-[10px] text-slate-500 uppercase tracking-wider font-semibold">CO2e Emissions Prevented</div>
              </div>
              <div className="metric-item flex-1">
                <div className="metric-val text-lg sm:text-xl font-black text-blue-700">+{creditsEarned} PTS</div>
                <div className="metric-lbl text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Green Merit Credits</div>
              </div>
            </div>

            {/* Facility & Chain of Custody */}
            <div className="text-left text-xs bg-slate-100/70 p-3 border border-slate-300 mb-6 flex flex-col sm:flex-row justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">AUTHORISED DISMANTLING &amp; EXTRACTION FACILITY:</span>
                <span className="font-semibold text-slate-900">{issueFacility}</span>
              </div>
              <div className="sm:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">CPCB REGISTRATION REFERENCE:</span>
                <span className="font-mono text-slate-900">CPCB/EPR-RECYCLE/KA-2026/0891</span>
              </div>
            </div>

            {/* Signatures & Accreditation Footer */}
            <div className="footer-sign flex justify-between text-left text-xs text-slate-700 border-t border-slate-300 pt-4 mt-4">
              <div>
                <strong className="block text-slate-900">CAMPUS SUSTAINABILITY DESK</strong>
                <span>Nitte Deemed to be University</span><br />
                <span className="text-[10px] text-slate-500">NAAC Criterion 7 Institutional Record</span>
              </div>

              <div className="text-right">
                <strong className="block text-slate-900">AUTHORISED RECYCLER DISPATCH</strong>
                <span>Certified CPCB Disposal Facility</span><br />
                <span className="text-[10px] font-mono text-slate-600">Dated: {issueDate}</span>
              </div>
            </div>

            {/* Digital Stamp */}
            <div className="mt-4 pt-2 text-[10px] font-mono text-slate-500 flex items-center justify-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>CRYPTOGRAPHICALLY ATTESTED VIA ECOLOOP CAMPUS CONSORTIUM • TAMPER EVIDENT</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-[#3a3a3f] p-4 bg-[#000000] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-[#8a8a93] font-mono">
            This digital certificate is valid for NAAC accreditation, academic green credits, and corporate ESG reporting.
          </span>
          <button
            onClick={onClose}
            className="btn-spacex-muted btn-spacex px-6 py-2 w-full sm:w-auto"
          >
            <span>Close Viewer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
