// ─────────────────────────────────────────────
//  AthleteIQ — ExportButton Component
//  Generates and downloads a PDF report of results (i18n enabled)
// ─────────────────────────────────────────────

'use client';

import { useState } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { SponsorRecommendation, AthleteProfile } from '../types';

interface ExportButtonProps {
  results: SponsorRecommendation[];
  athlete: AthleteProfile;
}

export default function ExportButton({ results, athlete }: ExportButtonProps) {
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pageW = 210;
      const margin = 18;
      const contentW = pageW - margin * 2;
      let y = 20;

      // Header
      doc.setFillColor(68, 114, 196);
      doc.rect(0, 0, pageW, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('AthleteIQ', margin, 17);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Sponsor Match Engine — AI-Powered Recommendations', margin, 26);

      doc.setFontSize(9);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin, 34);

      y = 52;

      // Athlete Summary
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Athlete Profile', margin, y);
      y += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(`Name: ${athlete.name}   |   Sport: ${athlete.sport}   |   Stage: ${athlete.careerStage}   |   Base: ${athlete.geographicBase}`, margin, y);
      y += 5;
      doc.text(`Platform: ${athlete.primaryPlatform}   |   Followers: ${athlete.followerCount.toLocaleString()}`, margin, y);
      y += 10;

      // Divider
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageW - margin, y);
      y += 8;

      // Recommendations
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(`Sponsor Recommendations (${results.length})`, margin, y);
      y += 10;

      for (const rec of results) {
        if (y > 255) {
          doc.addPage();
          y = 20;
        }

        const cardH = 54;
        doc.setFillColor(248, 250, 255);
        doc.roundedRect(margin, y - 4, contentW, cardH, 3, 3, 'F');
        doc.setDrawColor(200, 210, 240);
        doc.roundedRect(margin, y - 4, contentW, cardH, 3, 3, 'S');

        doc.setFillColor(68, 114, 196);
        doc.circle(margin + 5, y + 4, 4, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(String(rec.rank), margin + 5, y + 5.5, { align: 'center' });

        doc.setTextColor(20, 40, 100);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(rec.brandName, margin + 13, y + 5);

        doc.setTextColor(100, 100, 130);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`${rec.brandCategory}  •  ${rec.dealType}`, margin + 13, y + 11);

        const scoreColor = rec.matchScore >= 80 ? [46, 139, 87] : rec.matchScore >= 60 ? [180, 100, 20] : [120, 120, 120];
        doc.setTextColor(...(scoreColor as [number, number, number]));
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`${rec.matchScore}`, pageW - margin - 5, y + 6, { align: 'right' });
        doc.setFontSize(7);
        doc.text('MATCH', pageW - margin - 5, y + 11, { align: 'right' });

        doc.setTextColor(60, 60, 60);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const reasonLines = doc.splitTextToSize(rec.reasoning, contentW - 10);
        doc.text(reasonLines.slice(0, 2), margin + 3, y + 19);

        doc.setFont('helvetica', 'bolditalic');
        doc.setTextColor(68, 114, 196);
        doc.setFontSize(8);
        const pitchLines = doc.splitTextToSize(`→ ${rec.pitchAngle}`, contentW - 10);
        doc.text(pitchLines.slice(0, 2), margin + 3, y + 33);

        y += cardH + 5;
      }

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setTextColor(160, 160, 160);
        doc.setFontSize(7);
        doc.text(
          `AthleteIQ Sponsor Match Report  |  Page ${i} of ${totalPages}`,
          pageW / 2,
          290,
          { align: 'center' }
        );
      }

      doc.save(`AthleteIQ_${athlete.name.replace(/\s+/g, '_')}_Sponsors.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={exporting}
      className="w-full flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50"
    >
      {exporting ? (
        <>
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          {t('results.generatingPdf')}
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3" />
          </svg>
          {t('results.downloadPdf')}
        </>
      )}
    </button>
  );
}