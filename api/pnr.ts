export default async function handler(req: any, res: any) {
  const { pnr } = req.query;

  if (!pnr || typeof pnr !== "string" || !/^[A-Za-z0-9]{10}$/.test(pnr)) {
    return res.status(400).json({ success: false, message: "Invalid PNR. Must be 10 alphanumeric characters." });
  }

  const apiKey = process.env.RAPIDAPI_KEY || "0c70d5aad3msh2c30b36563f687dp120041jsnb56d94f808b9";

  try {
    const response = await fetch(
      `https://irctc-indian-railway-pnr-status.p.rapidapi.com/getPNRStatus/${pnr}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "irctc-indian-railway-pnr-status.p.rapidapi.com"
        }
      }
    );

    const data = await response.json();
    res.status(response.ok ? 200 : 502).json({ success: response.ok, ...(response.ok ? { data } : { message: "PNR lookup failed" }) });
  } catch (error) {
    res.status(502).json({ success: false, message: "Failed to fetch PNR data" });
  }
}
