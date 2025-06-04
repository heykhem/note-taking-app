let elements = {
  noteSaveBtn: document.querySelector(".modal-save"),
  noteColors: document.querySelectorAll(".color-box"),
  noteContainer: document.querySelector(".card-body"),
  notePinContainer: document.querySelector(".card-pinned"),
  pinCardHeading: document.querySelector(".card-heading-top"),
  unPinCardHeading: document.querySelector(".card-heading"),
  cardTitle: document.querySelector(".cardTitle"),
  cardContent: document.querySelector(".cardContent"),
  editViewModal: document.querySelector(".view-card-modal"),
  viewTitle: document.querySelector("#view-card-title"),
  viewContent: document.querySelector("#view-card-content"),
  newNote: document.querySelector(".new-note-modal"),
  cardMode: document.querySelector(".list-cta"),
  searchInput: document.querySelector("#note-search"),
  deleteModal: document.querySelector(".delete-card-modal"),
};

document.addEventListener("DOMContentLoaded", function () {
  loadNotes(readLocalStorageNotes());
  initializeSearch();
});

function cardModeChange(condition) {
  if (condition) {
    let currentFlexStyle = document.querySelector(".card-body");
    let currentFlex2Style = document.querySelector(".card-pinned");
    let cardStyle = document.querySelectorAll(".cards");
    cardStyle.forEach((card) => {
      card.style.width = "100%";
    });
    currentFlexStyle.style.flexFlow = "column nowrap";
    currentFlex2Style.style.flexFlow = "column nowrap";
  } else {
    let currentFlexStyle = document.querySelector(".card-body");
    let currentFlex2Style = document.querySelector(".card-pinned");
    let cardStyle = document.querySelectorAll(".cards");
    cardStyle.forEach((card) => {
      card.style.width = "250px";
    });
    currentFlexStyle.style.flexFlow = "row wrap";
    currentFlex2Style.style.flexFlow = "row wrap";
  }
}

elements.cardMode.addEventListener("click", (e) => {
  e.preventDefault();
  let currentMode = document.querySelector(".list-cta");
  if (currentMode.getAttribute("data-tooltip") == "Stack View") {
    currentMode.innerHTML = `<span class="material-symbols-outlined">
grid_view
</span>`;
    currentMode.setAttribute("data-tooltip", "Grid View");
    localStorage.setItem("note-view", "stack-view");
    cardModeChange(true);
  } else {
    currentMode.innerHTML = `<span class="material-symbols-outlined">
view_agenda
</span>`;
    currentMode.setAttribute("data-tooltip", "Stack View");
    localStorage.setItem("note-view", "grid-view");
    cardModeChange(false);
  }
});

function modeSetup() {
  let cardMode = localStorage.getItem("note-view");
  let currentMode = document.querySelector(".list-cta");
  if (cardMode == "stack-view") {
    currentMode.innerHTML = `<span class="material-symbols-outlined">
grid_view
</span>`;
    currentMode.setAttribute("data-tooltip", "Grid View");
    cardModeChange(true);
  } else {
    currentMode.innerHTML = `<span class="material-symbols-outlined">
view_agenda
</span>`;
    currentMode.setAttribute("data-tooltip", "Stack View");
    cardModeChange(false);
  }
}

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Search Filter
let typingTimer;
let currentIconIsSearch = true;
const delay = 500;

// Initialize search functionality
function initializeSearch() {
  const searchInput = elements.searchInput;
  const searchIcon = searchInput.nextElementSibling.querySelector("span");

  // Main search input handler
  searchInput.addEventListener("input", handleSearchInput);

  // Prevent form submission on Enter
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  });

  // Handle clear button clicks with event delegation
  document.addEventListener("click", handleClearClick);
}

function handleSearchInput(e) {
  e.preventDefault();
  e.stopPropagation();

  clearTimeout(typingTimer);
  typingTimer = setTimeout(performSearch, delay);
}

function performSearch() {
  const searchInput = document.querySelector("#note-search");
  const searchIcon = searchInput.nextElementSibling.querySelector("span");
  const currentQuery = searchInput.value.toLowerCase().trim();
  const noteHistory = readLocalStorageNotes();

  // Handle icon switching
  handleIconSwitch(searchIcon, currentQuery);

  // Filter and load notes
  const filteredNotes = filterNotesByQuery(noteHistory, currentQuery);
  loadNotes(currentQuery === "" ? noteHistory : filteredNotes);
}

