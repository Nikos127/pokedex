const pokedexAPI = 'https://pokeapi.co/api/v2/pokemon?limit=30&offset=0';
const loadingTime = 1500;
const pokedexStorageKey = 'pokedexData';
let allCharacters = [];
let currentPage = 1;
let hasNextPage = true;
let isLoading = false;

function init() {
    const savedData = loadFromLocalStorage();
    if (savedData) {
        allCharacters = savedData.allCharacters;
        currentPage = savedData.currentPage;
        hasNextPage = savedData.hasNextPage;
        displayCharacters(allCharacters);
    } else {
        loadCharacters();
    }

    setupEventListeners();
}

async function loadCharacters(page = 1) {
    const loadingStartedAt = Date.now();
    setLoadingState(true);
    try {
        const offset = (page - 1) * 30;
        const response = await fetch(pokedexAPI.replace('offset=0', `offset=${offset}`));
        const data = await response.json();
        await loadCharacterDetails(data.results);

        if (page === 1) {
            allCharacters = data.results;
        } else {
            allCharacters = allCharacters.concat(data.results);
        }

        hasNextPage = data.next !== null;
        displayCharacters(allCharacters);
        saveToLocalStorage();
    } finally {
        const elapsedTime = Date.now() - loadingStartedAt;
        if (elapsedTime < loadingTime) {
            await delay(loadingTime - elapsedTime);
        }
        setLoadingState(false);
    }
}

async function loadCharacterDetails(results) {
    for (let i = 0; i < results.length; i++) {
        const detailResponse = await fetch(results[i].url);
        const detailData = await detailResponse.json();
        results[i] = detailData;
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function toStorageCharacter(character) {
    let types = [];
    for (let i = 0; i < character.types.length; i++) {
        types.push({ type: { name: character.types[i].type.name } });
    }

    let stats = [];
    for (let i = 0; i < character.stats.length; i++) {
        stats.push({
            base_stat: character.stats[i].base_stat,
            stat: { name: character.stats[i].stat.name }
        });
    }

    return {
        id: character.id,
        name: character.name,
        types,
        stats,
        sprites: {
            other: {
                home: {
                    front_default: character.sprites.other.home.front_default
                }
            }
        }
    };
}

function saveToLocalStorage() {
    let compactCharacters = [];
    for (let i = 0; i < allCharacters.length; i++) {
        compactCharacters.push(toStorageCharacter(allCharacters[i]));
    }

    const saveData = {
        allCharacters: compactCharacters,
        currentPage,
        hasNextPage
    };
    localStorage.setItem(pokedexStorageKey, JSON.stringify(saveData));
}

function loadFromLocalStorage() {
    const loadData = localStorage.getItem(pokedexStorageKey);
    return loadData ? JSON.parse(loadData) : null;
}

function setLoadingState(loading) {
    isLoading = loading;
    const loader = document.getElementById('loadSpinner');
    const loadMoreButton = document.querySelector('.loadMore button');
    loader.hidden = !loading;
    loadMoreButton.disabled = loading || !hasNextPage;
}

function setupEventListeners() {
    const searchInput = document.getElementById('search');
    const loadMoreButton = document.querySelector('.loadMore button');
    const dialog = document.getElementById('pokeDetailsDialog');

    searchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase().trim();
        if (searchTerm.length < 3) {
            displayCharacters(allCharacters, false);
            return;
        }

        displayCharacters(filterCharacters(searchTerm), true);
    });

    loadMoreButton.addEventListener('click', () => {
        if (hasNextPage && !isLoading) {
            currentPage++;
            loadCharacters(currentPage);
        }
    });

    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) {
            dialog.close();
        }
    });
}

function filterCharacters(searchTerm) {
    let filtered = [];
    for (let i = 0; i < allCharacters.length; i++) {
        if (allCharacters[i].name.toLowerCase().includes(searchTerm)) {
            filtered.push(allCharacters[i]);
        }
    }
    return filtered;
}

