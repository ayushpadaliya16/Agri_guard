async function testAI() {
    try {
        console.log("Testing AI...");
        const response = await fetch('http://localhost:3001/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: 'Carbofuran Furadan' })
        });
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Test Failed:", error);
    }
}
testAI();
