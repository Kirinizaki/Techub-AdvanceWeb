export async function edgeFunctionErrorMessage(error, fallback = "The request could not be completed.") {
  const response = error?.context;
  if (response && typeof response.clone === "function") {
    try {
      const body = await response.clone().json();
      if (typeof body?.error === "string" && body.error) return body.error;
    } catch {
      // Keep the generic client error when the function response isn't JSON.
    }
  }
  return error?.message || fallback;
}
