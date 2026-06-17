import { createContext, useCallback, useContext, useMemo, useState } from "react";
import LoadingScreen from "../components/LoadingScreen";

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [duration, setDuration] = useState(0); // for animation timing

  const startLoading = useCallback((ms = 2500) => {
    setIsLoading(true);
    setIsFadingOut(false);
    setDuration(ms);
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          setIsLoading(false);
          resolve();
        }, 500); // Wait for fade-out animation to complete
      }, ms);
    });
  }, []);

  const value = useMemo(() => ({ startLoading }), [startLoading]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && <LoadingScreen duration={duration} isFadingOut={isFadingOut} />}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading harus digunakan di dalam LoadingProvider");
  return ctx;
}
