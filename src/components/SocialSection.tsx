"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import GlassCard from './GlassCard';
import SectionReveal from './SectionReveal';
import { useLanguage } from '@/context/LanguageContext';
import { SiWechat, SiXiaohongshu, SiX, SiGithub } from 'react-icons/si';
import { QrCode, ExternalLink, X as CloseIcon, Sparkles } from 'lucide-react';

interface ActiveModalState {
  title: string;
  handle: string;
  qrImage: string;
  type: string;
}

export default function SocialSection() {
  const { t } = useLanguage();
  const [activeModal, setActiveModal] = useState<ActiveModalState | null>(null);

  const getIcon = (id: string) => {
    switch(id) {
      case 'wechat': return <SiWechat className="w-6 h-6" />;
      case 'xiaohongshu': return <SiXiaohongshu className="w-6 h-6" />;
      case 'github': return <SiGithub className="w-6 h-6" />;
      case 'x': return <SiX className="w-6 h-6" />;
      default: return null;
    }
  };

  const openQrModal = (platform: any) => {
    if (platform.type === 'qr' && platform.qrImage) {
      setActiveModal({
        title: platform.name,
        handle: platform.handle,
        qrImage: platform.qrImage,
        type: platform.id,
      });
    }
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <section id="contact" className="w-full py-24 sm:py-32 px-4 max-w-6xl mx-auto relative">
      <SectionReveal>
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold tracking-wider uppercase mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Channel Matrix</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-4">
            {t.social.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
            {t.social.subtitle}
          </p>
        </div>
      </SectionReveal>

      {/* 4-Column Matrix Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {t.social.platforms.map((platform, index) => {
          const isQr = platform.type === 'qr';

          const CardContent = (
            <GlassCard hoverable className="h-full flex flex-col justify-between p-6 sm:p-7 bg-white/60 dark:bg-slate-900/50 border border-white/80 dark:border-slate-800/80 group transition-all duration-300">
              <div>
                {/* Header: Icon + Badge */}
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${platform.color} shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
                    {getIcon(platform.id)}
                  </div>
                  {isQr ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <QrCode className="w-3 h-3" />
                      <span>QR Code</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <ExternalLink className="w-3 h-3" />
                      <span>Link</span>
                    </span>
                  )}
                </div>

                {/* Name & Handle */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {platform.name}
                </h3>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-3 tracking-wide break-words">
                  {platform.handle}
                </p>

                {/* Description */}
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                  {platform.description}
                </p>
              </div>

              {/* Action Trigger */}
              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {isQr ? (
                  <>
                    <span className="inline-flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{t.social.viewQr}</span>
                    </span>
                    <span className="text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                      &rarr;
                    </span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>前往主页</span>
                    </span>
                    <span className="text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                      &rarr;
                    </span>
                  </>
                )}
              </div>
            </GlassCard>
          );

          return (
            <SectionReveal key={platform.id} delayMs={index * 100} className="h-full">
              {isQr ? (
                <button
                  type="button"
                  onClick={() => openQrModal(platform)}
                  className="w-full h-full text-left cursor-pointer focus:outline-none"
                >
                  {CardContent}
                </button>
              ) : (
                <a
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full cursor-pointer"
                >
                  {CardContent}
                </a>
              )}
            </SectionReveal>
          );
        })}
      </div>

      {/* QR Code Lightbox Modal */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={closeModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-sm w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/60 dark:border-slate-800 animate-scale-up"
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <CloseIcon className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                {activeModal.title}
              </h3>
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-6">
                {activeModal.handle}
              </p>

              {/* QR Image Container */}
              <div className="relative w-full max-w-[280px] aspect-square mx-auto rounded-2xl overflow-hidden shadow-inner border-2 border-slate-100 dark:border-slate-800 bg-white p-2">
                <Image
                  src={activeModal.qrImage}
                  alt={`${activeModal.title} QR Code`}
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 640px) 260px, 300px"
                  priority
                />
              </div>

              {/* Scan Prompt */}
              <p className="mt-5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                {t.social.scanPrompt}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
