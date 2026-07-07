export async function analyzeMessage(message: string) {
  const response = await fetch(
    "http://192.168.1.40:5000/predict",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        message,
      }),
    }
  );

  return response.json();
}