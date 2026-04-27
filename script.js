const API_URL = 'https://rickandmortyapi.com/api/character';
let allCharacters = [];
let currentPage = 1;
let hasNextPage = true;

function init() {
    loadCharacters();
    setupEventListeners();
}

async function loadCharacters(page = 1) {
    const response = await fetch(`${API_URL}?page=${page}`);
    const data = await response.json();

    if (page === 1) {
        allCharacters = data.results;
    } else {
        allCharacters = allCharacters.concat(data.results);
    }

    displayCharacters(allCharacters);
}

function setupEventListeners() {
    document.getElementById('search').addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        const filtered = searchTerm
            ? allCharacters.filter(character => character.name.toLowerCase().includes(searchTerm))
            : allCharacters;
        displayCharacters(filtered);
    });

    document.querySelector('.loadMore button').addEventListener('click', () => {
        if (hasNextPage) {
            currentPage++;
            loadCharacters(currentPage);
        }
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