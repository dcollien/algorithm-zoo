export const M = {
  TAU: Math.PI * 2,
  vary: function(amt: number) {
    return 2 * amt * (Math.random() - 0.5);
  },
  rand: function(amt: number) {
    return amt * Math.random();
  },
  randInt: function(amt: number) {
    return Math.floor(M.rand(amt));
  },
  lerp: function(t: number, from: number, to: number) {
    return t * to + (1 - t) * from;
  },
  sq: function(x: number) {
    return x * x;
  },
  cube: function(x: number) {
    return x * x * x;
  },
  clamp: (values: number[], max: number, min = 0) =>
    values.map(value => Math.min(max, Math.max(min, value))),
  sum: (...args: number[]) => args.reduce((acc: number, val: number) => acc + val, 0),
  product: (...args: number[]) => args.reduce((acc: number, val: number) => acc * val, 1),
  fmodr: (x: number, y: number) => x - y * Math.floor(x / y),
  modCircle: (theta: number) => M.fmodr(theta, M.TAU)
};
