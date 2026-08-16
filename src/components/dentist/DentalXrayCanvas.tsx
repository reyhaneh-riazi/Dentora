import React from 'react';

interface DentalXrayCanvasProps {
  type: 'rvg' | 'opg' | 'cbct' | 'intraoral';
  toothFdi?: number;
}

export const DentalXrayCanvas: React.FC<DentalXrayCanvasProps> = ({ type, toothFdi = 16 }) => {
  if (type === 'rvg') {
    // High-contrast Periapical RVG Radiograph (Root canal, pulp chamber, alveolar bone level, enamel, dentin, apex, restoration)
    return (
      <svg
        viewBox="0 0 800 600"
        className="w-full h-full object-contain select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Medical noise texture */}
          <filter id="xray-noise" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
            <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0.12 0" />
            <feComposite in2="SourceGraphic" in="gl" operator="over" />
          </filter>

          {/* Bone trabecular gradient */}
          <radialGradient id="bone-grad" cx="50%" cy="80%" r="70%">
            <stop offset="0%" stopColor="#1e2229" />
            <stop offset="60%" stopColor="#0d1015" />
            <stop offset="100%" stopColor="#05070a" />
          </radialGradient>

          {/* Crown Radiopacity Gradient (Enamel/Dentin) */}
          <linearGradient id="enamel-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="35%" stopColor="#cbd5e1" />
            <stop offset="85%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>

          {/* Root Radiopacity */}
          <linearGradient id="root-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="70%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Radiopaque Amalgam/Composite Restoration */}
          <linearGradient id="restoration-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          {/* Radiolucency (Caries / Periapical lesion glow) */}
          <radialGradient id="caries-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#050505" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#111827" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#64748b" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="periapical-lesion" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#030712" stopOpacity="0.98" />
            <stop offset="60%" stopColor="#0f172a" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#334155" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background Film Plate */}
        <rect width="800" height="600" fill="#06090e" />

        {/* Trabecular Bone Spongeous Matrix Pattern */}
        <g opacity="0.45">
          {Array.from({ length: 45 }).map((_, i) => (
            <ellipse
              key={i}
              cx={80 + (i * 37) % 640 + (i % 3) * 15}
              cy={280 + ((i * 23) % 290)}
              rx={12 + (i % 8) * 3}
              ry={6 + (i % 5) * 2}
              fill="#1e293b"
              opacity={(i % 10) * 0.08 + 0.2}
            />
          ))}
        </g>

        {/* Alveolar Bone Crest Line */}
        <path
          d="M 50 360 Q 200 350, 320 370 T 480 375 T 620 360 T 750 370 L 750 600 L 50 600 Z"
          fill="url(#bone-grad)"
          opacity="0.9"
        />

        {/* Periodontal Ligament (PDL) Spaces & Lamina Dura */}
        <g stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" fill="none">
          {/* Tooth 15 (Premolar on the right/left) */}
          <path d="M 170 330 C 160 380, 165 470, 200 520 C 215 535, 230 520, 240 470 C 255 390, 250 340, 250 330" />
          {/* Main Molar FDI 16 */}
          <path d="M 320 340 C 310 400, 305 480, 320 540 C 335 555, 360 535, 375 480 C 390 440, 410 440, 425 480 C 440 535, 465 555, 480 540 C 495 480, 490 400, 480 340" />
          {/* Tooth 17 (Second Molar) */}
          <path d="M 550 340 C 540 410, 545 490, 565 535 C 575 545, 595 540, 610 490 C 630 430, 650 490, 665 530 C 675 540, 695 530, 700 480 C 710 410, 705 340, 695 340" />
        </g>

        {/* ====== NEIGHBOR TOOTH: PREMOLAR (FDI 15) ====== */}
        <g opacity="0.75">
          {/* Crown */}
          <path
            d="M 160 220 C 160 180, 180 160, 205 160 C 230 160, 250 180, 250 220 C 250 260, 245 320, 240 340 C 220 345, 190 345, 170 340 C 165 320, 160 260, 160 220 Z"
            fill="url(#enamel-grad)"
          />
          {/* Root */}
          <path
            d="M 170 340 C 165 400, 175 470, 205 515 C 225 515, 235 470, 240 400 C 240 370, 240 340, 240 340 Z"
            fill="url(#root-grad)"
          />
          {/* Pulp Canal */}
          <path
            d="M 205 210 L 205 500"
            stroke="#090d14"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>

        {/* ====== TARGET TOOTH: MAXILLARY FIRST MOLAR (FDI 16) ====== */}
        <g id="main-molar-16">
          {/* Crown Enamel & Dentin Outline */}
          <path
            d="M 305 210 C 300 160, 340 130, 400 130 C 460 130, 500 160, 495 210 C 495 260, 485 325, 480 345 C 430 355, 370 355, 320 345 C 315 325, 305 260, 305 210 Z"
            fill="url(#enamel-grad)"
            stroke="#ffffff"
            strokeOpacity="0.4"
            strokeWidth="2"
          />

          {/* Occlusal Cusps Anatomy */}
          <path
            d="M 310 190 Q 350 150, 370 170 Q 400 140, 430 170 Q 460 150, 490 190"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.6"
            strokeWidth="2"
          />

          {/* Deep Dental Caries (Distal/Occlusal Radiolucency) */}
          <ellipse
            cx="445"
            cy="195"
            rx="28"
            ry="24"
            fill="url(#caries-glow)"
          />
          <path
            d="M 430 180 Q 455 185, 465 210 Q 445 220, 430 205 Z"
            fill="#030712"
            opacity="0.9"
          />

          {/* Radio-opaque Metallic/Amalgam Filling on Mesial */}
          <path
            d="M 330 165 C 345 160, 365 165, 370 185 C 370 205, 340 215, 330 200 Z"
            fill="url(#restoration-grad)"
            stroke="#ffffff"
            strokeWidth="2"
            filter="drop-shadow(0px 0px 4px rgba(255,255,255,0.8))"
          />

          {/* Roots (Mesiobuccal & Distobuccal & Palatal) */}
          {/* Mesial Root */}
          <path
            d="M 320 345 C 310 410, 315 480, 340 535 C 355 540, 365 520, 375 470 C 385 420, 395 365, 395 350 Z"
            fill="url(#root-grad)"
          />
          {/* Distal Root */}
          <path
            d="M 405 350 C 405 365, 415 420, 425 470 C 435 520, 445 540, 460 535 C 485 480, 490 410, 480 345 Z"
            fill="url(#root-grad)"
          />

          {/* Pulp Chamber & Root Canals (Dark Radiolucent Anatomy) */}
          <path
            d="M 360 250 C 360 230, 440 230, 440 250 C 440 280, 420 310, 400 310 C 380 310, 360 280, 360 250 Z"
            fill="#020617"
          />
          {/* Pulp Horns reaching toward cusps */}
          <path
            d="M 370 235 L 360 210 M 430 235 L 440 210"
            stroke="#020617"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Mesial Canal */}
          <path
            d="M 375 290 Q 355 380, 340 528"
            stroke="#020617"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Distal Canal */}
          <path
            d="M 425 290 Q 445 380, 460 528"
            stroke="#020617"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Periapical Lesion (Dark shadow at root apex) */}
          <ellipse
            cx="340"
            cy="545"
            rx="32"
            ry="24"
            fill="url(#periapical-lesion)"
          />
          <ellipse
            cx="460"
            cy="545"
            rx="26"
            ry="20"
            fill="url(#periapical-lesion)"
          />
        </g>

        {/* ====== NEIGHBOR TOOTH: SECOND MOLAR (FDI 17) ====== */}
        <g opacity="0.75">
          <path
            d="M 540 210 C 535 165, 570 135, 625 135 C 680 135, 715 165, 710 210 C 710 260, 700 325, 695 345 C 650 355, 595 355, 550 345 Z"
            fill="url(#enamel-grad)"
          />
          <path
            d="M 550 345 C 540 420, 550 490, 575 530 C 595 535, 605 500, 615 450 C 630 450, 640 500, 655 530 C 680 490, 690 420, 695 345 Z"
            fill="url(#root-grad)"
          />
          {/* Canals */}
          <path d="M 590 280 L 575 520 M 630 280 L 655 520" stroke="#020617" strokeWidth="3" fill="none" />
        </g>

        {/* Radiograph Artifacts, Maxillary Sinus Floor curve */}
        <path
          d="M 80 180 Q 300 240, 500 220 T 780 160"
          stroke="#ffffff"
          strokeOpacity="0.3"
          strokeWidth="1.5"
          strokeDasharray="6 3"
          fill="none"
        />
        <text x="660" y="190" fill="#ffffff" fillOpacity="0.4" fontSize="11" fontFamily="sans-serif">
          Maxillary Sinus Floor
        </text>

        {/* R / L Identification Marker & Scale */}
        <g fill="#ffffff" fillOpacity="0.6" fontSize="12" fontFamily="monospace">
          <text x="35" y="45" fontWeight="bold" fontSize="18">R</text>
          <text x="35" y="65">RVG 70kV 7mA</text>
          <text x="35" y="80">Exp: 0.12s</text>
          <text x="35" y="95">FDI: #{toothFdi}</text>
          
          {/* Metric scale bar */}
          <line x1="720" y1="520" x2="720" y2="570" stroke="#ffffff" strokeWidth="2" />
          <line x1="715" y1="520" x2="725" y2="520" stroke="#ffffff" strokeWidth="2" />
          <line x1="715" y1="545" x2="725" y2="545" stroke="#ffffff" strokeWidth="1" />
          <line x1="715" y1="570" x2="725" y2="570" stroke="#ffffff" strokeWidth="2" />
          <text x="680" y="548" fontSize="10">10 mm</text>
        </g>
      </svg>
    );
  }

  if (type === 'opg') {
    // Full Panoramic Dental Radiograph (Both Upper and Lower Jaws, 32 teeth, TMJ joints, Mandibular canal, Sinuses)
    return (
      <svg
        viewBox="0 0 1000 500"
        className="w-full h-full object-contain select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="opg-mandible" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#2a3342" />
            <stop offset="70%" stopColor="#131924" />
            <stop offset="100%" stopColor="#05080e" />
          </radialGradient>
          <linearGradient id="opg-tooth" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="opg-lower-tooth" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
        </defs>

        <rect width="1000" height="500" fill="#04070c" />

        {/* Mandible Jaw Bone (Panoramic U-Shape) */}
        <path
          d="M 120 180 C 100 280, 140 440, 280 470 C 400 495, 600 495, 720 470 C 860 440, 900 280, 880 180 C 860 250, 820 410, 710 435 C 600 460, 400 460, 290 435 C 180 410, 140 250, 120 180 Z"
          fill="url(#opg-mandible)"
          stroke="#475569"
          strokeOpacity="0.4"
        />

        {/* TMJ Condyles (Left and Right) */}
        <ellipse cx="120" cy="160" rx="22" ry="14" fill="#64748b" opacity="0.6" />
        <ellipse cx="880" cy="160" rx="22" ry="14" fill="#64748b" opacity="0.6" />
        <text x="95" y="140" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">TMJ (L)</text>
        <text x="860" y="140" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">TMJ (R)</text>

        {/* Maxillary Sinuses Cavities */}
        <ellipse cx="320" cy="190" rx="90" ry="45" fill="#020408" stroke="#334155" strokeWidth="1.5" />
        <ellipse cx="680" cy="190" rx="90" ry="45" fill="#020408" stroke="#334155" strokeWidth="1.5" />
        <text x="280" y="195" fill="#475569" fontSize="11">Sinus Maxillaris</text>
        <text x="640" y="195" fill="#475569" fontSize="11">Sinus Maxillaris</text>

        {/* Mandibular Canal & Mental Foramen */}
        <path
          d="M 150 280 Q 240 400, 360 410 M 850 280 Q 760 400, 640 410"
          stroke="#000000"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
        <circle cx="360" cy="410" r="7" fill="#000000" />
        <circle cx="640" cy="410" r="7" fill="#000000" />

        {/* Hard Palate Line */}
        <path d="M 220 220 Q 500 250, 780 220" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="3" fill="none" />

        {/* Upper Arch Teeth (16 Teeth Curved) */}
        <g id="upper-teeth">
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i - 7.5) * 0.14;
            const x = 500 + Math.sin(angle) * 310;
            const y = 235 - Math.cos(angle) * 45;
            const width = i >= 5 && i <= 10 ? 18 : 28;
            const height = i >= 5 && i <= 10 ? 42 : 52;
            const isTarget = i === 12; // FDI 16 representation
            return (
              <g key={`upper-${i}`} transform={`translate(${x - width / 2}, ${y})`}>
                <rect
                  width={width}
                  height={height}
                  rx={6}
                  fill={isTarget ? '#f1f5f9' : 'url(#opg-tooth)'}
                  stroke={isTarget ? '#ffd200' : '#ffffff'}
                  strokeWidth={isTarget ? 2 : 0.8}
                  strokeOpacity={isTarget ? 1 : 0.4}
                />
                {/* Root canal lines */}
                <line x1={width / 2} y1={2} x2={width / 2} y2={height - 8} stroke="#020617" strokeWidth="2" />
                {/* Crown restoration on target tooth */}
                {isTarget && (
                  <rect x={2} y={height - 18} width={width - 4} height={14} fill="#ffffff" rx={2} />
                )}
              </g>
            );
          })}
        </g>

        {/* Lower Arch Teeth (16 Teeth Curved) */}
        <g id="lower-teeth">
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i - 7.5) * 0.14;
            const x = 500 + Math.sin(angle) * 290;
            const y = 300 + Math.cos(angle) * 40;
            const width = i >= 6 && i <= 9 ? 16 : 26;
            const height = i >= 6 && i <= 9 ? 38 : 48;
            const isThirdMolarImpacted = i === 0 || i === 15;
            return (
              <g
                key={`lower-${i}`}
                transform={`translate(${x - width / 2}, ${y - height}) ${
                  isThirdMolarImpacted ? (i === 0 ? 'rotate(35)' : 'rotate(-35)') : ''
                }`}
              >
                <rect
                  width={width}
                  height={height}
                  rx={6}
                  fill="url(#opg-lower-tooth)"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                  strokeOpacity="0.4"
                />
                <line x1={width / 2} y1={8} x2={width / 2} y2={height - 2} stroke="#020617" strokeWidth="2" />
              </g>
            );
          })}
        </g>

        {/* Occlusal Curve of Spee Guide Line */}
        <path d="M 190 270 Q 500 310, 810 270" stroke="#38bdf8" strokeOpacity="0.3" strokeDasharray="4 4" fill="none" />

        {/* Header Medical Watermark */}
        <g fill="#ffffff" fillOpacity="0.6" fontSize="12" fontFamily="monospace">
          <text x="40" y="45" fontWeight="bold" fontSize="16">ORTHOPANTOMOGRAM (OPG)</text>
          <text x="40" y="65">Full Dentition Panoramic View | 75kV 12mA 14.2s</text>
          <text x="940" y="45" fontWeight="bold" fontSize="18" textAnchor="end">R</text>
          <text x="60" y="45" fontWeight="bold" fontSize="18">L</text>
        </g>
      </svg>
    );
  }

  if (type === 'cbct') {
    // 3D Cone Beam Computed Tomography Multiplanar Reconstruction (Axial, Coronal, Sagittal slices)
    return (
      <svg
        viewBox="0 0 900 600"
        className="w-full h-full object-contain select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="900" height="600" fill="#03060a" />

        {/* 4 Multi-Planar Viewports (MPR 2x2 Grid) */}
        {/* VIEWPORT 1: AXIAL (Top Left) */}
        <g transform="translate(10, 10)">
          <rect width="435" height="280" fill="#080c14" stroke="#334155" rx="8" />
          <text x="15" y="25" fill="#38bdf8" fontSize="12" fontWeight="bold" fontFamily="monospace">
            AXIAL SLICE (Z: -14.2mm)
          </text>
          {/* Dental Arch Cross-section */}
          <path
            d="M 90 230 C 90 100, 345 100, 345 230 C 315 210, 280 140, 217 140 C 155 140, 120 210, 90 230 Z"
            fill="#1e293b"
            stroke="#94a3b8"
            strokeWidth="3"
          />
          {/* Crosshair guide lines */}
          <line x1="217" y1="35" x2="217" y2="265" stroke="#ef4444" strokeOpacity="0.6" strokeDasharray="3 3" />
          <line x1="25" y1="170" x2="410" y2="170" stroke="#ef4444" strokeOpacity="0.6" strokeDasharray="3 3" />
          <circle cx="310" cy="185" r="14" fill="#f8fafc" stroke="#ffd200" strokeWidth="2" />
          <text x="330" y="190" fill="#ffd200" fontSize="10" fontWeight="bold">FDI #16</text>
        </g>

        {/* VIEWPORT 2: CORONAL (Top Right) */}
        <g transform="translate(455, 10)">
          <rect width="435" height="280" fill="#080c14" stroke="#334155" rx="8" />
          <text x="15" y="25" fill="#38bdf8" fontSize="12" fontWeight="bold" fontFamily="monospace">
            CORONAL VIEW (Alveolar Ridge & Sinus)
          </text>
          {/* Maxillary Sinus & Ridge */}
          <path
            d="M 100 70 Q 217 140, 335 70 L 335 240 Q 217 260, 100 240 Z"
            fill="#1e293b"
            stroke="#64748b"
            strokeWidth="2"
          />
          {/* Tooth Cross Section */}
          <path
            d="M 190 250 L 205 150 L 230 150 L 245 250 Z"
            fill="#f1f5f9"
            stroke="#ffffff"
          />
          {/* Bone Height Measurement Caliper */}
          <line x1="260" y1="150" x2="260" y2="250" stroke="#10b981" strokeWidth="2" />
          <line x1="255" y1="150" x2="265" y2="150" stroke="#10b981" strokeWidth="2" />
          <line x1="255" y1="250" x2="265" y2="250" stroke="#10b981" strokeWidth="2" />
          <text x="270" y="205" fill="#10b981" fontSize="11" fontWeight="bold">Bone: 11.8 mm</text>
        </g>

        {/* VIEWPORT 3: SAGITTAL / CROSS-SECTIONAL (Bottom Left) */}
        <g transform="translate(10, 300)">
          <rect width="435" height="280" fill="#080c14" stroke="#334155" rx="8" />
          <text x="15" y="25" fill="#38bdf8" fontSize="12" fontWeight="bold" fontFamily="monospace">
            SAGITTAL CROSS-SECTION (Buccal-Lingual)
          </text>
          {/* Ridge Profile */}
          <path
            d="M 140 250 C 130 140, 180 80, 230 80 C 280 80, 310 150, 290 250 Z"
            fill="#1e293b"
            stroke="#94a3b8"
            strokeWidth="2"
          />
          {/* Implant / Root Space Simulation */}
          <path
            d="M 195 240 L 210 130 L 225 130 L 240 240 Z"
            fill="#f8fafc"
          />
          {/* Buccal plate thickness caliper */}
          <line x1="150" y1="170" x2="200" y2="170" stroke="#f59e0b" strokeWidth="2" />
          <text x="120" y="190" fill="#f59e0b" fontSize="10" fontWeight="bold">Buccal: 1.9mm</text>
        </g>

        {/* VIEWPORT 4: 3D VOLUMETRIC RECONSTRUCTION (Bottom Right) */}
        <g transform="translate(455, 300)">
          <rect width="435" height="280" fill="#080c14" stroke="#334155" rx="8" />
          <text x="15" y="25" fill="#38bdf8" fontSize="12" fontWeight="bold" fontFamily="monospace">
            3D VOLUME RENDERING (Surface Model)
          </text>
          {/* 3D Skull Jaw Representation */}
          <ellipse cx="217" cy="150" rx="140" ry="85" fill="#334155" opacity="0.6" />
          <path
            d="M 120 160 Q 217 210, 314 160 Q 330 230, 217 245 Q 100 230, 120 160 Z"
            fill="#64748b"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />
          {/* Teeth Row in 3D */}
          <path
            d="M 140 170 Q 217 200, 294 170"
            stroke="#ffffff"
            strokeWidth="12"
            strokeDasharray="14 4"
            fill="none"
          />
          <text x="160" y="265" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">
            Voxel Size: 0.150mm | FOV: 8x8 cm
          </text>
        </g>
      </svg>
    );
  }

  // Intraoral High-Definition Clinical Dental Macro (Teeth Occlusal Table)
  return (
    <svg
      viewBox="0 0 800 600"
      className="w-full h-full object-contain select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="gingiva-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d97786" />
          <stop offset="60%" stopColor="#be123c" />
          <stop offset="100%" stopColor="#881337" />
        </radialGradient>
        <radialGradient id="tooth-enamel" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#fef3c7" />
          <stop offset="85%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </radialGradient>
      </defs>

      {/* Oral Cavity Background & Gingiva */}
      <rect width="800" height="600" fill="#4c0519" />
      <path
        d="M 0 0 C 200 80, 600 80, 800 0 L 800 600 C 600 520, 200 520, 0 600 Z"
        fill="url(#gingiva-grad)"
      />

      {/* Row of Teeth (Intraoral Occlusal Macro Photography) */}
      {/* Premolar 1 */}
      <g transform="translate(100, 190)">
        <ellipse cx="60" cy="110" rx="45" ry="55" fill="url(#tooth-enamel)" stroke="#e2e8f0" strokeWidth="2" />
        {/* Occlusal Fissures */}
        <path d="M 40 110 Q 60 112, 80 110" stroke="#78350f" strokeWidth="2.5" fill="none" />
      </g>

      {/* Premolar 2 */}
      <g transform="translate(210, 180)">
        <ellipse cx="65" cy="120" rx="50" ry="60" fill="url(#tooth-enamel)" stroke="#e2e8f0" strokeWidth="2" />
        <path d="M 40 120 Q 65 125, 90 120 M 65 95 L 65 145" stroke="#78350f" strokeWidth="3" fill="none" />
      </g>

      {/* Molar 1 (FDI 16 Target Tooth with Composite Restoration & Cavity) */}
      <g transform="translate(340, 160)">
        <rect
          x="10"
          y="30"
          width="150"
          height="160"
          rx="45"
          fill="url(#tooth-enamel)"
          stroke="#e2e8f0"
          strokeWidth="3"
        />
        {/* Detailed Occlusal Anatomy Cusps */}
        <path
          d="M 40 60 Q 85 110, 130 60 M 40 160 Q 85 110, 130 160 M 30 110 L 140 110"
          stroke="#451a03"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Cavity / Dark Fissure Lesion */}
        <ellipse cx="115" cy="85" rx="14" ry="12" fill="#1c1917" />
        <text x="50" y="215" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
          دندان ۱۶ (FDI)
        </text>
      </g>

      {/* Molar 2 */}
      <g transform="translate(520, 175)">
        <rect
          x="10"
          y="30"
          width="140"
          height="150"
          rx="40"
          fill="url(#tooth-enamel)"
          stroke="#e2e8f0"
          strokeWidth="2"
        />
        <path
          d="M 35 60 Q 80 105, 125 60 M 35 150 Q 80 105, 125 150"
          stroke="#78350f"
          strokeWidth="3"
          fill="none"
        />
      </g>

      {/* Clinical Lighting Flash Reflections */}
      <ellipse cx="380" cy="210" rx="16" ry="8" fill="#ffffff" opacity="0.6" transform="rotate(-20 380 210)" />
      <ellipse cx="560" cy="220" rx="14" ry="7" fill="#ffffff" opacity="0.6" transform="rotate(-20 560 220)" />

      {/* Watermark info */}
      <g fill="#ffffff" fillOpacity="0.8" fontSize="12" fontFamily="sans-serif">
        <text x="30" y="40" fontWeight="bold">کلینیکال ماکرو فتوگرافی (Intraoral HD)</text>
        <text x="30" y="60" fontSize="10">نمای اکلوزال دندان‌های مولر و پره‌مولر</text>
      </g>
    </svg>
  );
};
