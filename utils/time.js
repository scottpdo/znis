// each tick of environment = 10 seconds, starts at 6:00am
export default function time(environment) {
  const t = environment.time / 6;
  let hours = (Math.floor(t / 60) % 12).toString();
  if (hours === "0") hours = "12";
  let minutes = Math.floor(t % 60).toString();
  if (minutes.length === 1) minutes = "0" + minutes;
  let ampm = (t / 60) % 24 < 12 ? "am" : "pm";
  return hours + ":" + minutes + ampm;
}