function handleIconSwitch(searchIcon, query) {
  const shouldShowSearch = query === "";

  // Only animate if icon state needs to change
  if (shouldShowSearch && !currentIconIsSearch) {
    animateIconChange(searchIcon, "search", () => {
      searchIcon.parentElement.classList.remove("clear-search");
      currentIconIsSearch = true;
    });
  } else if (!shouldShowSearch && currentIconIsSearch) {
    animateIconChange(searchIcon, "close", () => {
      searchIcon.parentElement.classList.add("clear-search");
      currentIconIsSearch = false;
    });
  }
}

function animateIconChange(icon, newIcon, callback) {
  gsap.to(icon, {
    duration: 0.2,
    opacity: 0,
    scale: 0.8,
    rotate: newIcon === "search" ? -45 : 45,
    ease: "power2.in",
    onComplete: () => {
      icon.textContent = newIcon;
      callback();

      gsap.fromTo(
        icon,
        { opacity: 0, scale: 0.8, rotate: newIcon === "search" ? 45 : -45 },
        {
          duration: 0.2,
          opacity: 1,
          scale: 1,
          rotate: 0,
          ease: "power2.out",
        }
      );
    },
  });
}

function filterNotesByQuery(notes, query) {
  if (!query) return notes;

  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
  );
}

function handleClearClick(e) {
  // Use event delegation to handle dynamically added clear buttons
  if (e.target.closest(".clear-search")) {
    e.preventDefault();
    e.stopPropagation();
    clearSearchField();
  }
}

function clearSearchField() {
  const searchInput = document.querySelector("#note-search");

  if (searchInput) {
    // Clear and focus with animation
    gsap.to(searchInput, {
      duration: 0.1,
      scale: 0.98,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut",
      onComplete: () => {
        searchInput.value = "";
        searchInput.focus();

        // Trigger search to reset results and icon
        performSearch();
      },
    });
  }
}

// Read Note from local storage
function readLocalStorageNotes() {
  return JSON.parse(localStorage.getItem("notes")) || [];
}

// Coloring buttons
Array.from(elements.noteColors).forEach((el) => {
  el.style.background = el.dataset.color;
});

let addNoteBtn = document.querySelector(".main-cta");
let addModal = document.querySelector(".new-note-modal");

addNoteBtn.addEventListener("click", (e) => {
  e.preventDefault();
  resetColorBox();
  addModal.classList.add("active");
  document.body.classList.add("modal-open");
});

addModal.addEventListener("click", (e) => {
  if (e.target == addModal) {
    addModal.classList.remove("active");
    document.body.classList.remove("modal-open");

    resetInputField(); // Reset when clicking outside modal
  }
});

// Save Note
function saveNote() {
  let noteHistory = readLocalStorageNotes();

  // Get the INPUT and TEXTAREA elements (not contentEditable)
  let noteTitleEl = document.querySelector("#title");
  let noteContentEl = document.querySelector("#content");
  let notePinButton = document.querySelector(".modal-note-pin");

  // Check pin status - assuming unpinned by default, pinned when clicked
  let isPinned = notePinButton.classList.contains("pinned") || false;

  // Use .value for input/textarea elements
  let noteTitle = noteTitleEl.value.trim();
  let noteContent = noteContentEl.value.trim();
  let colourElement = Array.from(elements.noteColors).find((el) =>
    el.classList.contains("active")
  );

  let colour = "white"; // default

  if (colourElement) {
    const selectedColor = colourElement.dataset.color;
    colour = selectedColor === "black" ? "white" : selectedColor;
  }

  // Don't save empty notes
  if (!noteTitle && !noteContent) {
    alert("Please enter a title or content for your note.");
    return;
  }

  let values = {
    id: Date.now(), // Use timestamp for unique ID
    title: noteTitle || "", // Default title if empty
    content: noteContent,
    time: {
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    },
    pinned: isPinned,
    color: colour,
    label: "personal",
  };

  noteHistory.push(values);
  localStorage.setItem("notes", JSON.stringify(noteHistory));

  // Reset fields and close modal
  resetInputField();
  loadNotes(readLocalStorageNotes());
  addModal.classList.remove("active");
  document.body.classList.remove("modal-open");
}

