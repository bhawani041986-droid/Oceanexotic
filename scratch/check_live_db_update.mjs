async function check() {
  console.log("Fetching https://oceanexotic.com/api/db-update...");
  try {
    const res = await fetch("https://oceanexotic.com/api/db-update");
    console.log("Status:", res.status);
    console.log("Headers:", Object.fromEntries(res.headers.entries()));
    const text = await res.text();
    console.log("Response Body:", text);
  } catch (err) {
    console.error("Error fetching:", err);
  }
}
check();
