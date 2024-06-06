const uri = 'api/glossaryitems';
let glossary = [];
let isReturningToMainMenu = false;

// HTTP GET request is sent to the api/glossaryitems route
// When the web API returns a successful status code...
// ... the _displayItems function is called, meaning each item in the array parameter accepted by _displayItems is added to a table with Edit and Delete buttons
// If the web API request fails, an error is logged to the browser's console instead
function getItems() {
  fetch(uri)
    .then(response => response.json())
    .then(data => _displayItems(data))
    .catch(error => console.error('Unable to get items.', error));
}

document.getElementById('addForm').addEventListener('submit', function(event) {
  event.preventDefault();
  addItem();
});

// HTTP POST request is sent to the api/glossaryitems route
function addItem() {
  const addTermTextbox = document.getElementById('add-term');  
  const addDefinitionTextbox = document.getElementById('add-definition');

  const term = addTermTextbox.value.trim();
  const definition = addDefinitionTextbox.value.trim();

  // Regular expression to check for alphabetic characters
  const regex = /^[A-Za-z\s]+$/;

  // Checks to see if either the term or definition are empty
  if (!definition || !term) {
    alert('Term and Definition cannot be empty. Please try again.');
    console.warn('Attempted to add empty term or definition. Please try again.');
    // Prevents the form from being submitted into the glossary
    return;
  }

  // Checks to see if the term or definition contains only alphabetic characters
  if (!regex.test(term) || !regex.test(definition)) {
    alert('Term and Definition must contain only alphabetic characters. Please try again.');
    console.warn('Attempted to add invalid term or definition. Please try again.');
    // Prevents the form from being submitted into the glossary
    return;
  }

  // Fetches all glossary items to check for duplicate terms
  fetch(uri)
    .then(response => response.json())
    .then(data => {
      const existingTerm = data.find(item => item.term.toLowerCase() === term.toLowerCase());

      // If the term already exists, show an alert and prevent adding the new term
      if (existingTerm) {
        alert('This term already exists in the glossary. Please enter a unique term.');
        console.warn('Attempted to add a duplicate term. Please try again.');
        return;
      }

      // 'item' variable is declared to construct an object literal representation of the glossary item
      const item = {
        term: term,
        definition: definition
      };

      // If the web API returns a successful status code, getItems function is called to update the HTML table
      // If the web API request fails, an error is logged to the browser's console
      fetch(uri, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Network response was not ok.');
        })
        .then(() => {
          // Navigates to the "View Glossary" page
          showSection('glossarySection');
          // Clears input fields
          addTermTextbox.value = '';
          addDefinitionTextbox.value = '';
          // Shows success alert
          alert('Term successfully added!');
        })
        .catch(error => console.error('Unable to add item.', error));
    })
    .catch(error => console.error('Unable to check for existing terms.', error));
}

function clearSearch() {
  const searchInput = document.getElementById('search-term');
  const searchResult = document.getElementById('search-result');

  // Clears search input and hides search results
  searchInput.value = '';
  searchResult.style.display = 'none';
}

function searchItem() {
    const searchInput = document.getElementById('search-term');
    const searchValue = searchInput.value.trim();
    const searchResult = document.getElementById('search-result');

    // Skips validation if returning to main menu
    if (isReturningToMainMenu) {
      // Resets the flag
      isReturningToMainMenu = false;
      return;
  }

    // Checks to see if term is empty
    if (!searchValue) {
        alert('Term cannot be empty. Please try again.');
        console.warn('Attempted to search for an empty term. Please try again.');
        // Prevents the search happening if it's empty
        return;
    }

    // Fetches the glossary items
    fetch(uri)
        .then(response => response.json())
        .then(data => {
            // Finds the item with matching term
            const foundItem = data.find(item => item.term.toLowerCase() === searchValue.toLowerCase());

            // If the item is found, display its term and definition
            if (foundItem) { 
                searchResult.innerHTML = `
                    <h3>Term: ${foundItem.term}</h3>
                    <p>Definition: ${foundItem.definition}</p>
                    <button onclick="displayEditForm(${foundItem.id}, '${foundItem.term}', '${foundItem.definition}')">Edit</button>
                    <button onclick="deleteItem(${foundItem.id})">Delete</button>
                `;
                searchResult.style.display = 'block';
            } else {
                alert('Term not found. Please try another term.');
                console.warn('Term not found. Please try another term.');
                // Clears the input field
                searchInput.value = '';
                // Hides the search result box if no term is found
                searchResult.style.display = 'none';
            }
        })
        .catch(error => {
          console.error('Unable to search for item.', error);
          // Hides the search result box on error
          searchResult.style.display = 'none';
        });
}

function deleteItem(id) {
  fetch(`${uri}/${id}`, {
    method: 'DELETE'
  })
  .then(() => {
    // Shows success alert
    alert('Term deleted successfully.');
    // Clears the search result box
    const searchResult = document.getElementById('search-result');
    searchResult.innerHTML = '';
    searchResult.style.display = 'none';
    // Clears the search input field
    document.getElementById('search-term').value = '';
    // Refreshes glossary display
    getItems();
  })
  .catch(error => console.error('Unable to delete item.', error));
}

