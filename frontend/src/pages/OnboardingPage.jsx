import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, BarChart3, ChevronRight } from 'lucide-react';
import { useLoading } from '../context/LoadingContext';
import './OnboardingPage.css';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();
  const { startLoading } = useLoading();

  React.useEffect(() => {
    let mounted = true;
    startLoading(2500).then(() => {
      if (mounted) setIsReady(true);
    });
    return () => { mounted = false; };
  }, [startLoading]);

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      localStorage.setItem("hasSeenOnboarding", "true");
      navigate("/login", { replace: true });
    }
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    navigate("/login", { replace: true });
  };

  if (!isReady) {
    return <div className="onboarding-container" style={{ background: '#f8fafc' }}></div>;
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      
      <div className="onboarding-card">
        {step === 1 && (
          <div className="onboarding-step animate-fade-in">
            <div className="onboarding-icon-wrapper">
              <Truck size={64} className="text-primary" />
            </div>
            <h1 className="onboarding-title">Selamat Datang di Palm Chain</h1>
            <p className="onboarding-desc">
              Solusi cerdas terintegrasi untuk memantau dan mengelola rantai pasok kelapa sawit Anda. Dari pencatatan kontraktor hingga pelacakan armada truk ke pabrik, semuanya dalam satu platform.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step animate-fade-in">
            <div className="onboarding-features">
              <div className="feature-item">
                <BarChart3 size={32} className="feature-icon" />
                <div>
                  <h3>Pantau Secara Real-Time</h3>
                  <p>Lacak pengangkutan kelapa sawit secara langsung dan pastikan semua proses berjalan efisien.</p>
                </div>
              </div>
              <div className="feature-item">
                <ShieldCheck size={32} className="feature-icon" />
                <div>
                  <h3>Aman dan Transparan</h3>
                  <p>Setiap transaksi dan data kontraktor tersimpan dengan aman melalui sistem komputasi awan kami.</p>
                </div>
              </div>
            </div>
            <h2 className="onboarding-title mt-4">Siap Untuk Memulai?</h2>
            <p className="onboarding-desc">
              Tingkatkan efisiensi logistik perkebunan Anda bersama Palm Chain hari ini.
            </p>
          </div>
        )}

        <div className="onboarding-footer">
          <div className="onboarding-dots">
            <span className={`dot ${step === 1 ? 'active' : ''}`}></span>
            <span className={`dot ${step === 2 ? 'active' : ''}`}></span>
          </div>
          
          <div className="onboarding-actions">
            <button className="btn-skip" onClick={handleSkip}>
              Lewati
            </button>
            <button className="btn-next" onClick={handleNext}>
              {step === 1 ? 'Selanjutnya' : 'Mulai Sekarang'}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
