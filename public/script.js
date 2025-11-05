document.addEventListener("DOMContentLoaded", () => {
  // --- 1. DATA ---
  // Updated with all 6 criteria, new descriptions, and more items
  const criteriaData = {
    site: {
      title: "🌳 Site Selection and Planning",
      info: "Focuses on sustainable site choice, preserving natural features, and reducing environmental impact during construction.",
      items: [
        { id: "s1", text: "Site is NOT on sensitive land (wetlands, prime farmland)" },
        { id: "s2", text: "Preserved over 50% of existing natural habitat" },
        { id: "s3", text: "Implemented soil erosion control measures" },
        { id: "s4", text: "Reduced site disturbance during construction" },
      ],
    },
    water: {
      title: "💧 Water Conservation",
      info: "Encourages efficient water use, rainwater harvesting, and wastewater treatment.",
      items: [
        { id: "w1", text: "On-site wastewater treatment (e.g., STP)" },
        { id: "w2", text: "Low-flow plumbing fixtures (taps, showers)" },
        { id: "w3", text: "Rainwater harvesting system installed (min 50% of roof)" },
        { id: "w4", text: "Water-efficient landscaping (drip irrigation, xeriscaping)" },
        { id: "w5", text: "Use of recycled/treated water for flushing" },
      ],
    },
    energy: {
      title: "⚡️ Energy Efficiency",
      info: "Promotes optimized energy performance, use of renewable energy, and efficient lighting and HVAC systems.",
      items: [
        { id: "e1", text: "On-site renewable energy (Solar PV, etc.)" },
        { id: "e2", text: "100% LED lighting systems" },
        { id: "e3", text: "Natural ventilation design maximized" },
        { id: "e4", text: "High-performance insulation (walls and roof)" },
        { id: "e5", text: "Energy-efficient HVAC system (VRV/VRF, etc.)" },
      ],
    },
    materials: {
      title: "🧱 Materials & Resources",
      info: "Focuses on using sustainable, recycled, and local materials, and managing construction waste.",
      items: [
        { id: "m1", text: "Use of recycled content in materials" },
        { id: "m2", text: "Segregated waste management plan (post-occupancy)" },
        { id: "m3", text: "Use of local materials (within 500km)" },
        { id: "m4", text: "Use of certified green building materials" },
        { id: "m5", text: "Diverted > 75% of construction waste from landfill" },
      ],
    },
    indoor: {
      title: "🌬️ Indoor Environmental Quality",
      info: "Aims to improve indoor air quality, natural light, ventilation, and occupant comfort and well-being.",
      items: [
        { id: "i1", text: "Maximized daylighting for > 75% of spaces" },
        { id: "i2", text: "Use of low-VOC paints, adhesives, and sealants" },
        { id: "i3", text: "Provided views to the exterior for > 90% of occupants" },
        { id: "i4", text: "Cross-ventilation design for fresh air" },
      ],
    },
    innovation: {
      title: "💡 Innovation & Design Process",
      info: "Awards points for using innovative green technologies or strategies that exceed the standard requirements.",
      items: [
        { id: "in1", text: "Employed an IGBC Accredited Professional (AP)" },
        { id: "in2", text: "Implemented innovative green technology (e.g., green roof)" },
        { id: "in3", text: "Exceeded base requirements significantly in one category" },
      ],
    },
  };

  // --- 2. STATE TRACKING ---

  // Create a flat list of all item IDs
  const allItemIds = Object.values(criteriaData).flatMap(c => c.items.map(i => i.id));
  
  // Object to store the checked state for ALL items
  const checklistState = allItemIds.reduce((acc, id) => {
    acc[id] = false;
    return acc;
  }, {});

  // NEW: Object to track if a modal has been opened
  const criteriaViewed = {
    site: false,
    water: false,
    energy: false,
    materials: false,
    indoor: false,
    innovation: false,
  };

  // --- 3. MODAL & FORM ELEMENTS ---
  const form = document.getElementById("projectForm");
  const resultDiv = document.getElementById("result");
  const modal = document.getElementById("criteriaModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalInfo = document.getElementById("modalInfo");
  const modalChecklist = document.getElementById("modalChecklist");
  const closeModalBtn = document.querySelector(".close-btn");

  // --- 4. MODAL LOGIC ---

  // Function to open the modal and populate it with data
  const openModal = (criterionKey) => {
    const data = criteriaData[criterionKey];
    if (!data) return;

    // --- NEW: Mark this criterion as viewed ---
    criteriaViewed[criterionKey] = true;
    // Visually mark the hotspot as "viewed"
    const hotspot = document.querySelector(`[data-criterion="${criterionKey}"]`);
    if (hotspot) {
        hotspot.style.backgroundColor = "rgba(0, 128, 0, 0.7)"; // Green
        hotspot.style.border = "2px solid white";
    }

    // 1. Populate text content (using the new .criteria-description style)
    modalTitle.textContent = data.title;
    modalInfo.textContent = data.info; // This targets the <p> tag

    // 2. Render checklist for this criterion
    // Read from our checklistState object to preserve checked state
    let checklistHtml = "";
    data.items.forEach(item => {
        const isChecked = checklistState[item.id] || false;
        
        checklistHtml += `
          <label>
            <input type="checkbox" value="${item.id}" data-criterion="${criterionKey}" ${isChecked ? 'checked' : ''}> ${item.text}
          </label>
        `;
    });
    modalChecklist.innerHTML = checklistHtml;

    // 3. Show the modal
    modal.style.display = "block";

    // 4. Add event listeners to update state
    // Must be done *after* innerHTML is set
    modalChecklist.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        checklistState[e.target.value] = e.target.checked;
      });
    });
  };

  // Function to close the modal
  const closeModal = () => {
    modal.style.display = "none";
  };

  // Add click listeners to close modal
  closeModalBtn.addEventListener("click", closeModal);
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // --- 5. HOTSPOT CLICK LISTENERS ---
  
  // Add click listeners to all hotspots
  document.querySelectorAll(".hotspot").forEach((spot) => {
    spot.addEventListener("click", () => {
      // Get the criterion from the 'data-criterion' attribute
      const criterionKey = spot.getAttribute("data-criterion");
      openModal(criterionKey);
    });
  });

  // --- 6. FORM SUBMISSION LOGIC ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Stop the form from reloading the page

    const name = document.getElementById("name").value.trim();
    const type = document.getElementById("type").value.trim();
    const area = parseFloat(document.getElementById("area").value);

    // 6a. Validate basic fields
    if (!name || !type || isNaN(area) || area <= 0) {
      resultDiv.innerHTML = `<p style="color:red;">Please fill all project fields with valid data.</p>`;
      resultDiv.style.backgroundColor = "#fff0f0"; // Error background
      return;
    }

    // 6b. --- NEW: Validate if all criteria have been viewed ---
    const allViewed = Object.values(criteriaViewed).every(viewed => viewed === true);
    
    if (!allViewed) {
      resultDiv.innerHTML = `<p style="color:red;">Please click on all 6 hotspots (🌳,💧,⚡️,🧱,🌬️,💡) to review all criteria before submitting.</p>`;
      resultDiv.style.backgroundColor = "#fff0f0";
      return;
    }
    
    // Reset result div on successful validation
    resultDiv.innerHTML = `<p>Evaluating...</p>`;
    resultDiv.style.backgroundColor = "#f1f8e9"; // Back to normal

    // 6c. Aggregate all inputs
    // Map them, reading their state from the checklistState object
    const inputs = allItemIds.map((id) => {
        return {
          id: id,
          selected: checklistState[id] || false,
        }
    });
    // --- End of aggregation ---

    // 6d. Send to server
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
          <p><strong>Total Points (out of 100):</strong> ${data.total_points}</p>
          <p><strong>Rating:</strong> <span class="rating">${data.rating}</span></p>
        `;
        resultDiv.style.backgroundColor = "#f1f8e9";
      } else {
        resultDiv.innerHTML = `<p style="color:red;">Error: ${data.error}</p>`;
        resultDiv.style.backgroundColor = "#fff0f0";
      }
    } catch (err) {
      console.error(err);
      resultDiv.innerHTML = `<p style="color:red;">Failed to connect to the server.</p>`;
      resultDiv.style.backgroundColor = "#fff0f0";
    }
  });
});