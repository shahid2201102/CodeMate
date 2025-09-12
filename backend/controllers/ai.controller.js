import * as ai from '../services/ai.service.js';

export const getResult = async (req, res) => {
  try {
    const { userPrompt } = req.query;
     if (!userPrompt) {
      return res.status(400).send({ error: "The 'userPrompt' query parameter is missing." });
    }
    const result = await ai.generateResult(userPrompt);
    res.send(result);
  } catch (error) {
    console.error("Error in getResult:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