// Function to hide the glossary section and only show the edit form
function displayEditForm(id, term, definition) {
  const termInput = document.getElementById('edit-term');
  const definitionInput = document.getElementById('edit-definition');

  // Sets the input values to the passed term and definition parameters
  termInput.value = term;
  definitionInput.value = definition;

  // Shows edit form section
  document.getElementById('editForm').style.display = 'block';

  // Hides all sections except the edit form
  document.getElementById('mainMenu').style.display = 'none';
  document.getElementById('addSection').style.display = 'none';
  document.getElementById('searchSection').style.display = 'none';
  document.getElementById('glossarySection').style.display = 'none';

  // Populates the edit form fields with the term and definition
  document.getElementById('edit-id').value = id;
  document.getElementById('edit-term').value = term;
  document.getElementById('edit-definition').value = definition;
}

// Similar to adding one, however it's PUT instead of POST, and the route is suffixed with the unique identifier of the item to update, eg. api/glossaryitems/1
// HTTP PUT
function updateItem() {
  const itemId = document.getElementById('edit-id').value;
  const termInput = document.getElementById('edit-term');
  const definitionInput = document.getElementById('edit-definition');

  const term = termInput.value.trim();
  const definition = definitionInput.value.trim();

  // Regular expression to check for alphabetic characters
  const regex = /^[A-Za-z\s]+$/;
  
  // Checks to see if either the term or definition are empty
  if (!definition || !term) {
    alert('Term and Definition cannot be empty. Please try again.');
    console.warn('Attempted to add empty term or definition. Please try again.');
    // Prevents the form from being submitted into the glossary
    return;
  }

  // Checks to see if the term or definition contains only alphabetic characters
  if (!regex.test(term) || !regex.test(definition)) {
    alert('Term and Definition must contain only alphabetic characters. Please try again.');
    console.warn('Attempted to add invalid term or definition. Please try again.');
    // Prevents the form from being submitted into the glossary
    return false;
  }

  // Fetches all glossary items to check for duplicate terms
  fetch(uri)
    .then(response => response.json())
    .then(data => {
      const existingTerm = data.find(item => item.term.toLowerCase() === term.toLowerCase() && item.id !== parseInt(itemId, 10));

      // If the term already exists, show an alert and prevent updating the term
      if (existingTerm) {
        alert('This term already exists in the glossary. Please enter a unique term.');
        console.warn('Attempted to update to a duplicate term. Please try again.');
        return false;
      }
      
      const item = {
        id: parseInt(itemId, 10),
        term: term,
        definition: definition
      };

      fetch(`${uri}/${itemId}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      })
      .then(() => {
        getItems();
        closeInput();
        // Shows success alert
        alert('Term successfully updated!');
        return true;
      })
      .catch(error => {
        console.error('Unable to update item.', error);
        return false;
      });
    })
    .catch(error => {
      console.error('Unable to check for existing terms.', error);
      return false;
    });
}

function closeInput() {
  // Hides edit form section
  document.getElementById('editForm').style.display = 'none';

  // Shows glossary section
  document.getElementById('glossarySection').style.display = 'block';
}

function _displayCount(itemCount) {
  const term = (itemCount === 1) ? 'item' : 'items';

  document.getElementById('counter').innerText = `Glossary: ${itemCount} ${term}`;
}

function _displayItems(data) {
  const tBody = document.getElementById('glossary');
  tBody.innerHTML = '';

  _displayCount(data.length);

  const button = document.createElement('button');

  data.forEach(item => {
    let editButton = button.cloneNode(false);
    editButton.innerText = 'Edit';
    editButton.setAttribute('onclick', `displayEditForm(${item.id}, '${item.term}', '${item.definition}')`);

    let deleteButton = button.cloneNode(false);
    deleteButton.innerText = 'Delete';
    deleteButton.setAttribute('onclick', `deleteItem(${item.id})`);

    let tr = tBody.insertRow();

    let td1 = tr.insertCell(0);
    let termNode = document.createTextNode(item.term);
    td1.appendChild(termNode);
    
    let td2 = tr.insertCell(1);
    let definitionNode = document.createTextNode(item.definition);
    td2.appendChild(definitionNode);

    let td3 = tr.insertCell(2);
    td3.appendChild(editButton);

    let td4 = tr.insertCell(3);
    td4.appendChild(deleteButton);
  });

  glossary = data;
}

// Function to show specific sections based on button click
function showSection(sectionId) {
    // Hides all the sections
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('addSection').style.display = 'none';
    document.getElementById('editForm').style.display = 'none';
    document.getElementById('searchSection').style.display = 'none';
    document.getElementById('glossarySection').style.display = 'none';
    
    // Shows the selected section
    document.getElementById(sectionId).style.display = 'block';
    
    // If showing the glossary section, fetch items
    if (sectionId == 'glossarySection') {
        getItems();
    }
}

// Function to return to the main menu
function returnToMainMenu() {
    // Set the flag to indicate returning to main menu
    isReturningToMainMenu = true;

    // Clears the input fields without triggering validation
    document.getElementById('add-term').value = '';
    document.getElementById('add-definition').value = '';

    // Hides all the sections
    document.getElementById('addSection').style.display = 'none';
    document.getElementById('editForm').style.display = 'none';
    document.getElementById('searchSection').style.display = 'none';
    document.getElementById('glossarySection').style.display = 'none';

    // Clears the search form and results
    clearSearch();

    // Shows the main menu
    document.getElementById('mainMenu').style.display = 'block';
}

// Initially displays the main menu
showSection('mainMenu');
