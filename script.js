const API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=50&offset=0';
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

function getTypeIconUrl(typeName, isSmall = false) {
    const typeIds = {
        normal: 1, fighting: 2, flying: 3, poison: 4, ground: 5, rock: 6,
        bug: 7, ghost: 8, steel: 9, fire: 10, water: 11, grass: 12,
        electric: 13, psychic: 14, ice: 15, dragon: 16, dark: 17, fairy: 18
    };

    const typeId = typeIds[typeName] || 1;
    const sizePath = isSmall ? 'small/' : '';
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-ix/scarlet-violet/${sizePath}${typeId}.png`;
}

function displayCharacters(characters) {
    let html = '';
    for (let i = 0; i < characters.length; i++) {
        html += createCard(characters[i]);
        console.log(characters[i].types[0].type.name)
    }
    document.getElementById('cards').innerHTML = html;
}

function createCard(character) {
    const primaryType = character.types[0]?.type.name || 'unknown';
    const secondaryType = character.types[1]?.type.name || '';

    let typeHtml = `<img src="${getTypeIconUrl(primaryType, true)}" alt="${primaryType}" class="type-icon"> ${primaryType}`;
    if (secondaryType) {
        typeHtml += ` <img src="${getTypeIconUrl(secondaryType, true)}" alt="${secondaryType}" class="type-icon"> ${secondaryType}`;
    }

    return `
        <div class="card">
            <div class="${character.types[0]?.type.name} border">${character.name}</div>
            <button class="${primaryType}"><img src="${character.sprites.other.home.front_default}" alt="${character.name}"></button>
            <div class="type">${typeHtml}</div>
        </div>
    `;
}