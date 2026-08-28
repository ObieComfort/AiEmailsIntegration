import 'dotenv/config';

export async function getAccessToken() {
  const res = await fetch(
    `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      }),
    }
  );
  const data = await res.json();
  return data.access_token;
}

export async function translateEntryID(userEmail, entryID) {
    const token = await getAccessToken();
    const res = await fetch(
        `https://graph.microsoft.com/v1.0/users/${userEmail}/translateExchangeIds`,
        {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
            body: JSON.stringify({
                inputIds: [entryID],
                sourceIdType: 'entryId',
                targetIdType: 'restId'
            })
        }
    );

    const data = await res.json();
    if(!res.ok || !data.value) {
        throw new Error(`Failed to translate ID: ${res.status} - ${JSON.stringify(data)}`);
    }
    return data.value[0].targetId;
}

export async function setEmailLabel(userEmail, messageID, label) {
    const token = await getAccessToken();
    const res = await fetch(
        `https://graph.microsoft.com/v1.0/users/${userEmail}/messages/${messageID}`,
        {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ categories: [label]})
        }
    );

    if(!res.ok) {
        const err = await res.text();
        throw new Error(`Failed to set label: ${res.status} - ${err}`);
    }
}

export async function getEmailByID(userEmail, messageID) {
    const token = await getAccessToken();
    const res = await fetch(
        `https://graph.microsoft.com/v1.0/users/${userEmail}/messages/${messageID}?$select=subject,uniqueBody`,
        { headers: { Authorization: `Bearer ${token}`, Prefer: 'outlook.body-content-type="text"' } }
    );
    return res.json();
}

export async function listRecentMessages(userEmail, top = 5) {
  const token = await getAccessToken();
  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${userEmail}/messages?$top=${top}`,
    { headers: { Authorization: `Bearer ${token}`, Prefer: 'outlook.body-content-type="text"'} } //Can add `Prefer: 'outlook.body-content-type="text"'` to make it try to give plain text?
  );
  const data = await res.json();
  return data.value;
}

export async function hexToGraphFormat(hexID) {
    const bytes = Buffer.from(hexID, 'hex');
    let base64 = bytes.toString('base64');
    const paddingCount = (base64.match(/=+$/) || [''])[0].length;
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return base64 + paddingCount;
}