function resetInputField() {
  // Reset INPUT and TEXTAREA elements using .value
  let noteTitleEl = document.querySelector("#title");
  let noteContentEl = document.querySelector("#content");

  if (noteTitleEl) noteTitleEl.value = "";
  if (noteContentEl) noteContentEl.value = "";

  // Reset pin button
  const pinButton = document.querySelector(".modal-note-pin");
  if (pinButton) {
    pinButton.classList.remove("pinned");
    pinButton.setAttribute("data-tooltip", "Pin Note");
    pinButton.children[0].classList.remove("filled");
  }

  // Reset any color selections if you have active color states
  const colorBoxes = elements.newNote.querySelectorAll(".color-box");
  colorBoxes.forEach((box) => box.classList.remove("active"));
}

function resetColorBox() {
  let colorBox = elements.newNote.querySelectorAll(".color-box");
  colorBox.forEach((el) => {
    el.classList.remove("active");
    el.style.outlineColor = "";
  });

  colorBox[0].classList.add("active");
  colorBox[0].style.outlineColor = "black";
}

// Handle pin button toggle
document.querySelector(".modal-note-pin")?.addEventListener("click", (e) => {
  e.preventDefault();
  const pinButton = e.currentTarget;
  if (pinButton.classList.contains("pinned")) {
    pinButton.classList.remove("pinned");
    pinButton.setAttribute("data-tooltip", "Pin Note");
    pinButton.children[0].classList.remove("filled");
  } else {
    pinButton.classList.add("pinned");
    pinButton.children[0].classList.add("filled");
    pinButton.setAttribute("data-tooltip", "Unpin Note");
  }
});

// Handle color selection
document.querySelectorAll(".color-box").forEach((colorBox) => {
  colorBox.addEventListener("click", () => {
    // Remove active class from all color boxes
    document.querySelectorAll(".color-box").forEach((box) => {
      box.classList.remove("active", "default");
      box.style.outlineColor = "";
    });
    // Add active class to clicked color box
    colorBox.style.outlineColor = "black";
    colorBox.classList.add("active");
  });
});

// Save button event listener
elements.noteSaveBtn.addEventListener("click", (e) => {
  e.preventDefault();
  saveNote();
});

function loadNotes(Notes) {
  const noteHistory = Notes;
  const pinnedNotes = noteHistory.filter((note) => note.pinned);
  const unpinnedNotes = noteHistory.filter((note) => !note.pinned);

  // Animate existing cards out
  const allCards = document.querySelectorAll(".cards");

  if (allCards.length > 0) {
    gsap.to(allCards, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      stagger: 0.05,
      ease: "power2.in",
      onComplete: () => renderCards(),
    });
  } else {
    renderCards();
  }

  function renderCards() {
    elements.notePinContainer.innerHTML = "";
    elements.noteContainer.innerHTML = "";

    // Render pinned notes
    if (pinnedNotes.length > 0) {
      elements.notePinContainer.style.display = "flex";
      elements.pinCardHeading.style.display = "block";

      pinnedNotes.forEach((note) => {
        elements.notePinContainer.innerHTML += loadCards(note);
      });
    } else {
      elements.pinCardHeading.style.display = "none";
      elements.notePinContainer.style.display = "none";
    }

    // Render unpinned notes
    if (unpinnedNotes.length > 0) {
      elements.noteContainer.style.display = "flex";
      elements.unPinCardHeading.style.display = "block";

      unpinnedNotes.forEach((note) => {
        elements.noteContainer.innerHTML += loadCards(note);
      });
    } else {
      elements.noteContainer.style.display = "none";
      elements.unPinCardHeading.style.display = "none";
    }

    // Animate new cards in
    const newCards = document.querySelectorAll(".cards");

    gsap.fromTo(
      newCards,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.1,
      }
    );

    // Restore functionality
    gsap.delayedCall(0.6, () => {
      pinToggle();
      editNotes();
      deleteNotes();
      coloringCardButton();
      editCardBG();
      modeSetup();
    });
  }
}

function coloringCardButton() {
  Array.from(document.querySelectorAll(".card-color-box")).forEach((el) => {
    el.style.background = el.dataset.color;
  });
}

