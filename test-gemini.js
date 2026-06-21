const key = 'AQ.Ab8RN6LF64kr4xRR27iUBuK_UhtVQ0IqS61zpNqJqJHdILfsGA';

async function testModel(model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Respond only with OK" }] }]
      })
    });
    const status = response.status;
    const body = await response.json();
    console.log(`[${model}] Status: ${status}`);
    if (status !== 200) {
      console.log(`[${model}] Error:`, JSON.stringify(body, null, 2));
    } else {
      console.log(`[${model}] Success:`, body?.candidates?.[0]?.content?.parts?.[0]?.text);
    }
  } catch (err) {
    console.error(`[${model}] Exception:`, err.message);
  }
}

async function run() {
  await testModel('gemini-2.5-flash');
  await testModel('gemini-2.0-flash');
  await testModel('gemini-2.0-flash-lite');
  await testModel('gemini-flash-lite-latest');
  await testModel('gemini-pro-latest');
}

run();
