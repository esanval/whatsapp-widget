const DEFAULT_API_HOST = "api.wxcc-eu2.cisco.com";

export async function getAgentIdByCiUserId(orgId, ciUserId, token, apiHost = DEFAULT_API_HOST) {
  const url = `https://${apiHost}/organization/${orgId}/v2/user/by-ci-user-id/${ciUserId}`;

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
    return result.id || null;
  } catch (error) {
    console.log(error);
    return null;
  }
}
