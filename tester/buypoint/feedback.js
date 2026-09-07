(() => {
  const DESTINATION = "tester-feedback@actionforgelabs.com";
  const main = document.querySelector("main");
  if (!main) return;

  const section = document.createElement("section");
  section.className = "card";
  section.id = "testFeedback";
  section.innerHTML = `
    <h2>Send Your Test Results</h2>
    <p>Tell us what worked and every problem you found. If possible, take a screenshot when a problem occurs.</p>
    <label class="small" for="testerNotes">What happened, and what were you trying to do?</label>
    <textarea id="testerNotes" rows="6" style="width:100%;margin-top:6px;border-radius:12px;border:1px solid var(--line);padding:12px;background:#091423;color:var(--text);font:inherit" placeholder="Describe the result, confusion, incorrect answer, or failure."></textarea>
    <div class="row" style="margin-top:10px">
      <button id="exportTestResults" type="button">DOWNLOAD TEST RESULTS</button>
      <a id="emailTestResults" class="button" href="#">EMAIL TEST RESULTS</a>
    </div>
    <p class="small">Download the test-results file, then email it with your notes and screenshots to <b>tester-feedback@actionforgelabs.com</b>. The email opens for your review and is not sent automatically.</p>
    <p id="feedbackStatus" class="small"></p>
  `;
  main.appendChild(section);

  function receipt() {
    const release = document.querySelector("[data-buy-point-release]")?.dataset.buyPointRelease || "unknown";
    return {
      kind: "BuyPoint private tester feedback",
      release,
      captured_at: new Date().toISOString(),
      page: location.pathname,
      browser: navigator.userAgent,
      input_method: document.querySelector(".method.active")?.dataset.method || "unknown",
      entry_status: document.querySelector("#entryStatus")?.textContent || "",
      product: document.querySelector("#productName")?.textContent || "",
      guidance: document.querySelector("#verdict")?.textContent || "",
      tester_notes: document.querySelector("#testerNotes")?.value.trim() || "",
      privacy: "No API keys, passwords, precise location, local saved-item contents, or provider secrets are included.",
    };
  }

  document.querySelector("#exportTestResults").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(receipt(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BuyPoint-Test-Results-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    document.querySelector("#feedbackStatus").textContent =
      "Test results downloaded. Attach the file and any screenshots to the feedback email.";
  });

  document.querySelector("#emailTestResults").addEventListener("click", event => {
    event.preventDefault();
    const notes = document.querySelector("#testerNotes").value.trim();
    const subject = encodeURIComponent("BuyPoint private test results");
    const body = encodeURIComponent(
      `Hello ActionForge Labs,\n\nMy BuyPoint test notes:\n${notes || "[Please add your observations here.]"}\n\nI will attach the downloaded BuyPoint test-results file and any screenshots before sending.\n`,
    );
    location.href = `mailto:${DESTINATION}?subject=${subject}&body=${body}`;
  });
})();