function editCardBG() {
  let colorBtns = document.querySelectorAll(".change-color");

  // Close all card options helper function
  function closeAllCardOptions() {
    document.querySelectorAll(".card-options.active").forEach((options) => {
      options.classList.remove("active");
      if (options.parentElement) {
        // Hide the color picker (assuming second child of button)
        const changeColorBtn =
          options.parentElement.querySelector(".change-color");
        if (changeColorBtn && changeColorBtn.children[1]) {
          changeColorBtn.children[1].style.display = "none";
        }
      }
      options.children[0].setAttribute("data-tooltip", "Background Options");
    });
  }

  // Add click listener to close options on outside click
  document.addEventListener("click", (e) => {
    // If the click target is NOT inside any .card-options or .change-color button, close all
    if (
      !e.target.closest(".card-options") &&
      !e.target.closest(".change-color") &&
      !e.target.closest(".new-color-btn")
    ) {
      closeAllCardOptions();
    }
  });

  if (colorBtns.length > 0) {
    colorBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const card = btn.closest(".card") || btn.parentElement?.parentElement;

        if (!card) return;

        const cardOptions = card.querySelector(".card-options");
        const isActive = cardOptions?.classList.contains("active");

        closeAllCardOptions();

        if (!isActive) {
          // If it was not active, open it now
          if (btn.children[1]) {
            btn.children[1].style.display = "flex";
          }

          // (the rest of your code for highlighting colors etc. goes here)

          // Show color picker (assuming it's the second child)
          if (btn.children[1]) {
            btn.children[1].style.display = "flex";
          }

          // Find and show card-options with full opacity
          const card = btn.closest(".card") || btn.parentElement?.parentElement;
          if (card) {
            const cardOptions = card.querySelector(".card-options");
            if (cardOptions) {
              cardOptions.classList.add("active");
              const changeColorBtn = cardOptions.querySelector(".change-color");
              if (changeColorBtn) {
                changeColorBtn.removeAttribute("data-tooltip");
              }
            }
          }

          const currentCardColor = card
            ? getComputedStyle(card).backgroundColor
            : "";

          // Clear all outlines first
          const colorBoxes =
            btn.children[1]?.querySelectorAll(".card-color-box") || [];
          colorBoxes.forEach((colorBox) => {
            colorBox.classList.remove("default");
            colorBox.style.outline = "";
          });

          // Highlight current color if it exists
          if (currentCardColor) {
            colorBoxes.forEach((colorBox) => {
              const boxColor = colorBox.dataset.color;
              if (boxColor == currentCardColor)
                colorBox.style.outlineColor = "black";
              if (
                currentCardColor == "rgb(255, 255, 255)" &&
                boxColor == "black"
              )
                colorBox.style.outlineColor = "black";
            });
          }

          // Add click handlers to color boxes (only if not already added)
          colorBoxes.forEach((colorBox) => {
            if (!colorBox.hasAttribute("data-handler-attached")) {
              colorBox.setAttribute("data-handler-attached", "true");
              colorBox.addEventListener("click", (e) => {
                e.stopPropagation();

                const selectedColor = colorBox.dataset.color;
                if (selectedColor && card) {
                  // Apply the new background color to the card
                  card.style.backgroundColor =
                    selectedColor == "black" ? "white" : selectedColor;

                  // Clear all outlinesx
                  colorBoxes.forEach((box) => (box.style.outline = ""));

                  // Highlight the selected color box
                  colorBox.style.outline = `1px solid black`;

                  let noteHistory = readLocalStorageNotes();
                  let currentIndex = noteHistory.findIndex(
                    (el) => el.id === Number(card.dataset.id)
                  );

                  noteHistory[currentIndex].color = selectedColor;
                  localStorage.setItem("notes", JSON.stringify(noteHistory));
                }
              });
            }
          });
        } else {
          // If it was active, now it's closed so hide color picker
          if (btn.children[1]) {
            btn.children[1].style.display = "none";
          }
        }
      });
    });
  }
}

