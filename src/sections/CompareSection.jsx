/* section · CompareSection — Wave 2 Phase B5.
   COMPARE is one of the five top-level sections in the new IA. It
   answers the family of cross-agent / cross-class questions that the
   original 11-tab reference UI split across three separate tabs:

     • Spectrum         — the 49×49 expected-activity map and the
                          MIC / breakpoint / antibiogram principles
                          that translate spectrum into bedside choice.
     • Penetration      — the agent × site matrix plus the three
                          PK/PD killing patterns that drive dosing
                          strategy.
     • Mechanisms       — the class × molecular-target × resistance-
                          escape table, the four routes of resistance,
                          and the cidal/static + PK/PD synthesis. The
                          strategic IA groups this under COMPARE
                          because it ultimately answers "how does this
                          drug class compare to that one."

   This component is the verbatim extraction of `renderSpectrum` +
   `renderPenetration` + `renderMechanisms` from App.jsx. The visual
   rhythm, classNames (`rx-spec`, `rx-pencard`, `rx-mechrow`, `rx-mtx`,
   `rx-pkpd-*`, etc.), and DOM structure all match the original render
   functions byte-for-byte so existing CSS and tests continue to apply.

   Sub-tab is controlled by the parent (App's COMPARE sub-nav); this
   component is otherwise stateless beyond what it receives via props.
   App.jsx itself is intentionally NOT modified by this phase — that
   wiring will happen in a later phase when the new IA shell is hooked
   up to replace the legacy tab router.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import {
  Activity, AlertTriangle, Clock, CornerDownRight, Crosshair,
  FlaskConical, Info, Layers, Network, ShieldAlert, TrendingDown, X,
} from "lucide-react";
import { SpectrumCompare } from "../components/cards";
import { Cite, PDot } from "../components/primitives";
import { SpectrumChartFull } from "../spectrum/Spectrum";
import { PEN, PEN_SITES } from "../data/drugs";
import { MECH } from "../data/organisms";

function CompareSection({
  activeTab,
  setTab,
  ctx,
  d,
  dose,
  openDrug,
  openOrg,
  openTrial,
  pickDrug,
  setPickDrug,
  pickOrg,
  setPickOrg,
}) {
  /* SPECTRUM panel — the 49×49 expected-activity matrix + the
     MIC / breakpoint / antibiogram reasoning that turns spectrum into
     a bedside decision. */
  const spectrumPanel = (
    <div>
      <h2 className="rx-h2">Spectrum of activity</h2>
      <p className="rx-lede">
        A 49-agent &times; 49-organism map of <i>expected</i> activity &mdash; the intrinsic and typical
        phenotype of each organism against each agent, drawn from EUCAST expected-resistant-phenotype
        tables, IDSA 2024 AMR guidance, and primary spectrum data. Fill fraction encodes the magnitude of
        activity and, critically, separates <b>intrinsic</b> resistance (a structural or enzymatic wall that no
        susceptibility report will breach) from <b>acquired</b> resistance and ordinary spectrum gaps. Hover to
        cross-highlight a drug&times;bug pair; click to lock focus. The gold star marks a drug of choice, not
        merely activity. This is a reasoning and teaching aid &mdash; not a substitute for the isolate&rsquo;s own
        susceptibilities or your local antibiogram.
      </p>

      <SpectrumCompare onDrug={(n)=>openDrug && openDrug(n)} />

      <SpectrumChartFull />

      <h3 className="rx-h3"><span className="ic"><FlaskConical size={18} /></span>From spectrum to susceptibility &mdash; reading the data that drives the choice</h3>
      <p className="rx-lede" style={{maxWidth:"82ch"}}>
        The chart above is a population statement: what an agent <i>should</i> do against a typical member of a
        species. The decision at the bedside is governed by two further layers &mdash; the isolate&rsquo;s measured
        MIC interpreted against a breakpoint, and the local antibiogram that tells you how often that interpretation
        holds in your hospital. Spectrum, MIC, and antibiogram are three different questions; conflating them is a
        common source of error.
      </p>

      <div className="rx-2col">
        <div className="rx-mini">
          <h4><span className="ic"><Layers size={16} /></span>The minimum inhibitory concentration</h4>
          <ul>
            <li>The <b>MIC</b> is the lowest concentration (&micro;g/mL) that suppresses visible growth in vitro &mdash; a potency measurement, not a probability of cure. It is meaningful only relative to the <b>breakpoint</b>.</li>
            <li>A breakpoint is set by integrating the MIC distribution (the wild-type cutoff, ECOFF), achievable drug exposure (PK/PD target attainment at the labeled dose), and clinical outcome data. <b>Lower MIC does not mean &ldquo;better drug&rdquo;</b> across agents &mdash; only within the same agent against the same bug.</li>
            <li>Comparing MICs <i>between</i> drugs is meaningless: a vancomycin MIC of 1 and a ceftriaxone MIC of 1 are not equivalent. Always read MIC against that agent&rsquo;s breakpoint.</li>
          </ul>
        </div>
        <div className="rx-mini">
          <h4><span className="ic"><Info size={16} /></span>Susceptibility categories: S, I, SDD, and R</h4>
          <ul>
            <li><b>S (susceptible):</b> likely to respond at the standard dose.</li>
            <li><b>SDD (susceptible-dose-dependent):</b> success requires a dosing regimen that maximizes exposure (e.g., cefepime for Enterobacterales, levofloxacin) &mdash; an explicit instruction to push the dose, not a hedge.</li>
            <li><b>I (susceptible, increased exposure):</b> CLSI/EUCAST have redefined &ldquo;I&rdquo; to mean the agent works <i>if</i> exposure is high (high dose, or a site that concentrates drug such as urine) &mdash; it is no longer &ldquo;intermediate / borderline.&rdquo;</li>
            <li><b>R (resistant):</b> unlikely to respond at any achievable dose.</li>
          </ul>
        </div>
      </div>

      <div className="rx-callout">
        <Info size={16} />
        <span>
          <b>CLSI vs EUCAST.</b> US labs report CLSI breakpoints; much of Europe uses EUCAST. They differ for several
          agents (notably the antipseudomonal &beta;-lactams and some Enterobacterales), so a single MIC can read S
          under one system and I/R under the other. Breakpoints are also revised downward over time &mdash; older
          &ldquo;susceptible&rdquo; cefepime/piperacillin-tazobactam results predating the revisions can mislead.
          Know which system your lab uses and its revision date.
        </span>
      </div>

      <h4 className="rx-h4"><span className="ic"><AlertTriangle size={15} /></span>&ldquo;Susceptible in vitro&rdquo; is not always &ldquo;use it&rdquo;</h4>
      <table className="rx-allergy" style={{marginTop:"6px"}}>
        <thead><tr><th style={{width:"24%"}}>Trap</th><th style={{width:"38%"}}>What the lab may report</th><th>Why it can still fail</th></tr></thead>
        <tbody>
          <tr>
            <td><b>ESBL + piperacillin-tazobactam</b></td>
            <td>Often tests susceptible</td>
            <td><b>MERINO</b> showed piperacillin-tazobactam inferior to meropenem for ESBL bacteremia despite in-vitro susceptibility. Use a carbapenem for serious ESBL infection regardless of the S.</td>
          </tr>
          <tr>
            <td><b>AmpC inducers + 3rd-gen cephalosporin</b></td>
            <td>Initial S to ceftriaxone</td>
            <td>Enterobacter, Serratia, Citrobacter, K. aerogenes can <b>derepress AmpC on therapy</b> and emerge resistant. IDSA 2024 prefers cefepime (moderate-risk) or a carbapenem &mdash; treat by mechanism, not the first report.</td>
          </tr>
          <tr>
            <td><b>Inoculum effect</b></td>
            <td>S at standard inoculum</td>
            <td>At the high bacterial burden of an abscess, endocarditis vegetation, or undrained collection, MIC rises sharply (classic for cefazolin vs some MSSA, &beta;-lactams vs ESBL). <b>Source control</b> matters as much as the antibiogram.</td>
          </tr>
          <tr>
            <td><b>Heteroresistance</b></td>
            <td>S on routine testing</td>
            <td>A resistant subpopulation below the limit of detection (e.g., colistin, some &beta;-lactams vs CRE) can be selected on therapy. Suspect it when a &ldquo;susceptible&rdquo; agent fails clinically.</td>
          </tr>
          <tr>
            <td><b>Site mismatch</b></td>
            <td>S systemically</td>
            <td>Susceptibility assumes the drug reaches the site. Daptomycin is S vs S. pneumoniae but inactivated in lung; moxifloxacin is S vs E. coli but never concentrates in urine; first-generation cephalosporins do not enter CSF. See the Penetration tab.</td>
          </tr>
        </tbody>
      </table>

      <h4 className="rx-h4"><span className="ic"><Activity size={15} /></span>Reading the antibiogram &mdash; how local data recalibrates every empiric choice</h4>
      <ul className="rx-pearls">
        <li>The cumulative antibiogram reports <b>%S</b> for each bug&times;drug pair over a year at your institution. It is the bridge from the population spectrum above to <i>your</i> patients. A drug that is &ldquo;reliable&rdquo; on the chart but runs 65&ndash;75% S locally is not empiric monotherapy.</li>
        <li><b>The &ge;80&ndash;90% rule:</b> for empiric monotherapy of a serious infection, choose an agent with roughly &ge;80&ndash;90% local susceptibility against the likely pathogen; below that, add coverage or pick another agent until cultures return.</li>
        <li>Antibiograms are <b>unit- and source-specific</b>: ICU and urine isolates resist more than ward and blood isolates. Use the syndrome-appropriate stratum (a urinary antibiogram for cystitis, not the hospital-wide composite) where available.</li>
        <li>They report only the <b>first isolate per patient</b> and exclude duplicates, so they understate resistance in chronically colonized or device patients &mdash; weight the individual&rsquo;s prior cultures heavily.</li>
        <li><b>Combination antibiograms</b> (the added %S from a second agent) justify empiric double Gram-negative coverage where single-agent %S is inadequate, and identify when a second drug adds nothing.</li>
      </ul>
      <div className="rx-callout">
        <Crosshair size={16} />
        <span>
          Bottom line: read the chart for <i>what is possible</i>, the breakpoint-interpreted MIC for <i>what this isolate is</i>,
          and the local antibiogram for <i>how often you can trust it empirically</i> &mdash; then de-escalate to the
          narrowest agent the susceptibilities allow.
        </span>
      </div>
    </div>
  );

  /* PENETRATION panel — tissue penetration matrix + the three PK/PD
     killing patterns and their dosing strategies. */
  const penetrationPanel = (
    <div>
      <h2 className="rx-h2">Tissue penetration &amp; PK/PD</h2>
      <p className="rx-lede">
        Spectrum answers <i>can the drug kill this organism;</i> penetration and PK/PD answer <i>can it do so at the
        site, at this dose.</i> A susceptible report is necessary but not sufficient &mdash; daptomycin is inactivated
        in the lung, moxifloxacin never reaches urine, first-generation cephalosporins do not enter CSF, and
        aminoglycosides fail in the abscess they were prescribed for. The matrix below is expected adult penetration
        at usual systemic doses into an infected (inflamed) site; the cards translate the three killing patterns into
        the appropriate dosing strategy.
      </p>

      <div className="rx-mtxwrap">
        <table className="rx-mtx">
          <thead>
            <tr>
              <th className="corner"><div className="cl">Agent &nbsp;&middot;&nbsp; site &rarr;</div></th>
              {PEN_SITES.map(s => (
                <th key={s.k}><div className="rx-mtx-colh">{s.label}{s.sub?" · "+s.sub:""}</div></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PEN.map((r,i) => r.band ? (
              <tr key={"b"+i} className="band"><td colSpan={PEN_SITES.length+1}>{r.band}</td></tr>
            ) : (
              <tr key={r.ag}>
                <td className="lab">{r.ag}{r.sub ? <small>{r.sub}</small> : null}</td>
                {PEN_SITES.map(s => (
                  <td key={s.k} className="rx-cell2"><PDot lv={r.c[s.k]} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rx-mtxleg">
        <span className="li"><span className="rx-dot d-good" /> Good / reliable</span>
        <span className="li"><span className="rx-dot d-mod" /> Moderate / dose-dependent</span>
        <span className="li"><span className="rx-dot d-poor" /> Poor / inadequate</span>
        <span className="li"><span className="rx-dot d-var" /> Variable</span>
        <span className="li"><span className="rx-dot d-na" /> Not applicable</span>
      </div>
      <p className="rx-mxnote" style={{fontSize:"12px",color:"var(--muted)",lineHeight:1.6,marginTop:"12px"}}>
        Hover any cell for the qualitative grade. &ldquo;CNS&rdquo; assumes meningeal inflammation and meningitis dosing;
        many agents that read &ldquo;good&rdquo; there are inadequate without inflammation. Penetration is necessary but
        not sufficient &mdash; abscesses still require drainage, and undrained foci defeat even well-penetrating agents.
      </p>

      <h3 className="rx-h3"><span className="ic"><Activity size={18} /></span>Three patterns of bacterial killing and their dosing implications</h3>
      <p className="rx-lede" style={{maxWidth:"82ch"}}>
        Every antibacterial maximizes one of three PK/PD indices. Knowing which one tells you whether to chase a high
        peak, a long time above MIC, or a large daily exposure &mdash; and whether the &ldquo;obvious&rdquo; dosing change helps
        or wastes drug.
      </p>
      <div className="rx-axis">
        <div className="rx-axiscard">
          <div className="ax-k">Concentration-dependent</div>
          <div className="ax-t">Chase the peak</div>
          <div className="ax-pd">target: Cmax/MIC &amp; AUC/MIC</div>
          <ul>
            <li><b>Aminoglycosides</b> &mdash; once-daily / extended-interval dosing maximizes Cmax/MIC and exploits the post-antibiotic effect while limiting time-dependent nephro-/ototoxicity.</li>
            <li><b>Fluoroquinolones</b> &mdash; AUC/MIC &asymp;125 (Gram-negative), &asymp;30&ndash;40 (pneumococcus); a true once-daily class.</li>
            <li><b>Daptomycin, polymyxins, metronidazole</b> &mdash; also peak/AUC-driven.</li>
            <li>A prolonged <b>post-antibiotic effect</b> is what makes interval dosing safe.</li>
          </ul>
        </div>
        <div className="rx-axiscard">
          <div className="ax-k">Time-dependent</div>
          <div className="ax-t">Stay above MIC</div>
          <div className="ax-pd">target: %fT&gt;MIC</div>
          <ul>
            <li><b>&beta;-lactams</b> &mdash; efficacy tracks the fraction of the interval free drug exceeds the MIC: penicillins &asymp;50%, cephalosporins &asymp;60&ndash;70%, carbapenems &asymp;40%.</li>
            <li><b>Extended (3&ndash;4 h) or continuous infusion</b> of cefepime, piperacillin-tazobactam, and meropenem raises %fT&gt;MIC for high-MIC organisms and the critically ill &mdash; more effective than a larger bolus.</li>
            <li>Little post-antibiotic effect against Gram-negatives &mdash; missed/late doses matter.</li>
          </ul>
        </div>
        <div className="rx-axiscard">
          <div className="ax-k">AUC-dependent</div>
          <div className="ax-t">Total daily exposure</div>
          <div className="ax-pd">target: 24-h AUC/MIC</div>
          <ul>
            <li><b>Vancomycin</b> &mdash; AUC/MIC <b>400&ndash;600</b> (2020 ASHP/IDSA): dose to AUC, not trough; a <b>loading dose</b> (25&ndash;30 mg/kg) reaches target faster in serious MRSA disease.</li>
            <li><b>Linezolid, tetracyclines, azithromycin, clindamycin</b> &mdash; time-dependent with prolonged post-antibiotic effect, so total AUC governs.</li>
            <li>Loading doses also apply to colistin and (functionally) to extended-infusion &beta;-lactams in sepsis where the volume of distribution is expanded.</li>
          </ul>
        </div>
      </div>
      <div className="rx-callout">
        <Info size={16} />
        <span>
          Two corollaries the matrix cannot show: in the <b>expanded volume of distribution</b> of sepsis, standard doses
          under-expose &mdash; loading doses and, for &beta;-lactams, prolonged infusions matter most exactly when the patient
          is sickest; and <b>source control</b> (drainage, device removal, debridement) changes the PK/PD problem more than
          any dose adjustment, because it collapses the bacterial inoculum the drug must cover.
        </span>
      </div>
    </div>
  );

  /* MECHANISMS panel — class × molecular-target × resistance escape
     table + the four-route resistance taxonomy + cidal/static and
     PK/PD synthesis. */
  const mechanismsPanel = (
    <div>
      <h2 className="rx-h2">Mechanism &amp; resistance map</h2>
      <p className="rx-lede">
        Every class attacks one molecular target; resistance is the organism&rsquo;s counter-move against that exact
        target. Pairing the two explains cross-resistance (why MLS<sub>B</sub> links macrolides, clindamycin, and
        streptogramins), why a single rpoB mutation defeats rifampin monotherapy, and why glycylcyclines were built to
        outflank classic tetracycline efflux. It also fixes the cidal&ndash;static distinction that governs agent choice in
        endocarditis, meningitis, and neutropenia.
      </p>

      <table className="rx-ftable" style={{marginTop:"6px"}}>
        <thead>
          <tr>
            <th style={{width:"22%"}}>Class</th>
            <th style={{width:"30%"}}>Molecular target &amp; action</th>
            <th style={{width:"10%"}}>Kill</th>
            <th>Principal resistance escape</th>
          </tr>
        </thead>
        <tbody>
          {MECH.map((r,i) => r.band ? (
            <tr key={"b"+i} className="rx-dirgrp"><td colSpan={4}>{r.band}</td></tr>
          ) : (
            <tr key={r.cls}>
              <td data-l="Class" className="tdname"><span className="rx-fname">{r.cls}</span></td>
              <td data-l="Target">{r.tgt}{r.hook ? <div className="rx-fpearl" style={{marginTop:"4px"}}>{r.hook}</div> : null}</td>
              <td data-l="Kill"><span className={"rx-tag "+(r.kill.indexOf("cidal")===0?"t-ox":"t-neutral")}>{r.kill}</span></td>
              <td data-l="Resistance"><span className="rx-frenal">{r.res}</span></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="rx-h3"><span className="ic"><ShieldAlert size={18} /></span>Mechanisms of resistance: four routes of escape</h3>
      <div className="rx-2col">
        <div className="rx-mini">
          <h4><span className="ic"><FlaskConical size={16} /></span>1 &middot; Inactivate the drug (enzymatic)</h4>
          <ul>
            <li><b>&beta;-lactamases</b> hydrolyze the &beta;-lactam ring &mdash; penicillinase &rarr; ESBL &rarr; AmpC &rarr; carbapenemase, the dominant Gram-negative threat.</li>
            <li><b>Aminoglycoside-modifying enzymes</b> and <b>chloramphenicol acetyltransferase</b> chemically disable the drug.</li>
            <li>Counter-move: a <b>&beta;-lactamase inhibitor</b> (avibactam, vaborbactam, durlobactam) or a structurally protected agent.</li>
          </ul>
        </div>
        <div className="rx-mini">
          <h4><span className="ic"><Network size={16} /></span>2 &middot; Alter / protect the target</h4>
          <ul>
            <li><b>PBP2a</b> (MRSA), <b>mosaic/altered PBP</b> (penicillin-R pneumococcus, gonococcus).</li>
            <li><b>D-Ala-D-Lac</b> precursor (vanA/vanB &rarr; VRE); <b>23S/rRNA methylation</b> (erm, cfr); <b>QRDR</b> and <b>rpoB</b> point mutations.</li>
            <li>Counter-move: an agent that binds the modified target (ceftaroline for PBP2a) or a different target entirely.</li>
          </ul>
        </div>
        <div className="rx-mini">
          <h4><span className="ic"><X size={16} /></span>3 &middot; Deny access (efflux + porin loss)</h4>
          <ul>
            <li><b>Efflux pumps</b> (tet, mef, RND systems) and <b>porin loss</b> reduce intracellular drug &mdash; central to <b>Pseudomonas</b> and <b>CRE</b> multidrug phenotypes.</li>
            <li>Often combine with a low-level enzyme to cross a breakpoint &mdash; the basis of much &ldquo;variable&rdquo; activity in the spectrum chart.</li>
            <li>Counter-move: high exposure, or the siderophore route (cefiderocol &ldquo;Trojan horse&rdquo; uptake).</li>
          </ul>
        </div>
        <div className="rx-mini">
          <h4><span className="ic"><CornerDownRight size={16} /></span>4 &middot; Bypass the pathway</h4>
          <ul>
            <li>Target <b>overproduction</b> or an <b>alternative enzyme</b> (sul/dfr in folate synthesis) outruns the drug.</li>
            <li>Auxotrophy / exogenous folate uptake circumvents folate antagonists.</li>
            <li>Counter-move: <b>sequential blockade</b> (TMP-SMX hits two folate steps) raises the bar for bypass.</li>
          </ul>
        </div>
      </div>

      <div className="rx-callout">
        <Info size={16} />
        <span>
          <b>Cidal vs static is a site question, not a ranking.</b> Bactericidal agents (&beta;-lactams, vancomycin,
          daptomycin, aminoglycosides, fluoroquinolones, metronidazole, rifampin) are preferred where host defenses
          cannot finish the job &mdash; <b>endocarditis, meningitis, profound neutropenia.</b> Bacteriostatic agents
          (tetracyclines, macrolides, clindamycin, linezolid, oxazolidinones) are fully adequate for most other
          infections, and linezolid&rsquo;s lung penetration outweighs its static label in MRSA pneumonia.
        </span>
      </div>

      <h3 className="rx-h3"><span className="ic"><Activity size={18}/></span>Pharmacokinetic-pharmacodynamic targets</h3>
      <p className="rx-lede" style={{marginBottom:12}}>Killing pattern decides dosing strategy — the same total daily dose succeeds or fails depending on how it is distributed across the interval.</p>
      <div className="rx-pkpd-grid">
        <div className="rx-pkpd-card">
          <div className="rx-pkpd-h"><Clock size={14}/> Time-dependent</div>
          <div className="rx-pkpd-tgt">Target: <b>%fT &gt; MIC</b></div>
          <div className="rx-pkpd-ag">β-lactams — carbapenems ~40%, penicillins ~50%, cephalosporins ~60–70%</div>
          <div className="rx-pkpd-do">Maximise time above MIC: <b>extended or continuous infusion</b> and more frequent dosing. Minimal Gram-negative post-antibiotic effect, so a trough that dips below MIC lets regrowth begin.</div>
        </div>
        <div className="rx-pkpd-card">
          <div className="rx-pkpd-h"><TrendingDown size={14}/> Concentration-dependent</div>
          <div className="rx-pkpd-tgt">Target: <b>C<sub>max</sub> / MIC</b></div>
          <div className="rx-pkpd-ag">Aminoglycosides (C<sub>max</sub>/MIC ~8–10), daptomycin</div>
          <div className="rx-pkpd-do">Drive the peak: <b>once-daily, extended-interval</b> dosing. A long post-antibiotic effect covers the trough and limits toxicity.</div>
        </div>
        <div className="rx-pkpd-card">
          <div className="rx-pkpd-h"><Activity size={14}/> Exposure (AUC)-dependent</div>
          <div className="rx-pkpd-tgt">Target: <b>AUC / MIC</b></div>
          <div className="rx-pkpd-ag">Vancomycin (AUC/MIC 400–600), fluoroquinolones (~125 GNR · 30–40 GP), linezolid</div>
          <div className="rx-pkpd-do">Total daily exposure governs effect: <b>AUC-guided</b> dosing — Bayesian for vancomycin — beats trough-only targeting <Cite id="vanco" onClick={(cid)=>openTrial && openTrial(cid)} />.</div>
        </div>
      </div>
      <div className="rx-2col" style={{marginTop:16}}>
        <div className="rx-card rx-mini">
          <h4><span className="ic"><Clock size={15}/></span>Post-antibiotic effect</h4>
          <ul>
            <li><b>Long PAE</b> — aminoglycosides and fluoroquinolones against Gram-negatives suppress regrowth after levels fall, the rationale for extended-interval dosing.</li>
            <li><b>Minimal PAE</b> — β-lactams against Gram-negatives demand concentrations above MIC for most of the interval; never let the schedule lapse.</li>
          </ul>
        </div>
        <div className="rx-card rx-mini">
          <h4><span className="ic"><AlertTriangle size={15}/></span>Inoculum effect</h4>
          <ul>
            <li>A high bacterial burden raises the effective MIC and can defeat an agent that tests susceptible — cefazolin against high-inoculum MSSA (type-A β-lactamase), pip-tazo against high-inoculum ESBL.</li>
            <li>Implication: <b>source control</b> plus a reliable cidal agent for deep, high-burden foci — do not lean on a borderline agent at a large inoculum.</li>
          </ul>
        </div>
      </div>
      <div className="rx-callout"><Info size={15}/><span>The first (loading) dose is volume-of-distribution-driven and full regardless of clearance; augmented renal clearance and obesity both reshape these targets — the <b>Dose</b> tab applies them to the active patient.</span></div>
    </div>
  );

  /* Sub-tab dispatch. Default to "spectrum" so the component renders
     a useful panel even when activeTab is undefined (e.g. tests that
     mount the component without props). */
  const tab = activeTab || "spectrum";
  if(tab === "penetration") return penetrationPanel;
  if(tab === "mechanisms") return mechanismsPanel;
  return spectrumPanel;
}

export { CompareSection };
