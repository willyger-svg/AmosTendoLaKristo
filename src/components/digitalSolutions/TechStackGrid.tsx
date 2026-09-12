import React from 'react';
import {
  Code2,
  Database,
  Cloud,
  Shield,
  Smartphone,
  Server,
  Zap,
  Lock
} from 'lucide-react';

export const TechStackGrid: React.FC = () => {
  const stackItems = [
    {
      category: 'Tovuti & Miundo ya Watumiaji',
      icon: Code2,
      techs: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Vite'],
      description: 'Miundo yenye kasi ya juu, inayofaa simu na iliyoboreshwa kwa mitandao ya intaneti ya Tanzania.'
    },
    {
      category: 'Programu za Simu (Mobile Apps)',
      icon: Smartphone,
      techs: ['Flutter', 'React Native', 'Android Native', 'iOS Native'],
      description: 'Programu za simu za Android na iOS zenye kufanya kazi bila intaneti na kutuma taarifa papo hapo.'
    },
    {
      category: 'Mifumo ya Nyuma & API za Kasi Kubwa',
      icon: Server,
      techs: ['Node.js', 'Express', 'Python FastAPI', 'Go'],
      description: 'Seva na API imara za REST na GraphQL zilizoundwa kwa uchakataji wa haraka wa miamala.'
    },
    {
      category: 'Hifadhidata & Usalama wa Kumbukumbu',
      icon: Database,
      techs: ['PostgreSQL', 'Cloud SQL', 'Firebase Firestore', 'Redis Cache'],
      description: 'Muundo imara wa hifadhidata wenye nakala za kiotomatiki za wingu (cloud backup).'
    },
    {
      category: 'Mifumo ya Malipo ya Mitandao ya Simu',
      icon: Zap,
      techs: ['M-Pesa Daraja API', 'Tigo Pesa', 'Airtel Money', 'GePG Gov API', 'Kadi za Benki'],
      description: 'Muunganisho wa moja kwa moja na mitandao ya M-Pesa, Tigo Pesa, Airtel Money na GePG.'
    },
    {
      category: 'Ulinzi wa Kimtandao & Miundombinu',
      icon: Shield,
      techs: ['Google Cloud Platform', 'Docker', 'SSL / TLS Encryption', 'Ruksa za Ngazi'],
      description: 'Ulinzi thabiti wa kiwango cha makampuni, usimbaji fiche (encryption), na mifumo thabiti ya kiusalama.'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stackItems.map(item => {
        const IconComp = item.icon;

        return (
          <div
            key={item.category}
            className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 border border-amber-200/60">
                  <IconComp className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 leading-tight">
                  {item.category}
                </h4>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {item.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
              {item.techs.map(tech => (
                <span
                  key={tech}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