function deleteNotes() {
  let noteHistory = readLocalStorageNotes();
  let deleteBtn = Array.from(document.querySelectorAll(".delete-card"));
  deleteBtn.forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      let id = el.parentElement.closest(".cards").dataset.id;
      let currentIndex = noteHistory.findIndex((el) => el.id == id);

      elements.deleteModal.style.opacity = "100%";
      elements.deleteModal.style.pointerEvents = "all";
      document.body.classList.add("modal-open");

      let buttons = Array.from(
        elements.deleteModal.querySelectorAll(".del-btn")
      );

      buttons.forEach((button) => {
        button.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          if (button.dataset.action == "true") {
            noteHistory.splice(currentIndex, 1);
            localStorage.setItem("notes", JSON.stringify(noteHistory));
            elements.deleteModal.style.opacity = "0";
            elements.deleteModal.style.pointerEvents = "none";
            document.body.classList.remove("modal-open");
            loadNotes(readLocalStorageNotes());
          } else {
            elements.deleteModal.style.opacity = "0";
            elements.deleteModal.style.pointerEvents = "none";
            document.body.classList.remove("modal-open");
          }
        });
      });
    });
  });
}

function pinToggle() {
  let pinBtn = document.querySelectorAll(".card-pin");
  pinBtn.forEach((el) => {
    el.replaceWith(el.cloneNode(true));
  });

  // Re-select after cloning
  pinBtn = document.querySelectorAll(".card-pin");
  pinBtn.forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      let noteHistory = readLocalStorageNotes();
      let noteId = el.parentElement.closest(".cards").dataset.id;
      let currentEl = noteHistory.findIndex((note) => note.id == noteId);

      if (currentEl !== -1) {
        // Toggle pin status
        noteHistory[currentEl].pinned = !noteHistory[currentEl].pinned;
        noteHistory[currentEl].time.updated = new Date().toISOString();
        localStorage.setItem("notes", JSON.stringify(noteHistory));
        loadNotes(readLocalStorageNotes()); // Reload to move card to correct section
      }
    });
  });
}

