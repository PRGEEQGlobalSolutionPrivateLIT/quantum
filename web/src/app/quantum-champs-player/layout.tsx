import type { ReactNode } from "react";
import MobileLandscape from "./MobileLandscape";

export default function QuantumChampsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <MobileLandscape>{children}</MobileLandscape>;
}