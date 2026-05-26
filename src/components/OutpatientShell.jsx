/* component · OutpatientShell — Phase C placeholder for the outpatient
   surface. Rendered when SurfaceBar.surface === "outpatient". The content
   makes the future scope explicit so visitors who land here understand the
   roadmap — both Reference (outpatient formulary, syndrome bank,
   stewardship) and Decide (case-driven outpatient antibiotic selection)
   are planned future builds. The Inpatient surface remains the
   functional default until then.

   Wave 11 W11 atomized polish — the previously flat placeholder card
   has been re-framed as a beautiful editorial "coming soon" moment.
   A lime-amber MeshWash announces that this is a different surface
   from inpatient (which speaks cyan-magenta-lime). The headline is
   96px italic-serif; the standfirst names the future scope; a
   chrome-CTA pill rides back to inpatient. The two existing plan
   cards remain — they carry the actual roadmap copy and shouldn't
   be lost — but now sit on glass-diffuse, asymmetric-radius panels
   under a gradient hairline divider.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useRef } from "react";
import { ArrowLeft, BookOpen, Crosshair, Hospital, Stethoscope } from "lucide-react";
import { MeshWash } from "./decor/MeshWash.jsx";
import { SectionArtwork } from "./decor/SectionArtwork.jsx";
import { GradientHairline } from "./decor/GradientHairline.jsx";
import { Sparkle } from "./decor/Sparkle.jsx";
import { useMagnetic } from "./util/useMagnetic.js";
import { useRipple } from "./util/useRipple.js";

function _planCard({ Icon, kicker, head, body }) {
  return (
    <div style={{
      position: "relative",
      /* W11 · glass-diffuse fill + asymmetric 14/4 radius so the plan
         cards stop looking like neutral utility panels and adopt the
         Wave 9 chrome grammar. Inner highlight + e1 shadow give the
         card a soft lift without competing with the headline. */
      background: "linear-gradient(135deg, rgba(255,255,255,0.74) 0%, rgba(245,250,253,0.58) 100%)",
      backdropFilter: "blur(12px) saturate(170%)",
      WebkitBackdropFilter: "blur(12px) saturate(170%)",
      border: "1px solid var(--ox-line, var(--line))",
      borderRadius: "14px 4px 14px 4px",
      padding: 18,
      boxShadow: "var(--shadow-e1), inset 0 1px 0 rgba(255,255,255,0.5)",
    }}>
      <div style={{
        display:"flex", alignItems:"center", gap:8, marginBottom:8,
      }}>
        {/* W11 · small gradient icon tile (28x28, 8/3 asymmetric radius)
            so the kicker icon matches the Wave 9 vocabulary that the
            Section primitive uses for full-size 40px tiles. */}
        <span aria-hidden="true" style={{
          flex:"0 0 auto",
          display:"inline-flex", alignItems:"center", justifyContent:"center",
          width:28, height:28,
          borderRadius:"8px 3px 8px 3px",
          background:"linear-gradient(135deg, var(--ox-deep, var(--ox)) 0%, var(--ox) 60%, var(--ox-bright, var(--ox)) 240%)",
          color:"#fff",
          boxShadow:"0 4px 14px -4px var(--ox-bright, var(--ox)), 0 1px 0 rgba(255,255,255,.08) inset",
        }}>
          <Icon size={14} aria-hidden />
        </span>
        <span style={{
          fontFamily:"var(--mono)", fontSize:10, letterSpacing:".14em",
          textTransform:"uppercase", color:"var(--ox)", fontWeight:700,
        }}>
          {kicker}
        </span>
      </div>
      <div style={{ fontFamily:"var(--serif)", fontSize:17, fontWeight:600, color:"var(--ink)", marginBottom:6, letterSpacing:"-.008em" }}>
        {head}
      </div>
      <div style={{ fontSize:13, color:"var(--ink2)", lineHeight:1.55 }}>{body}</div>
    </div>
  );
}

