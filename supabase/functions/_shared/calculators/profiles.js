// Steel profile weights, copied from the "Profiles" tab of the Devis Client sheet.
// Linear profiles are kg per metre; "tole N" (plate, N mm thick) is kg per m²; "_" means "not assigned" (0).
// NOTE: a few purlin values look like typos in the sheet (e.g. Pane C 160/2.0 = 8.5 and /3.0 = 8.5 while
// /2.5 = 8.2). They are kept as-is so the site matches the sheet; fix them here once confirmed.

export const PROFILE_WEIGHTS = {
  "IPE 80": 6.2, "IPE 80 A": 5, "IPE 80 AA": 4.9, "IPE 80 AAA": 4.7, "IPE 80 AAAA": 3.9,
  "IPE 100": 8.3, "IPE 100 A": 6.9, "IPE 100 AA": 6.7, "IPE 100 AAA": 6.41, "IPE 100 AAAA": 5.46,
  "IPE 120": 10.6, "IPE 140": 13.2, "IPE 160": 16.1, "IPE 180": 19.2, "IPE 200": 22.9,
  "IPE 220": 26.7, "IPE 240": 31.3, "IPE 270": 36.8, "IPE 300": 43.1, "IPE 330": 50.1,
  "IPE 360": 58.2, "IPE 400": 67.6, "IPE 450": 79.1, "IPE 500": 92.5, "IPE 550": 108.1, "IPE 600": 124.1,
  "HEA 100": 17.1, "HEA 120": 20.3, "HEA 140": 25.2, "HEA 160": 31,
  "Tube 100/100/3": 9.19,
  "UPN 80": 8.8, "UPN 100": 10.8, "UPN 120": 13.6, "UPN 140": 16.32, "UPN 160": 19.2,
  "CE 40": 2.46, "CE 45": 3.44, "CE 50": 3.84, "CE 60": 5.53, "CE 70": 7.52, "CE 80": 9.81,
  "Pane C 100/2.0": 3.5, "Pane C 100/2.5": 4.55, "Pane C 100/3.0": 5.33,
  "Pane C 120/2.0": 3.4, "Pane C 120/2.5": 5.3, "Pane C 120/3.0": 8.04,
  "Pane C 140/2.0": 5.38, "Pane C 140/2.5": 6.66, "Pane C 140/3.0": 7.92,
  "Pane C 160/2.0": 8.5, "Pane C 160/2.5": 8.2, "Pane C 160/3.0": 8.5,
  "Pane C 180/2.0": 5.82, "Pane C 180/2.5": 7.21, "Pane C 180/3.0": 8.58,
  "Pane C 200/2.0": 6.54, "Pane C 200/2.5": 8.11, "Pane C 200/3.0": 9.67,
  "Rond 16": 1.61, "Rond 18": 2.04, "Rond 20": 2.51, "Rond 25": 3.04, "Rond 30": 5.65, "Rond 35": 7.7,
  "tole 3": 16, "tole 4": 32, "tole 5": 40, "tole 6": 48, "tole 8": 64, "tole 10": 80,
  "tole 12": 96, "tole 15": 120, "tole 20": 160, "tole 25": 200, "tole 30": 240,
  _: 0,
};

export function profileWeight(name) {
  const w = PROFILE_WEIGHTS[name];
  if (w === undefined) throw new Error(`Unknown steel profile: ${name}`);
  return w;
}
