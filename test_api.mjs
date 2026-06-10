

async function test() {
  try {
    console.log("Hitting API...");
    const res = await fetch('http://127.0.0.1:3000/api/system/optimize_assets');
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

test();
