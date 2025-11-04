document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("projectForm");
  const checklist = document.getElementById("checklist");
  const resultDiv = document.getElementById("result");

  const checklistItems = [
    { id: 1, text: "Use of renewable energy" },
    { id: 2, text: "Water recycling and reuse" },
    { id: 3, text: "Efficient lighting systems" },
    { id: 4, text: "Low-flow plumbing fixtures" },
    { id: 5, text: "Sustainable building materials" },
    { id: 6, text: "Natural ventilation design" },
    { id: 7, text: "Rainwater harvesting" },
    { id: 8, text: "Waste management plan" },
  ];

  // Render checklist dynamically
  checklist.innerHTML = checklistItems
    .map(
      (item) => `
        <label>
          <input type="checkbox" value="${item.id}"> ${item.text}
        </label>
      `
    )
    .join("");

  // Handle form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const type = document.getElementById("type").value.trim();
    const area = parseFloat(document.getElementById("area").value);
    const inputs = checklistItems.map((item) => ({
      id: item.id,
      selected: document.querySelector(`input[value="${item.id}"]`).checked,
    }));

    if (!name || !type || isNaN(area)) {
      alert("Please fill all fields before evaluating.");
      return;
    }

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, area, inputs }),
      });

      const data = await response.json();

      if (response.ok) {
        resultDiv.innerHTML = `
          <h3>Estimated IGBC Rating</h3>
          <p><strong>Building Name:</strong> ${data.name}</p>
          <p><strong>Type:</strong> ${data.type}</p>
          <p><strong>Area:</strong> ${data.area} sq.m</p>
          <p><strong>Total Points:</strong> ${data.total_points}</p>
          <p><strong>Rating:</strong> <span class="rating">${data.rating}</span></p>
        `;
      } else {
        resultDiv.innerHTML = `<p style="color:red;">Error: ${data.error}</p>`;
      }
    } catch (err) {
      console.error(err);
      resultDiv.innerHTML = `<p style="color:red;">Failed to connect to the server.</p>`;
    }
  });
});
