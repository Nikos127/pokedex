const API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=20&offset=0';
let allCharacters = [];
let currentPage = 1;
let hasNextPage = true;

function init() {
    loadCharacters();
    setupEventListeners();
}

async function loadCharacters(page = 1) {
    const offset = (page - 1) * 20;
    const response = await fetch(API_URL.replace('offset=0', `offset=${offset}`));
    const data = await response.json();

    // Lade die detaillierten Daten für jedes Pokémon
    for (let i = 0; i < data.results.length; i++) {
        const detailResponse = await fetch(data.results[i].url);
        const detailData = await detailResponse.json();
        data.results[i] = detailData;
    }

    if (page === 1) {
        allCharacters = data.results;
    } else {
        allCharacters = allCharacters.concat(data.results);
    }

    hasNextPage = data.next !== null;
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
        console.log(characters[i].types[0].type.name)
    }
}

function createCard(character) {
    return `
        <div class="card">
            <div class="name">${character.name}</div>
            <button class="${character.types[0].type.name}"><img src="${character.sprites.other.home.front_default}" alt="${character.name}"></button>
            <div class="type">${character.types[0]?.type.name || 'unknown'} <span>${character.types[1]?.type.name || 'none'}</span></div>
        </div>
    `;
}