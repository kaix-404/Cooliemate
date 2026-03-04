export default async function handler(req: any, res: any) {
  const { pnr } = req.query;

  if (!pnr) {
    return res.status(400).json({ error: "PNR is required" });
  }

  try {
    const response = await fetch(
      `https://irctc-indian-railway-pnr-status.p.rapidapi.com/getPNRStatus/6461250996`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": process.env.c2bf8bc942msh204a9b90e2fdd7cp1e49d2jsn8dff37d4a158 as string,
          "x-rapidapi-host": "irctc-indian-railway-pnr-status.p.rapidapi.com"
        }
      }
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch PNR data" });
  }
}