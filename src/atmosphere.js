const atmospheres = [
  { name: "Clear Sky", icon: "🌤️", intensity: 0.2 },
  { name: "Gentle Breeze", icon: "🍃", intensity: 0.4 },
  { name: "Misty Morning", icon: "🌫️", intensity: 0.6 },
  { name: "Light Rain", icon: "🌧️", intensity: 0.7 },
  { name: "Golden Hour", icon: "🌅", intensity: 0.3 },
  { name: "Starlit Night", icon: "🌙", intensity: 0.5 },
];

export function getRandomAtmosphere() {
  const index = Math.floor(Math.random() * atmospheres.length);
  return atmospheres[index];
}

export function getAllAtmospheres() {
  return [...atmospheres];
}

export function getAtmosphereByName(name) {
  return atmospheres.find((a) => a.name === name) || null;
}