function editNotes() {
  let noteHistory = readLocalStorageNotes();
  let cardOptions = Array.from(document.querySelectorAll(".cards"));

  cardOptions.forEach((card) => {
    let currentEl = noteHistory.find((el) => card.dataset.id == el.id);
    const id = card.dataset.id;
    const titleEl = card.querySelector(".card-title").querySelector("h1");
    const contentEl = card.querySelector(".card-content");
    const cardClose = document.querySelector(".view-card-close");
    const editModal = elements.editViewModal;
    const viewTitle = elements.viewTitle;
    const viewContent = elements.viewContent;

    const editTime = document.querySelector(".edited-date span");
    editTime.innerHTML = formatNoteTime(
      currentEl.time.created,
      currentEl.time.updated
    );
    editTime.setAttribute(
      "data-tooltip",
      formatNoteTime(currentEl.time.created)
    );

    const handleEdit = (e) => {
      // Show modal
      editModal.classList.add("active");
      document.body.classList.add("modal-open");

      // Get pin elements
      let pinButton = document.querySelector(".view-card-pin");
      let pinBtn = card.querySelector(".card-pin");

      // Sync modal pin button with current card pin state
      const isPinned = pinBtn.classList.contains("pinned");
      pinButton.classList.toggle("pinned", isPinned);
      pinButton.children[0].classList.toggle("filled", isPinned);
      pinButton.setAttribute(
        "data-tooltip",
        isPinned ? "Unpin Note" : "Pin Note"
      );

      // Remove any previous click listeners on modal pin button
      const newPinButton = pinButton.cloneNode(true);
      pinButton.parentNode.replaceChild(newPinButton, pinButton);

      // Add fresh click listener
      newPinButton.addEventListener("click", (e) => {
        e.preventDefault();
        const wasPinned = pinBtn.classList.contains("pinned");

        // Toggle class on original and modal buttons
        pinBtn.classList.toggle("pinned", !wasPinned);
        newPinButton.classList.toggle("pinned", !wasPinned);
        newPinButton.children[0].classList.toggle("filled", !wasPinned);
        newPinButton.setAttribute(
          "data-tooltip",
          !wasPinned ? "Unpin Note" : "Pin Note"
        );
      });

      // Prefill modal inputs
      viewTitle.value = titleEl.textContent.trim();
      viewContent.value = contentEl.textContent.trim();

      setTimeout(() => {
        viewContent.focus();
        if (viewContent.tagName.toLowerCase() === "textarea") {
          viewContent.scrollTop = viewContent.scrollHeight; // Scroll to bottom
          const contentLength = viewContent.value.length;
          viewContent.setSelectionRange(contentLength, contentLength);
        }
      }, 100);

      // Current card background color
      const currentCardColor = card.style.background;

      // Color boxes inside the modal
      const colorBoxes = Array.from(editModal.querySelectorAll(".color-box"));

      // Function to update active color highlight
      function updateActiveColorBoxes(selectedColor) {
        colorBoxes.forEach((colorBox) => {
          const boxColor = colorBox.dataset.color;
          if (boxColor === selectedColor) {
            colorBox.classList.add("active");
            colorBox.style.outlineColor = "black";
          } else {
            colorBox.classList.remove("active", "default");
            colorBox.style.outlineColor = "";
          }
        });

        if (
          selectedColor === "white" ||
          selectedColor === "#ffffff" ||
          selectedColor === "rgb(255, 255, 255)"
        ) {
          const firstBox = colorBoxes[0];
          if (firstBox) {
            firstBox.style.outlineColor = "black";
          }
        }
      }

      // Initialize highlight to current card color
      updateActiveColorBoxes(currentCardColor);

      // Clear previous onclick handlers
      colorBoxes.forEach((colorBox) => {
        colorBox.onclick = null;
      });

      // Add click handlers for color selection
      colorBoxes.forEach((colorBox) => {
        colorBox.onclick = () => {
          updateActiveColorBoxes(colorBox.dataset.color);

          const selectedColor = colorBox.dataset.color;
          const color = selectedColor === "black" ? "white" : selectedColor;

          card.style.background = color;

          let noteHistory = readLocalStorageNotes();
          let foundIndex = noteHistory.findIndex((el) => el.id == id);
          if (foundIndex !== -1) {
            noteHistory[foundIndex].color = color;
            noteHistory[foundIndex].time.updated = new Date().toISOString();
            localStorage.setItem("notes", JSON.stringify(noteHistory));
          }
        };
      });

      // Save handler function (centralized)
      const saveHandler = () => {
        const newTitle = viewTitle.value.trim();
        const newContent = viewContent.value.trim();
        const isPinned = card
          .querySelector(".card-pin")
          .classList.contains("pinned");

        let noteHistory = readLocalStorageNotes();
        let foundIndex = noteHistory.findIndex((el) => el.id == id);

        if (foundIndex !== -1) {
          if (isPinned != noteHistory[foundIndex].pinned) {
            noteHistory[foundIndex].title = newTitle;
            noteHistory[foundIndex].content = newContent;
            noteHistory[foundIndex].pinned = isPinned;
            noteHistory[foundIndex].time.updated = new Date().toISOString();
            localStorage.setItem("notes", JSON.stringify(noteHistory));
            loadNotes(readLocalStorageNotes());
          } else {
            noteHistory[foundIndex].title = newTitle;
            noteHistory[foundIndex].content = newContent;
            noteHistory[foundIndex].pinned = isPinned;
            noteHistory[foundIndex].time.updated = new Date().toISOString();
            localStorage.setItem("notes", JSON.stringify(noteHistory));

            const titleEl = card.querySelector(".card-title h1");
            const contentEl = card.querySelector(".card-content");
            if (titleEl) titleEl.textContent = newTitle;
            if (contentEl) contentEl.textContent = newContent;
          }
        }

        closeModal();
      };

      // Close modal handler (centralized)
      function closeModal() {
        editModal.classList.remove("active");
        document.body.classList.remove("modal-open");

        // Remove all event listeners
        cardClose.removeEventListener("click", onClose);
        cardClose.removeEventListener("click", saveHandler);
        editModal.removeEventListener("click", handleOutsideClick);
      }

      // Close without saving
      function onClose() {
        closeModal();
      }

      // Handle clicks outside the modal content
      function handleOutsideClick(e) {
        // Check if the click is on the modal backdrop (not on modal content)
        // You'll need to adjust the selector based on your modal structure
        const modalContent =
          editModal.querySelector(".modal-content") ||
          editModal.querySelector(".modal-body") ||
          editModal.querySelector('[class*="content"]');

        // If there's no specific modal content selector, you can use this approach:
        // Check if the clicked element is the modal itself (backdrop)
        if (e.target === editModal) {
          saveHandler(); // Save and close
        }

        // Alternative: If you have a specific modal content container
        // if (modalContent && !modalContent.contains(e.target) && e.target === editModal) {
        //   saveHandler();
        // }
      }

      // Remove old listeners to prevent duplicates
      cardClose.removeEventListener("click", saveHandler);
      cardClose.removeEventListener("click", onClose);
      editModal.removeEventListener("click", handleOutsideClick);

      // Add fresh listeners
      cardClose.addEventListener("click", saveHandler);
      editModal.addEventListener("click", handleOutsideClick);

      // Optional: Add Escape key listener to close modal
      function handleEscapeKey(e) {
        if (e.key === "Escape") {
          saveHandler(); // Save and close on Escape
          document.removeEventListener("keydown", handleEscapeKey);
        }
      }
      document.addEventListener("keydown", handleEscapeKey);
    };

    // Add the event listener to card
    if (card) card.addEventListener("click", (e) => handleEdit(e));
  });
}