function getTypeIconUrl(typeName) {
    const typeIds = {
        normal: 1, fighting: 2, flying: 3, poison: 4, ground: 5, rock: 6,
        bug: 7, ghost: 8, steel: 9, fire: 10, water: 11, grass: 12,
        electric: 13, psychic: 14, ice: 15, dragon: 16, dark: 17, fairy: 18
    };

    const typeId = typeIds[typeName] || 1;
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-ix/scarlet-violet/small/${typeId}.png`;
}

function createDialogTypeHtml(character) {
    let html = '';
    for (let i = 0; i < character.types.length; i++) {
        const typeName = character.types[i].type.name;
        html += `<span><img src="${getTypeIconUrl(typeName)}" alt="${typeName}" class="type-icon"> ${typeName}</span>`;
    }
    return html;
}

function createDialogStatsHtml(character) {
    let html = '';
    for (let i = 0; i < character.stats.length; i++) {
        const statName = character.stats[i].stat.name;
        const statValue = character.stats[i].base_stat;
        html += `
            <div class="dialog-stat-row">
                <span>${statName}</span>
                <span>${statValue}</span>
            </div>
        `;
    }
    return html;
}

function createDialogTemplate(character) {
    const firstType = character.types[0]?.type.name || 'normal';
    return `
         <div class="dialog-card ${firstType}">
            <h2>${character.name}</h2>
            <img src="${character.sprites.other.home.front_default}" alt="${character.name}">
            <div class="dialog-types">${createDialogTypeHtml(character)}</div>
            <div class="dialog-stats">${createDialogStatsHtml(character)}</div>
            <div class="navigationArrows">
                <button onclick="openDialogByPrevId(${character.id})" style="rotate: 180deg;"><img src="./images/arrow.png" alt=""></button>
                <button onclick="openDialogByNextId(${character.id})"><img src="./images/arrow.png" alt=""></button>
            </div>
    `;
}

function findCharacterById(characterId) {
    for (let i = 0; i < allCharacters.length; i++) {
        if (allCharacters[i].id === characterId) {
            return allCharacters[i];
        }
    }
    return null;
}

function findCharacterByPrevId(characterId) {
    for (let i = 0; i < allCharacters.length; i++) {
        if (allCharacters[i].id === characterId - 1) {
            return allCharacters[i];
        }
    }

    return null;
}

function findCharacterByNextId(characterId) {
    for (let i = 0; i < allCharacters.length; i++) {
        if (allCharacters[i].id === characterId + 1) {
            return allCharacters[i];
        }
    }
    return null;
}

function openDialogById(characterId) {
    const selectedCharacter = findCharacterById(characterId);
    const dialog = document.getElementById('pokeDetailsDialog');
    const dialogContent = document.getElementById('dialogContent');
    dialogContent.innerHTML = createDialogTemplate(selectedCharacter);
    dialog.showModal();
}

function openDialogByPrevId(characterId) {
    const selectedCharacter = findCharacterByPrevId(characterId);
    const dialog = document.getElementById('pokeDetailsDialog');
    const dialogContent = document.getElementById('dialogContent');
    if (characterId <= 1) {
        return
    }
    dialogContent.innerHTML = createDialogTemplate(selectedCharacter);
}

function openDialogByNextId(characterId) {
    const selectedCharacter = findCharacterByNextId(characterId);
    const dialog = document.getElementById('pokeDetailsDialog');
    const dialogContent = document.getElementById('dialogContent');
    if (characterId >= allCharacters.length) {
        return
    }
    dialogContent.innerHTML = createDialogTemplate(selectedCharacter);
}

function closeDialog() {
    const dialog = document.getElementById('pokeDetailsDialog');
    dialog.close();
}

function displayCharacters(characters, isSearchResult = false) {
    const cards = document.getElementById('cards');
    const loadMoreButton = document.querySelector('.loadMore button');

    if (characters.length === 0) {
        loadMoreButton.disabled = true;
        cards.innerHTML = noResultsHtml();
        return;
    }

    cards.innerHTML = createCardsHtml(characters);
    loadMoreButton.disabled = isSearchResult || isLoading || !hasNextPage;
}

function noResultsHtml() {
    return `
        <div class="no-results">
            <h3>No match in the Pokedex</h3>
            <p>This Pokemon is hiding really well right now.</p>
            <span>Try a different name or just the first few letters.</span>
        </div>
    `;
}

function createCardsHtml(characters) {
    let html = '';
    for (let i = 0; i < characters.length; i++) {
        html += createCard(characters[i]);
    }
    return html;
}

function createCard(character) {
    const firstType = character.types[0]?.type.name || 'unknown';
    const secondType = character.types[1]?.type.name || '';

    let typeHtml = `<img src="${getTypeIconUrl(firstType)}" alt="${firstType}" class="type-icon"> ${firstType}`;
    if (secondType) {
        typeHtml += ` <img src="${getTypeIconUrl(secondType)}" alt="${secondType}" class="type-icon"> ${secondType}`;
    }

    return `
        <div class="card">
            <div class="${firstType} border">${character.name}</div>
            <button onclick="openDialogById(${character.id})" class="${firstType}"><img src="${character.sprites.other.home.front_default}" alt="${character.name}"></button>
            <div class="type">${typeHtml}</div>
        </div>
    `;
}
