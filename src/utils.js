const parseColorIntensity = colorIntensity => {
  const [color, intensity] = colorIntensity.trim().split(" ").map(Number);
  return {
    hue: Math.round((color / 360) * 65535),
    brightness: Math.round((intensity / 100) * 254),
  };
};
const processSecondAgentResponse = response => {
  const colorPattern =
    /\b(\d{1,3} \d{1,3}, \d{1,3} \d{1,3}, \d{1,3} \d{1,3})\b/;
  const match = response.match(colorPattern);
  return match ? match[0].replace(/"/g, "").trim().split(",") : [];
};

module.exports = { parseColorIntensity, processSecondAgentResponse };