// Load Cards
function loadCards(card) {
  return `
    <div class="cards " data-id ="${card.id}"  style="background: ${
    card.color == "black" ? "white" : card.color
  };">
              <div class="card-title">
                <h1>${escapeHTML(card.title)}</h1>
                <button class="card-pin  ${
                  card.pinned ? "pinned" : ""
                }" data-tooltip="${card.pinned ? "Unpin Note" : "Pin Note"}">
                  <span class="material-symbols-outlined toggle-icon ${
                    card.pinned ? "filled" : ""
                  }"> keep </span>
                </button>
              </div>
              <div class="card-content">
                ${escapeHTML(card.content)}
              </div>
              <div class="card-options">
               <button class="card-btn change-color" data-tooltip="Background Options">
                  <span class="material-symbols-outlined"> palette </span>

                  <div class="new-color-btn">
                    <div class="card-color-box default" data-color="black" data-tooltip="Default">
                      <span class="material-symbols-outlined"> format_color_reset </span>
                    </div>
                    <div
                      class="card-color-box"
                      data-color="rgb(255, 218, 218)"
                    ></div>
                    <div
                      class="card-color-box"
                      data-color="rgb(140, 255, 182)"
                    ></div>
                    <div
                      class="card-color-box"
                      data-color="rgb(140, 224, 255)"
                    ></div>
                  </div>
                </button>
                <button class="card-btn delete-card" data-tooltip="Delete Note">
                  <span class="material-symbols-outlined"> delete </span>
                </button>
              </div>
            </div>`;
}

function formatNoteTime(createdAt, updatedAt, showYear = true) {
  // If only createdAt is passed, return created time
  if (createdAt && !updatedAt) {
    const created = new Date(createdAt);
    const month = created.toLocaleString("default", { month: "short" });
    const day = created.getDate();
    const year = created.getFullYear();

    if (showYear) {
      return `Created ${month} ${day}, ${year}`;
    }
    return `Created ${month} ${day}`;
  }

  // If only updatedAt is passed, return updated time
  if (!createdAt && updatedAt) {
    const updated = new Date(updatedAt);
    const month = updated.toLocaleString("default", { month: "short" });
    const day = updated.getDate();
    const year = updated.getFullYear();

    if (showYear) {
      return `Edited ${month} ${day}, ${year}`;
    }
    return `Edited ${month} ${day}`;
  }

  // If both are passed, check if they're different
  if (createdAt && updatedAt) {
    const created = new Date(createdAt);
    const updated = new Date(updatedAt);

    // If not edited, return created time
    if (created.getTime() === updated.getTime()) {
      const month = created.toLocaleString("default", { month: "short" });
      const day = created.getDate();
      const year = created.getFullYear();

      if (showYear) {
        return `Created ${month} ${day}, ${year}`;
      }
      return `Created ${month} ${day}`;
    }

    // If edited, return updated time
    const month = updated.toLocaleString("default", { month: "short" });
    const day = updated.getDate();
    const year = updated.getFullYear();

    if (showYear) {
      return `Edited ${month} ${day}, ${year}`;
    }
    return `Edited ${month} ${day}`;
  }

  // If neither is passed, return empty string
  return "";
}

// Device Detection
function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

if (isMobileDevice()) {
  document.body.classList.add("mobile-device");
  console.log("Mobile device detected");
} else {
  console.log("Desktop device detected");
}
