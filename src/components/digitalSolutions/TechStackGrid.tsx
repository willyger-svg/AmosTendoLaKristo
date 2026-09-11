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
      category: 'Web & User Interfaces',
      icon: Code2,
      techs: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Vite'],
      description: 'Ultra-fast, mobile-first responsive interfaces optimized for Tanzanian cellular networks.'
    },
    {
      category: 'Mobile Applications',
      icon: Smartphone,
      techs: ['Flutter', 'React Native', 'Android Native', 'iOS Native'],
      description: 'Cross-platform mobile apps with native hardware access, offline sync, and push notifications.'
    },
    {
      category: 'Backend & High-Speed APIs',
      icon: Server,
      techs: ['Node.js', 'Express', 'Python FastAPI', 'Go'],
      description: 'Robust REST and GraphQL endpoints designed for low-latency transaction processing.'
    },
    {
      category: 'Databases & Resilience',
      icon: Database,
      techs: ['PostgreSQL', 'Cloud SQL', 'Firebase Firestore', 'Redis Cache'],
      description: 'ACID-compliant relational architectures with automated automated cloud backups.'
    },
    {
      category: 'Payments & Telecom Gateways',
      icon: Zap,
      techs: ['M-Pesa Daraja API', 'Tigo Pesa', 'Airtel Money', 'GePG Gov API', 'Card Processing'],
      description: 'Seamless integration with local mobile network operators and electronic billing systems.'
    },
    {
      category: 'Security & Infrastructure',
      icon: Shield,
      techs: ['Google Cloud Platform', 'Docker', 'SSL / TLS Encryption', 'Role-Based Access'],
      description: 'Enterprise-grade access isolation, automated threat protection, and disaster recovery.'
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
