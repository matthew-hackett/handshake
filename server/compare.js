export function compare(a, b, threshold = 0.75) {
  const resample = (arr, n) =>
    Array.from({ length: n }, (_, i) =>
      arr[Math.round(i * (arr.length - 1) / (n - 1))]
    );

  const norm = (arr) => {
    const mean = arr.reduce((s, x) => s + x, 0) / arr.length;
    const std = Math.sqrt(arr.reduce((s, x) => s + (x - mean) ** 2, 0) / arr.length);
    return std === 0 ? arr.map(() => 0) : arr.map((x) => (x - mean) / std);
  };

  const energy = (arr) => arr.reduce((s, x) => s + x * x, 0) / arr.length;

  const pearson = (x, y) => {
    const mx = x.reduce((a, b) => a + b, 0) / x.length;
    const my = y.reduce((a, b) => a + b, 0) / y.length;
    const num = x.reduce((s, v, i) => s + (v - mx) * (y[i] - my), 0);
    const den = Math.sqrt(
      x.reduce((s, v) => s + (v - mx) ** 2, 0) *
      y.reduce((s, v) => s + (v - my) ** 2, 0)
    );
    return den === 0 ? 0 : num / den;
  };

  // Determine input format and extract per-axis signals + magnitude
  let axesA, axesB, magA, magB;

  if (a[0] && typeof a[0] === 'object' && !Array.isArray(a[0])) {
    // {x, y, z}[] format (new client format)
    axesA = ['x', 'y', 'z'].map(k => a.map(s => s[k]));
    axesB = ['x', 'y', 'z'].map(k => b.map(s => s[k]));
    magA = a.map(s => Math.sqrt(s.x ** 2 + s.y ** 2 + s.z ** 2));
    magB = b.map(s => Math.sqrt(s.x ** 2 + s.y ** 2 + s.z ** 2));
  } else if (Array.isArray(a[0])) {
    // [[x,y,z]] format
    axesA = [0, 1, 2].map(i => a.map(s => s[i]));
    axesB = [0, 1, 2].map(i => b.map(s => s[i]));
    magA = a.map(([x, y, z]) => Math.sqrt(x ** 2 + y ** 2 + z ** 2));
    magB = b.map(([x, y, z]) => Math.sqrt(x ** 2 + y ** 2 + z ** 2));
  } else {
    // flat magnitude array (legacy)
    axesA = [a];
    axesB = [b];
    magA = a;
    magB = b;
  }

  // Reject if one phone barely moved
  const eA = energy(magA), eB = energy(magB);
  const energyRatio = Math.max(eA, eB) / (Math.min(eA, eB) || 1e-6);
  if (energyRatio > 3) {
    console.log("Rejected: energy mismatch", energyRatio);
    return false;
  }

  // Compare each axis: resample → z-score → |pearson|
  const TARGET_LEN = 64;
  const correlations = axesA.map((axA, i) => {
    const axB = axesB[i];
    const rA = norm(resample(axA, TARGET_LEN));
    const rB = norm(resample(axB, TARGET_LEN));
    return Math.abs(pearson(rA, rB));
  });

  const avgCorr = correlations.reduce((s, v) => s + v, 0) / correlations.length;
  console.log({ correlations, avgCorr, energyRatio });

  return avgCorr > threshold;
}
