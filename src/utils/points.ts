// Free Fire Esports Point System
// Booyah (#1): 12 pts
// #2: 9 pts, #3: 8 pts, #4: 7 pts, #5: 6 pts, #6: 5 pts, #7: 4 pts, #8: 3 pts, #9: 2 pts, #10: 1 pt
// #11 & #12: 0 pts
// Each kill = 1 pt

export const getPlacementPoints = (rank: number): number => {
  const table: Record<number, number> = {
    1: 12,
    2: 9,
    3: 8,
    4: 7,
    5: 6,
    6: 5,
    7: 4,
    8: 3,
    9: 2,
    10: 1,
    11: 0,
    12: 0,
  };
  return table[rank] !== undefined ? table[rank] : 0;
};

export const calculateMatchPoints = (placement: number, kills: number): {
  placementPts: number;
  killPts: number;
  totalPts: number;
} => {
  const placementPts = getPlacementPoints(placement);
  const killPts = Math.max(0, Number(kills) || 0);
  return {
    placementPts,
    killPts,
    totalPts: placementPts + killPts,
  };
};
