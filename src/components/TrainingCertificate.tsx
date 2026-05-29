import { useEffect, useRef, useState } from "react";
import { Award, Download, Printer, Shield, CheckCircle2 } from "lucide-react";
import logo from "@/assets/techlaunchpad-logo.png";
import aicteLogo from "@/assets/aicte-logo.png";
import officialSeal from "@/assets/official-seal.png";

interface TrainingCertificateProps {
  studentName: string;
  collegeName: string;
  universityName: string;
  trainingName: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  certificateNumber: string;
}

export function TrainingCertificate({
  studentName,
  collegeName,
  universityName,
  trainingName,
  durationDays,
  startDate,
  endDate,
  certificateNumber,
}: TrainingCertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);

  const formatDate = (d: string) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "";

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex justify-end gap-3 no-print">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 h-10 px-5 bg-[#0a192f] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#1e40af] transition-all shadow-lg"
        >
          <Printer className="size-4" /> Print / Save PDF
        </button>
      </div>

      {/* Certificate */}
      <div
        ref={certRef}
        className="print-cert"
        style={{
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
          position: "relative",
          background: "linear-gradient(135deg, #fefefe 0%, #f8f6f0 100%)",
          border: "none",
          fontFamily: "'Georgia', 'Times New Roman', serif",
          boxShadow: "0 25px 80px rgba(0,0,0,0.15)",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        {/* Outer Gold Border Frame */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            border: "12px solid transparent",
            borderImage: "linear-gradient(135deg, #b8860b, #ffd700, #b8860b, #ffd700) 1",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
        {/* Inner thin border */}
        <div
          style={{
            position: "absolute",
            inset: "18px",
            border: "2px solid rgba(184,134,11,0.35)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />

        {/* Watermark Logo */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          <img
            src={logo}
            alt="watermark"
            style={{
              width: "380px",
              height: "380px",
              objectFit: "contain",
              opacity: 0.045,
              filter: "grayscale(100%)",
            }}
          />
        </div>

        {/* Certificate Content */}
        <div style={{ position: "relative", zIndex: 5, padding: "56px 64px" }}>
          {/* Top Row: Logo + Title + Partners (AICTE & MSME) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "32px",
              borderBottom: "1px solid rgba(184,134,11,0.3)",
              paddingBottom: "24px",
            }}
          >
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <img src={logo} alt="TechLaunchpad" style={{ height: "56px", width: "56px", objectFit: "contain" }} />
              <div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 900,
                    color: "#0a192f",
                    letterSpacing: "0.12em",
                    fontFamily: "'Arial Black', sans-serif",
                    textTransform: "uppercase",
                  }}
                >
                  TechLaunchpad
                </div>
                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    color: "#b8860b",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    fontFamily: "Arial, sans-serif",
                  }}
                >
                  Learn · Grow · Launch
                </div>
              </div>
            </div>

            {/* AICTE & MSME Badge container */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {/* AICTE Logo */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <img src={aicteLogo} alt="AICTE" style={{ height: "50px", objectFit: "contain" }} />
                <span style={{ fontSize: "7px", fontWeight: 900, color: "#0a192f", marginTop: "4px", fontFamily: "Arial, sans-serif", letterSpacing: "0.05em", textTransform: "uppercase" }}>AICTE APPROVED</span>
              </div>
              
              {/* MSME Badge */}
              <div
                style={{
                  background: "linear-gradient(135deg, #0a192f, #1e3a5f)",
                  borderRadius: "12px",
                  padding: "12px 18px",
                  textAlign: "center",
                  border: "1px solid rgba(184,134,11,0.5)",
                }}
              >
                <div style={{ fontSize: "8px", fontWeight: 900, color: "#fbbf24", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "Arial, sans-serif" }}>
                  ✓ MSME APPROVED
                </div>
                <div style={{ fontSize: "7px", fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.15em", marginTop: "3px", fontFamily: "Arial, sans-serif" }}>
                  Govt. of India Recognized
                </div>
                <div style={{ fontSize: "7px", fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.15em", marginTop: "2px", fontFamily: "Arial, sans-serif" }}>
                  ISO 9001:2015 Certified
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Title */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#b8860b",
                letterSpacing: "0.45em",
                textTransform: "uppercase",
                fontFamily: "Arial, sans-serif",
                marginBottom: "8px",
              }}
            >
              This is to certify that
            </div>
            <div
              style={{
                fontSize: "42px",
                fontWeight: 900,
                color: "#0a192f",
                fontFamily: "'Georgia', serif",
                fontStyle: "italic",
                letterSpacing: "-0.01em",
                lineHeight: 1.1,
                marginBottom: "4px",
              }}
            >
              {studentName}
            </div>
            <div
              style={{
                width: "280px",
                height: "2px",
                background: "linear-gradient(90deg, transparent, #b8860b, transparent)",
                margin: "10px auto 0",
              }}
            />
          </div>

          {/* Body text */}
          <div
            style={{
              textAlign: "center",
              fontSize: "13px",
              color: "#374151",
              lineHeight: 1.9,
              fontFamily: "Georgia, serif",
              marginBottom: "28px",
              padding: "0 20px",
            }}
          >
            <span>has successfully completed the </span>
            <strong
              style={{
                color: "#0a192f",
                fontWeight: 900,
                fontFamily: "'Arial Black', sans-serif",
                textTransform: "uppercase",
                fontSize: "14px",
                letterSpacing: "0.05em",
              }}
            >
              {trainingName}
            </strong>
            <br />
            <span>
              a <strong>{durationDays}-Day</strong> professional training program, conducted from
            </span>
            <br />
            <strong style={{ color: "#b8860b" }}>
              {formatDate(startDate)}
            </strong>
            <span> to </span>
            <strong style={{ color: "#b8860b" }}>
              {formatDate(endDate)}
            </strong>
          </div>

          {/* Institution Info */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(10,25,47,0.04), rgba(184,134,11,0.06))",
              border: "1px solid rgba(184,134,11,0.2)",
              borderRadius: "12px",
              padding: "18px 28px",
              textAlign: "center",
              marginBottom: "32px",
            }}
          >
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#b8860b", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "Arial, sans-serif", marginBottom: "6px" }}>
              Institution Details
            </div>
            <div style={{ fontSize: "14px", fontWeight: 900, color: "#0a192f", fontFamily: "Arial, sans-serif", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {collegeName}
            </div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280", fontFamily: "Arial, sans-serif", marginTop: "3px" }}>
              Affiliated to {universityName}
            </div>
          </div>

          {/* Bottom: Certificate Number + Signature */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", borderTop: "1px solid rgba(184,134,11,0.25)", paddingTop: "24px" }}>
            {/* Certificate Number */}
            <div>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "#9ca3af", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "Arial, sans-serif", marginBottom: "4px" }}>
                Certificate Number
              </div>
              <div style={{ fontSize: "13px", fontWeight: 900, color: "#0a192f", fontFamily: "monospace", letterSpacing: "0.08em" }}>
                {certificateNumber}
              </div>
              <div style={{ fontSize: "9px", color: "#9ca3af", fontFamily: "Arial, sans-serif", marginTop: "4px" }}>
                Verify at: techlaunchpad.in/verify
              </div>
            </div>

            {/* Center Seal & QR Code */}
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "6px" }}>
                <img 
                  src={officialSeal} 
                  alt="Official Seal" 
                  style={{ 
                    width: "64px", 
                    height: "64px", 
                    objectFit: "contain",
                    display: "block",
                    filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.15))"
                  }} 
                />
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin + "/verify?id=" + certificateNumber : "")}`} 
                  alt="Verification QR Code" 
                  style={{ 
                    width: "64px", 
                    height: "64px", 
                    objectFit: "contain",
                    border: "1px solid rgba(184, 134, 11, 0.3)",
                    padding: "2px",
                    background: "white",
                    borderRadius: "4px",
                    display: "block"
                  }} 
                />
              </div>
              <div style={{ fontSize: "7px", fontWeight: 700, color: "#b8860b", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "Arial, sans-serif" }}>
                Official Seal | Scan to Verify
              </div>
            </div>

            {/* Signature */}
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  width: "140px",
                  borderBottom: "1.5px solid #0a192f",
                  marginBottom: "6px",
                  height: "36px",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingBottom: "4px",
                }}
              >
                <span style={{ fontFamily: "'Georgia', serif", fontStyle: "italic", fontSize: "18px", color: "#0a192f" }}>
                  TechLaunchpad
                </span>
              </div>
              <div style={{ fontSize: "10px", fontWeight: 900, color: "#0a192f", fontFamily: "Arial, sans-serif", letterSpacing: "0.05em" }}>
                Program Director
              </div>
              <div style={{ fontSize: "9px", color: "#9ca3af", fontFamily: "Arial, sans-serif", marginTop: "2px" }}>
                TechLaunchpad Pvt. Ltd.
              </div>
            </div>
          </div>

          {/* Corner Decorations */}
          <div
            style={{
              position: "absolute",
              top: "28px",
              left: "28px",
              width: "40px",
              height: "40px",
              borderTop: "3px solid rgba(184,134,11,0.5)",
              borderLeft: "3px solid rgba(184,134,11,0.5)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "28px",
              right: "28px",
              width: "40px",
              height: "40px",
              borderTop: "3px solid rgba(184,134,11,0.5)",
              borderRight: "3px solid rgba(184,134,11,0.5)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "28px",
              left: "28px",
              width: "40px",
              height: "40px",
              borderBottom: "3px solid rgba(184,134,11,0.5)",
              borderLeft: "3px solid rgba(184,134,11,0.5)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "28px",
              right: "28px",
              width: "40px",
              height: "40px",
              borderBottom: "3px solid rgba(184,134,11,0.5)",
              borderRight: "3px solid rgba(184,134,11,0.5)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
