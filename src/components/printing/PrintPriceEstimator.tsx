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
            Self-Service Calculator
          </span>
          <h3 className="text-lg font-bold text-white mt-0.5">
            Document Print & Copy Cost Estimator
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
            1. Print Color Mode
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
                  Black & White (Monochrome)
                </span>
                <span className="text-[11px] text-slate-500">From TSh 100 / page</span>
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
                  Full High-Gloss Color
                </span>
                <span className="text-[11px] text-slate-500">From TSh 500 / page</span>
              </div>
              {config.printType === 'color' && <Check className="w-4 h-4 text-amber-600" />}
            </button>
          </div>
        </div>

        {/* Paper Size & Weight */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Paper Size
            </label>
            <select
              value={config.paperSize}
              onChange={e => setConfig({ ...config, paperSize: e.target.value as any })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-amber-500"
            >
              <option value="A4">A4 (Standard Document - 210 x 297 mm)</option>
              <option value="A3">A3 (Large Ledger / Posters - 297 x 420 mm)</option>
              <option value="A5">A5 (Booklet / Small Flyer - 148 x 210 mm)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Paper Type / Thickness
            </label>
            <select
              value={config.paperWeight}
              onChange={e => setConfig({ ...config, paperWeight: e.target.value as any })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-amber-500"
            >
              <option value="80gsm Standard">80 GSM Standard Double A Paper</option>
              <option value="100gsm Smooth">100 GSM Smooth Presentation Paper (+TSh 50/pg)</option>
              <option value="120gsm Heavy">120 GSM Heavy Cardstock (+TSh 100/pg)</option>
              <option value="Glossy Photo Paper">Glossy Photographic Paper</option>
            </select>
          </div>
        </div>

        {/* Page Count & Number of Copies */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Total Document Pages
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
              Number of Sets / Copies
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
              Binding Option
            </label>
            <select
              value={config.binding}
              onChange={e => setConfig({ ...config, binding: e.target.value as any })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-amber-500"
            >
              <option value="none">No Binding (Loose Collated Sheets)</option>
              <option value="staple">Corner / Side Stapling (+TSh 200)</option>
              <option value="spiral">Spiral Ring Binding with Clear Cover (+TSh 3,000)</option>
              <option value="tape">Thermal Cloth Tape Binding (+TSh 2,500)</option>
              <option value="hardcover">Gold-Lettered Thesis Hardcover (+TSh 25,000)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Protective Lamination
            </label>
            <select
              value={config.lamination}
              onChange={e => setConfig({ ...config, lamination: e.target.value as any })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-amber-500"
            >
              <option value="none">No Lamination</option>
              <option value="gloss">Gloss Thermal Pouch Lamination (+TSh 1,000/sheet)</option>
              <option value="matte">Matte Anti-Glare Lamination (+TSh 1,200/sheet)</option>
            </select>
          </div>
        </div>

        {/* Estimated Price Result Bar */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 block">
              Estimated Price (Subject to file check)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-950">
                {formatTSh(estimatedTotal)}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                ({config.pageCount} pages × {config.copies} {config.copies === 1 ? 'copy' : 'copies'})
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleLaunchOrder}
            icon={<Printer className="w-4 h-4" />}
          >
            Upload File & Submit Print Job
          </Button>
        </div>
      </div>
    </div>
  );
};
