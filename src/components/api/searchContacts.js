export async function searchContacts(searchAPI, query, token) {
  const url = `${searchAPI}${encodeURIComponent(query)}`;

  const requestOptions = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  try {
    const response = await fetch(url, requestOptions);
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.log(error);
    return null;
  }
}
