
export default async function callAPI(
  endpoint,
  method = "GET",
  body = null
) {
  const authToken = localStorage.getItem("token");

  const headers = {
    Authorization: authToken,
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(endpoint, {
      method,
      headers,
      ...(body !== null && method !== "GET"
        ? { body: JSON.stringify(body) }
        : {}),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.message || "API request failed");
    }

    console.log("result", result);
    return result;
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
}
