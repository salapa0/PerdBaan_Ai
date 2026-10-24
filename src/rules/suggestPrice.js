// Rule-based price suggestion from the owner's OWN price (not market data).
const round50 = (n) => Math.round(n / 50) * 50;

export function suggestPrice(intake) {
  const rooms = (intake && intake.rooms) || [];
  if (!rooms.length) return { value: 0, low: 0, high: 0 };
  // main room = the type with the most rooms; ties → cheapest
  const main = rooms.slice().sort((a, b) => (b.count - a.count) || (a.price - b.price))[0];
  const value = round50(main.price);
  return {
    value,
    low: round50(value * 0.9),
    high: round50(value * 1.15),
  };
}
