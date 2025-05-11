
import { toast } from "sonner";

const API_URL = "http://localhost:8080";

export type ParaphraseResponse = {
  paraphrased_text: string;
};

export type HistoryItem = {
  _id: string;
  original_text: string;
  paraphrased_text: string;
  created_at: string;
};

export const paraphraseText = async (text: string): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/api/paraphrase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as ParaphraseResponse;
    return data.paraphrased_text;
  } catch (error) {
    console.error("Error paraphrasing text:", error);
    toast.error("Failed to paraphrase text. Please try again.");
    throw error;
  }
};

export const getParaphrasingHistory = async (): Promise<HistoryItem[]> => {
  try {
    const response = await fetch(`${API_URL}/api/history`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json() as HistoryItem[];
  } catch (error) {
    console.error("Error fetching history:", error);
    toast.error("Failed to load paraphrasing history.");
    throw error;
  }
};
