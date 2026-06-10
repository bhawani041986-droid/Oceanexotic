async function test() {
  const res = await fetch('http://localhost:3000/api/chat/send_message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversation_id: 1,
      sender_id: 'FLEET-8',
      message_text: 'Test message'
    })
  });
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Response:', data);
}

test();
