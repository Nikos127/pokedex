const API_URL = 'https://rickandmortyapi.com/api/character';
let allCharacters = [];

function init() {
    loadCharacters();
    setupSearch();
}

async function loadCharacters() {
    const response = await fetch(API_URL);
    const data = await response.json();
    allCharacters = data.results;
    displayCharacters(allCharacters);
}

function setupSearch() {
    document.getElementById('search').addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        const filtered = searchTerm
            ? allCharacters.filter(character => character.name.toLowerCase().includes(searchTerm))
            : allCharacters;
        displayCharacters(filtered);
    });
}

function displayCharacters(characters) {
    document.getElementById('cards').innerHTML = '';
    for (let i = 0; i < characters.length; i++) {
        document.getElementById('cards').innerHTML += createCard(characters[i]);
    }
}

function createCard(character) {
    return `
        <div class="card">
            <div class="name">${character.name}</div>
            <button><img src="${character.image}" alt="${character.name}"></button>
            <div class="speciesStatus">${character.species} <span>Status: ${character.status}</span></div>
        </div>
    `;
}