function OutpatientShell({ onSwitchInpatient }) {
  /* Chrome-CTA "Back to Inpatient" — magnetic + ripple-affording.
     We keep the original onClick contract so behaviour is identical. */
  const backRef = useRef(null);
  useMagnetic(backRef, { strength: 0.22, range: 90 });
  useRipple(backRef);

  return (
    <div
      className="rx-root rx-bedside"
      style={{
        paddingTop: 36,
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
      }}
    >
      {/* W11 · ambient lime-amber mesh wash — this palette explicitly
          differs from inpatient's cyan-magenta-lime, so users feel they've
          landed on a sibling-but-distinct surface. `ambient` keeps the
          chroma very soft so headline type stays legible. */}
      <MeshWash
        variant="full"
        intensity="soft"
        palette="lime-amber"
        drift
      />
      {/* W11 · top-right lime orb — a single iridescent decor element
          that anchors the upper corner without competing with the
          editorial headline. */}
      <SectionArtwork variant="orb" accent="lime" />

      <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{
          fontFamily:"var(--mono)", fontSize:10, letterSpacing:".18em",
          textTransform:"uppercase", color:"var(--muted)", fontWeight:600,
          marginBottom: 14,
          display: "inline-flex", alignItems: "center", gap: 6,
        }}>
          <Stethoscope size={11} aria-hidden style={{ verticalAlign:"-1px", marginRight:5, color:"var(--electric-lime, var(--ox))" }}/>
          Outpatient surface · planned
          <Sparkle size={10} color="var(--electric-lime, var(--ox))" />
        </div>

        {/* W11 · 96px italic-serif headline. The big editorial mark
            announces "you've arrived somewhere considered" even when
            the content underneath is still a placeholder. */}
        <h1 style={{
          fontFamily:"var(--serif)",
          fontStyle:"italic",
          fontSize:"clamp(56px, 9.6vw, 96px)",
          lineHeight: 0.92,
          fontWeight:600,
          letterSpacing:"-.022em",
          margin:"0 0 14px",
          color: "var(--ink)",
        }}>
          Outpatient
        </h1>

        <p style={{
          fontFamily: "var(--serif)",
          fontStyle: "italic",
          color:"var(--ink2)",
          fontSize: 18,
          lineHeight: 1.5,
          margin:"0 0 22px",
          maxWidth:"62ch",
        }}>
          Outpatient stewardship — coming in a future wave. The reasoning
          framework will mirror inpatient but the dosing surface, IV/PO
          pathways, and source-control logic adapt to ambulatory care.
        </p>

        <GradientHairline variant="cyan-blue" style={{ margin: "10px 0 20px" }} />

        <div style={{ display:"grid", gap:12, gridTemplateColumns:"1fr 1fr" }}>
          {_planCard({
            Icon: BookOpen,
            kicker: "Reference · planned",
            head: "Outpatient formulary, syndromes, stewardship",
            body: "An ambulatory parallel to the inpatient Reference: oral-first formulary, outpatient syndrome bank, antibiotic stewardship in primary care, and the cross-walks from inpatient discharge to outpatient completion.",
          })}
          {_planCard({
            Icon: Crosshair,
            kicker: "Decide · planned",
            head: "Outpatient case-driven decision tool",
            body: "The Bedside model adapted to the visit: enter the case, get the recommended oral regimen with patient-specific dosing, follow-up criteria, and stewardship-aware narrowing — same engine, outpatient-tuned data.",
          })}
        </div>

        <div style={{
          marginTop: 22, padding: "14px 16px",
          background:"linear-gradient(135deg, rgba(255,255,255,0.62) 0%, rgba(248,251,253,0.46) 100%)",
          backdropFilter: "blur(10px) saturate(160%)",
          WebkitBackdropFilter: "blur(10px) saturate(160%)",
          border:"1px solid var(--ox-line, var(--line))",
          borderRadius: "10px 3px 10px 3px",
          fontSize: 13, color:"var(--ink2)", lineHeight: 1.55,
        }}>
          <Hospital size={13} aria-hidden style={{ verticalAlign:"-2px", marginRight:6, color:"var(--neon-cyan, var(--ox))" }}/>
          For now the Inpatient surface is the functional tool. Switch back using the bar
          above, or with the button below.
        </div>

        <div style={{ marginTop: 18 }}>
          {/* W11 · chrome-CTA pill — vertical metal gradient + cyan glow,
              shine-sweep on hover, magnetic + ripple via refs. Same
              onClick contract; no behavioural change. */}
          <button
            ref={backRef}
            type="button"
            onClick={onSwitchInpatient}
            className="rx-chrome-cta rx-magnetic rx-ripple rx-shine-sweep"
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "var(--sans)",
              fontSize: 13.5,
              fontWeight: 600,
              letterSpacing: ".01em",
              color: "#fff",
              padding: "11px 18px",
              borderRadius: "12px 3px 12px 3px",
              border: "1px solid color-mix(in srgb, var(--ox-deep, var(--ox)) 70%, transparent)",
              background:
                "linear-gradient(180deg," +
                " var(--ox-deep, #0B0F14) 0%," +
                " var(--ox, #1F2937) 35%," +
                " var(--ox, #1F2937) 55%," +
                " var(--ox-deep, #0B0F14) 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.20)," +
                " inset 0 -1px 0 rgba(0,0,0,0.30)," +
                " 0 6px 14px -4px rgba(11,15,20,0.45)," +
                " 0 0 22px -6px color-mix(in srgb, var(--neon-cyan, var(--ox-bright, var(--ox))) 55%, transparent)",
              cursor: "pointer",
              overflow: "hidden",
              isolation: "isolate",
            }}
          >
            <ArrowLeft size={13}/> Back to inpatient
          </button>
        </div>
      </div>
    </div>
  );
}

export { OutpatientShell };
