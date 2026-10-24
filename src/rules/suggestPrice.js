// Suggest a rate from the main (first) room: round to nearest 100, band ±100.
export function suggestPrice(intake) {
  const p = +intake.rooms[0].price || 0;
  const value = Math.round(p / 100) * 100;
  return { value, low: value - 100, high: value + 100 };
}
