import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Share2, Download, FileText, MessageSquare, Check, X } from 'lucide-react';
import { formatBRL } from '../../lib/formatters';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetElementId?: string;
  reportTitle?: string;
  summaryData?: {
    periodoLabel: string;
    totalEntradas: number;
    totalSaidas: number;
    saldo: number;
    margemPct: number;
    topGastos?: { origem: string; valor: number }[];
  };
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  targetElementId = 'dashboard-exportable-content',
  reportTitle = 'Doces da Luana · Relatório Financeiro',
  summaryData,
}) => {
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Export as PNG (High Resolution scale 2)
  const handleExportPNG = async () => {
    try {
      setLoading(true);
      const element = document.getElementById(targetElementId);
      if (!element) {
        showToast('Elemento para captura não encontrado.');
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#000000' : '#F2F2F7',
        logging: false,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `doces-da-luana-${Date.now()}.png`;
      link.href = image;
      link.click();

      showToast('Imagem PNG baixada com sucesso! ✨');
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Erro ao gerar PNG. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Export as PDF
  const handleExportPDF = async () => {
    try {
      setLoading(true);
      const element = document.getElementById(targetElementId);
      if (!element) {
        showToast('Elemento para captura não encontrado.');
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`relatorio-doces-da-luana-${Date.now()}.pdf`);

      showToast('Relatório PDF exportado com sucesso! 📄');
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Erro ao gerar PDF.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Share to WhatsApp (Web Share API with file or fallback link)
  const handleShareWhatsApp = async () => {
    try {
      setLoading(true);

      const period = summaryData?.periodoLabel || 'Atual';
      const entradas = summaryData ? formatBRL(summaryData.totalEntradas) : 'R$ 0,00';
      const saidas = summaryData ? formatBRL(summaryData.totalSaidas) : 'R$ 0,00';
      const saldo = summaryData ? formatBRL(summaryData.saldo) : 'R$ 0,00';
      const margem = summaryData ? `${summaryData.margemPct.toFixed(1)}%` : '0%';

      let topGastosTxt = '';
      if (summaryData?.topGastos && summaryData.topGastos.length > 0) {
        topGastosTxt = '\n*Onde mais gastei:*\n' + summaryData.topGastos.slice(0, 3).map((g, i) => `${i+1}. ${g.origem}: ${formatBRL(g.valor)}`).join('\n');
      }

      const whatsappText = `🍰 *DOCES DA LUANA · Resumo Financeiro*\n📅 *Período:* ${period}\n\n🟢 *Entradas:* ${entradas}\n🔴 *Saídas:* ${saidas}\n💰 *Saldo:* ${saldo}\n📈 *Margem de Lucro:* ${margem}${topGastosTxt}\n\n_Gerado pelo App Doces da Luana_ ✨`;

      // Try Web Share API with image file if supported
      const element = document.getElementById(targetElementId);
      if (element && navigator.canShare) {
        try {
          const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#FFFFFF' });
          const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));

          if (blob) {
            const file = new File([blob], 'resumo-doces-da-luana.png', { type: 'image/png' });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: reportTitle,
                text: whatsappText,
                files: [file],
              });
              showToast('Compartilhado com sucesso!');
              onClose();
              return;
            }
          }
        } catch {
          // If file share fails or is cancelled, fallback below
        }
      }

      // WhatsApp Fallback via URL
      const encoded = encodeURIComponent(whatsappText);
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
      showToast('Resumo enviado para o WhatsApp!');
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Erro ao compartilhar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        <div className="relative w-full max-w-sm bg-white dark:bg-[#1C1C1E] rounded-t-[26px] sm:rounded-[26px] shadow-2xl p-6 z-10 space-y-4 pb-safe animate-in slide-in-from-bottom duration-200 border border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Compartilhar Relatório
              </h3>
              <p className="text-xs text-neutral-400">
                Exporte os dados ou envie direto para o WhatsApp
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-full"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-2.5">
            {/* WhatsApp */}
            <button
              onClick={handleShareWhatsApp}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm flex items-center justify-between shadow-sm ios-active transition-all"
            >
              <div className="flex items-center gap-3">
                <MessageSquare size={18} />
                <span>Enviar no WhatsApp</span>
              </div>
              <span className="text-xs bg-emerald-600/60 px-2 py-0.5 rounded-full">
                Texto + Foto
              </span>
            </button>

            {/* PNG Image */}
            <button
              onClick={handleExportPNG}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-medium text-sm flex items-center justify-between ios-active transition-all"
            >
              <div className="flex items-center gap-3">
                <Download size={18} className="text-blue-500" />
                <span>Baixar Imagem (PNG)</span>
              </div>
              <span className="text-xs text-neutral-400">Alta Resolução</span>
            </button>

            {/* PDF Report */}
            <button
              onClick={handleExportPDF}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-medium text-sm flex items-center justify-between ios-active transition-all"
            >
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-rose-500" />
                <span>Baixar Relatório (PDF)</span>
              </div>
              <span className="text-xs text-neutral-400">Padrão A4</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-60 bg-neutral-900/90 text-white px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
          <Check size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
};

