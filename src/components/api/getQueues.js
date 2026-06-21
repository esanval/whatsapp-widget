const DEFAULT_API_HOST = "api.wxcc-eu2.cisco.com";

export async function getQueues(orgId, userId, token, apiHost = DEFAULT_API_HOST) {
  const url = `https://${apiHost}/organization/${orgId}/v2/contact-service-queue/by-user-id/${userId}/agent-based-queues`;

  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  };

  try {
    const response = await fetch(url, requestOptions);
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}
