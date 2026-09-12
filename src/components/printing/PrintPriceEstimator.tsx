import React, { useState } from 'react';
import { PrintJobConfig } from '../../types';
import { formatTSh } from '../../utils/formatters';
import { Button } from '../common/Button';
import { Printer, FileText, Sparkles, Check, HelpCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface PrintPriceEstimatorProps {
  onProceedToOrder?: (config: PrintJobConfig, estimatedTotal: number) => void;
}

export const PrintPriceEstimator: React.FC<PrintPriceEstimatorProps> = ({
  onProceedToOrder
}) => {
  const { openModal } = useApp();

  const [config, setConfig] = useState<PrintJobConfig>({
    printType: 'bw',
    paperSize: 'A4',
    paperWeight: '80gsm Standard',
    sided: 'double',
    binding: 'none',
    lamination: 'none',
    pageCount: 15,
    copies: 1
  });

  // Calculate realistic estimation
  const calculateTotal = (): number => {
    let perPage = config.printType === 'bw' ? 100 : 500;
    if (config.paperSize === 'A3') perPage *= 2;
    if (config.paperWeight === '100gsm Smooth') perPage += 50;
    if (config.paperWeight === '120gsm Heavy') perPage += 100;
    if (config.paperWeight === 'Glossy Photo Paper') perPage = config.printType === 'bw' ? 800 : 1500;

    let bindingCost = 0;
    if (config.binding === 'staple') bindingCost = 200;
    if (config.binding === 'spiral') bindingCost = 3000;
    if (config.binding === 'tape') bindingCost = 2500;
    if (config.binding === 'hardcover') bindingCost = 25000;

    let laminationCost = 0;
    if (config.lamination === 'gloss' || config.lamination === 'matte') {
      laminationCost = config.paperSize === 'A3' ? 2000 : 1000;
    }

    const pagesTotal = config.pageCount * perPage;
    const documentTotal = (pagesTotal + bindingCost + laminationCost) * config.copies;

    return documentTotal;
  };

  const estimatedTotal = calculateTotal();

  const handleLaunchOrder = () => {
    if (onProceedToOrder) {
      onProceedToOrder(config, estimatedTotal);
    } else {
      openModal({ type: 'print-wizard' });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
      <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
            Kikokotoo cha Haraka
          </span>
          <h3 className="text-lg font-bold text-white mt-0.5">
            Kadiria Gharama ya Kuchapa na Kutoa Nakala za Nyaraka
          </h3>
        </div>
        <div className="p-2.5 bg-slate-800 rounded-xl text-amber-400">
          <Printer className="w-6 h-6" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Print Type: B&W vs Color */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            1. Aina ya Rangi ya Chapa
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setConfig({ ...config, printType: 'bw' })}
              className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                config.printType === 'bw'
                  ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <span className="font-bold text-xs text-slate-900 block">
                  Nyeusi na Nyeupe (B&W)
                </span>
                <span className="text-[11px] text-slate-500">Kuanzia TSh 100 / ukurasa</span>
              </div>
              {config.printType === 'bw' && <Check className="w-4 h-4 text-amber-600" />}
            </button>

            <button
              type="button"
              onClick={() => setConfig({ ...config, printType: 'color' })}
              className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                config.printType === 'color'
                  ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <span className="font-bold text-xs text-slate-900 block">
                  Rangi Kamili (Color Print)
                </span>
                <span className="text-[11px] text-slate-500">Kuanzia TSh 500 / ukurasa</span>
              </div>
              {config.printType === 'color' && <Check className="w-4 h-4 text-amber-600" />}
            </button>
          </div>
        </div>

        {/* Paper Size & Weight */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Ukubwa wa Karatasi
            </label>
            <select
              value={config.paperSize}
              onChange={e => setConfig({ ...config, paperSize: e.target.value as any })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-amber-500"
            >
              <option value="A4">A4 (Kawaida ya Nyaraka - 210 x 297 mm)</option>
              <option value="A3">A3 (Karatasi Kubwa / Mabango - 297 x 420 mm)</option>
              <option value="A5">A5 (Kijitabu / Vipeperushi - 148 x 210 mm)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Aina ya Karatasi / Unene
            </label>
            <select
              value={config.paperWeight}
              onChange={e => setConfig({ ...config, paperWeight: e.target.value as any })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-amber-500"
            >
              <option value="80gsm Standard">Karatasi ya Kawaida ya Double A (80 GSM)</option>
              <option value="100gsm Smooth">Karatasi Nyepesi ya Ripoti (100 GSM, +TSh 50/uk)</option>
              <option value="120gsm Heavy">Karatasi Nene ya Jalada (120 GSM, +TSh 100/uk)</option>
              <option value="Glossy Photo Paper">Karatasi ya Picha Inayong'aa (Glossy Photo Paper)</option>
            </select>
          </div>
        </div>

        {/* Page Count & Number of Copies */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Idadi ya Kurasa za Faili
            </label>
            <input
              type="number"
              min="1"
              max="5000"
              value={config.pageCount}
              onChange={e => setConfig({ ...config, pageCount: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-amber-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Idadi ya Nakala (Seti)
            </label>
            <input
              type="number"
              min="1"
              max="500"
              value={config.copies}
              onChange={e => setConfig({ ...config, copies: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-amber-500 font-semibold"
            />
          </div>
        </div>

        {/* Binding & Finishing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Aina ya Kufunga / Jalada
            </label>
            <select
              value={config.binding}
              onChange={e => setConfig({ ...config, binding: e.target.value as any })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-amber-500"
            >
              <option value="none">Bila Kufunga (Karatasi Zilizopangwa Tu)</option>
              <option value="staple">Kupiga Pini (Stapler ya Pembeni, +TSh 200)</option>
              <option value="spiral">Kufunga kwa Spiral (Ring Binding na Jalada la Plastiki, +TSh 3,000)</option>
              <option value="tape">Kufunga kwa Tape ya Vitabu (Tape Binding, +TSh 2,500)</option>
              <option value="hardcover">Hardcover ya Thesis yenye Maandishi ya Dhahabu (+TSh 25,000)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Kuweka Lamination ya Kinga
            </label>
            <select
              value={config.lamination}
              onChange={e => setConfig({ ...config, lamination: e.target.value as any })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-amber-500"
            >
              <option value="none">Bila Lamination</option>
              <option value="gloss">Lamination Inayong'aa (Gloss Pouch, +TSh 1,000/karatasi)</option>
              <option value="matte">Lamination Isiyong'aa (Matte, +TSh 1,200/karatasi)</option>
            </select>
          </div>
        </div>

        {/* Estimated Price Result Bar */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 block">
              Makadirio ya Bei (Inathibitishwa na faili)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-950">
                {formatTSh(estimatedTotal)}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                ({config.pageCount} kurasa × nakala {config.copies})
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleLaunchOrder}
            icon={<Printer className="w-4 h-4" />}
          >
            Pakia Faili & Tuma Kazi ya Chapa
          </Button>
        </div>
      </div>
    </div>
  );
};
