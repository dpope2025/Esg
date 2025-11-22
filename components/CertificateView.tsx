import React, { useRef } from 'react';
import { CertificateData } from '../types';
import { Download, Share2, Award } from 'lucide-react';
import jsPDF from 'jspdf';

interface CertificateViewProps {
  data: CertificateData;
  userName: string;
}

export const CertificateView: React.FC<CertificateViewProps> = ({ data, userName }) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [800, 600]
    });

    // Background
    doc.setFillColor(240, 253, 244); // Emerald-50
    doc.rect(0, 0, 800, 600, 'F');
    
    // Border
    doc.setLineWidth(10);
    doc.setDrawColor(16, 185, 129); // Emerald-500
    doc.rect(20, 20, 760, 560);

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(40);
    doc.setTextColor(6, 78, 59); // Emerald-900
    doc.text(data.certificate_title.toUpperCase(), 400, 120, { align: 'center' });

    // Body Text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(20);
    doc.setTextColor(51, 65, 85); // Slate-700
    const text = data.certificate_text.replace('{{NAME}}', userName);
    doc.text(text, 400, 220, { align: 'center', maxWidth: 600 });

    // Date
    doc.setFontSize(16);
    doc.text(`Issued on: ${new Date().toLocaleDateString()}`, 400, 320, { align: 'center' });

    // Signature Section (Left)
    doc.setLineWidth(1);
    doc.setDrawColor(51, 65, 85);
    doc.line(200, 480, 350, 480); // Line
    doc.setFontSize(14);
    doc.text("Jane Doe", 275, 470, { align: 'center' }); // Fake Signature text for PDF
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text("Program Director", 275, 495, { align: 'center' });

    // Signature Section (Right)
    doc.setLineWidth(1);
    doc.setDrawColor(51, 65, 85);
    doc.line(450, 480, 600, 480); // Line
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("ESG Fundamentals Academy", 525, 495, { align: 'center' });

    doc.save('ESG_Certificate.pdf');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My ESG Certificate',
        text: data.shareable_message,
        url: window.location.href
      }).catch(console.error);
    } else {
      // Fallback for desktop
      navigator.clipboard.writeText(data.shareable_message);
      alert("Message copied to clipboard!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
           <Award className="w-10 h-10 text-yellow-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Congratulations, {userName}!</h2>
        <p className="text-slate-600 mt-2">You have successfully completed the course.</p>
      </div>

      {/* Certificate Preview Card */}
      <div 
        ref={certificateRef}
        className="bg-white border-[10px] border-double border-emerald-100 p-12 text-center shadow-2xl rounded-lg relative overflow-hidden mb-8"
      >
        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500 transform -rotate-45 -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500 transform -rotate-45 translate-x-16 translate-y-16"></div>
        
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-emerald-900 mb-10 tracking-wide uppercase">
          {data.certificate_title}
        </h1>
        
        <div className="text-lg md:text-2xl text-slate-700 italic mb-8 max-w-2xl mx-auto leading-relaxed font-serif">
          {data.certificate_text.replace('{{NAME}}', userName)}
        </div>

        <div className="flex flex-col items-center justify-center space-y-2 mb-16">
            <span className="text-slate-500 uppercase tracking-widest text-xs">Awarded On</span>
            <span className="text-xl font-medium text-slate-900 px-4 pb-1">
                {new Date().toLocaleDateString()}
            </span>
        </div>

        {/* Signatures */}
        <div className="flex justify-between items-end px-12 mt-12">
            <div className="flex flex-col items-center">
                 {/* CSS-based Cursive Signature */}
                 <div className="font-signature text-4xl text-slate-800 mb-2 transform -rotate-3">Jane Doe</div>
                 <div className="w-48 h-px bg-slate-400 mb-2"></div>
                 <p className="text-xs text-slate-500 uppercase tracking-widest">Program Director</p>
            </div>

            <div className="flex flex-col items-center">
                 {/* Stamp Effect */}
                 <div className="w-24 h-24 rounded-full border-4 border-emerald-800 opacity-20 absolute bottom-12 right-20 flex items-center justify-center rotate-12 pointer-events-none">
                    <div className="w-20 h-20 rounded-full border border-emerald-800 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase">Official</span>
                    </div>
                 </div>
                 <div className="font-serif font-bold text-xl text-slate-800 mb-2">ESG Academy</div>
                 <div className="w-48 h-px bg-slate-400 mb-2"></div>
                 <p className="text-xs text-slate-500 uppercase tracking-widest">Issuing Authority</p>
            </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button 
          onClick={handleDownload}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg"
        >
          <Download className="w-5 h-5" />
          <span>Download PDF</span>
        </button>
        <button 
          onClick={handleShare}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg"
        >
          <Share2 className="w-5 h-5" />
          <span>Share Achievement</span>
        </button>
      </div>
    </div>
  );
};